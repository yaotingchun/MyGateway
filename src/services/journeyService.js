/**
 * Application Journey & Submission Service
 * Backed by Firebase Firestore with offline cache fallback
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase.js';

const LOCAL_STORAGE_JOURNEYS_KEY = 'mygateway_user_journeys_v1';
const LOCAL_STORAGE_APPS_KEY = 'mygateway_user_applications_v1';

/**
 * Get cached local journeys
 */
function getLocalJourneys() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_JOURNEYS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

/**
 * Save cached local journeys
 */
function saveLocalJourneys(journeys) {
  try {
    localStorage.setItem(LOCAL_STORAGE_JOURNEYS_KEY, JSON.stringify(journeys));
  } catch (_) {}
}

/**
 * Evaluate if a step has all its prerequisite dependencies satisfied
 */
export function evaluateStepDependencies(step, completedStepIds = []) {
  if (!step.dependencies || step.dependencies.length === 0) {
    return {
      isUnlocked: true,
      missingDependencies: [],
    };
  }

  const missing = step.dependencies.filter((depId) => !completedStepIds.includes(depId));
  return {
    isUnlocked: missing.length === 0,
    missingDependencies: missing,
  };
}

/**
 * Get accumulated artifacts (e.g. SSM registration numbers, certificates)
 * from completed steps to autofill into subsequent dependent application forms
 */
export function getAccumulatedArtifacts(journey) {
  if (!journey || !journey.steps) return {};
  const artifacts = {};

  journey.steps.forEach((step) => {
    if (step.status === 'completed' && step.submissionOutput) {
      Object.assign(artifacts, step.submissionOutput);
    }
  });

  return artifacts;
}

/**
 * Save or update user journey in Firestore and local storage
 */
export async function saveUserJourney(userId = 'guest', journeyId, journeyData) {
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const enrichedJourney = {
    ...journeyData,
    updatedAt: new Date().toISOString(),
  };

  // 1. Update local cache
  const local = getLocalJourneys();
  if (!local[safeUserId]) local[safeUserId] = {};
  local[safeUserId][journeyId] = enrichedJourney;
  saveLocalJourneys(local);

  // 2. Persist to Firestore
  try {
    const journeyRef = doc(db, 'users', safeUserId, 'journeys', journeyId);
    await setDoc(
      journeyRef,
      {
        ...enrichedJourney,
        lastSyncedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('[JourneyService] Firestore sync warning (using local fallback):', err.message);
  }

  return enrichedJourney;
}

/**
 * Load user journey from Firestore or local cache
 */
export async function loadUserJourney(userId = 'guest', journeyId) {
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');

  // Try Firestore first
  try {
    const journeyRef = doc(db, 'users', safeUserId, 'journeys', journeyId);
    const snap = await getDoc(journeyRef);
    if (snap.exists()) {
      const data = snap.data();
      // Sync to local cache
      const local = getLocalJourneys();
      if (!local[safeUserId]) local[safeUserId] = {};
      local[safeUserId][journeyId] = data;
      saveLocalJourneys(local);
      return data;
    }
  } catch (err) {
    console.warn('[JourneyService] Firestore load error, checking local storage:', err.message);
  }

  // Fallback to local storage
  const local = getLocalJourneys();
  return local[safeUserId]?.[journeyId] || null;
}

/**
 * Submit an in-app application for an online e-service step
 */
export async function submitApplicationStep(userId = 'guest', journeyId, stepId, formData, journeyCurrent) {
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const now = new Date();
  
  // Generate official government-style reference ID
  const prefix = stepId.toUpperCase().replace('STEP-', '').slice(0, 4);
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const referenceNumber = `MYG-${prefix}-${now.getFullYear()}-${randomSuffix}`;

  // Generate output artifacts based on step type
  const generatedOutputs = {
    [`${stepId}_ref`]: referenceNumber,
    [`${stepId}_submittedAt`]: now.toISOString(),
  };

  if (stepId.includes('ssm') || stepId.includes('business')) {
    generatedOutputs['ssmRegistrationNumber'] = `202603${randomSuffix} (SSM)`;
    generatedOutputs['businessName'] = formData.businessName || 'My Enterprise';
    generatedOutputs['entityType'] = formData.entityType || 'Sole Proprietorship (Milikan Tunggal)';
  } else if (stepId.includes('food-handler') || stepId.includes('health') || stepId.includes('kkm')) {
    generatedOutputs['slpmCertificateNo'] = `KKM/SLPM/2026/${randomSuffix}`;
    generatedOutputs['typhoidVaccineCardNo'] = `TY2-KKM-${randomSuffix}`;
    generatedOutputs['vaccineExpiry'] = `${now.getFullYear() + 3}-12-31`;
  } else if (stepId.includes('pbt') || stepId.includes('premise')) {
    generatedOutputs['pbtLicenseNumber'] = `DBKL/LESEN/2026/${randomSuffix}`;
  } else if (stepId.includes('ptptn') || stepId.includes('loan')) {
    generatedOutputs['ptptnApplicationNumber'] = `PTPTN-APP-${now.getFullYear()}-${randomSuffix}`;
    generatedOutputs['sspnAccountNumber'] = formData.sspnAccountNumber || `SSPN-108${randomSuffix}`;
  } else if (stepId.includes('sspn')) {
    generatedOutputs['sspnAccountNumber'] = `SSPN-108${randomSuffix}`;
  }

  const submissionRecord = {
    id: referenceNumber,
    journeyId,
    stepId,
    userId: safeUserId,
    referenceNumber,
    status: 'Submitted',
    submittedAt: now.toISOString(),
    formData,
    output: generatedOutputs,
  };

  // Update step status in journey
  let updatedSteps = [];
  if (journeyCurrent && journeyCurrent.steps) {
    updatedSteps = journeyCurrent.steps.map((s) => {
      if (s.id === stepId) {
        return {
          ...s,
          status: 'completed',
          submissionRecord,
          submissionOutput: generatedOutputs,
        };
      }
      return s;
    });
  }

  const updatedJourney = {
    ...journeyCurrent,
    steps: updatedSteps,
  };

  // 1. Save submission to Firestore
  try {
    const appDocRef = doc(db, 'users', safeUserId, 'applications', referenceNumber);
    await setDoc(appDocRef, {
      ...submissionRecord,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('[JourneyService] Failed to save application to Firestore:', err.message);
  }

  // 2. Save updated journey state
  await saveUserJourney(safeUserId, journeyId, updatedJourney);

  return {
    success: true,
    referenceNumber,
    submissionRecord,
    updatedJourney,
    generatedOutputs,
  };
}

const LOCAL_STORAGE_ACTIVE_APPS_KEY = 'mygateway_active_applications_v1';
const LOCAL_STORAGE_SELECTED_APP_KEY = 'mygateway_selected_application_id';

/**
 * Get all active user applications from local storage
 */
export function getLocalActiveApplications() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ACTIVE_APPS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

/**
 * Save active user applications to local storage
 */
export function saveLocalActiveApplications(apps) {
  try {
    localStorage.setItem(LOCAL_STORAGE_ACTIVE_APPS_KEY, JSON.stringify(apps));
  } catch (_) {}
}

/**
 * Set the currently selected application ID
 */
export function setSelectedApplicationId(appId) {
  try {
    localStorage.setItem(LOCAL_STORAGE_SELECTED_APP_KEY, appId);
  } catch (_) {}
}

/**
 * Get the currently selected application ID
 */
export function getSelectedApplicationId() {
  try {
    return localStorage.getItem(LOCAL_STORAGE_SELECTED_APP_KEY) || null;
  } catch (_) {
    return null;
  }
}

/**
 * Create a new application from AI chat content
 */
export async function createApplicationFromChat(userId = 'Jason', { journey, eligibility, query }) {
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const now = new Date();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const appId = `APP-${now.getFullYear()}-${randomSuffix}`;

  const newApp = {
    id: appId,
    userId: safeUserId,
    title: journey?.title || 'Government Application Journey',
    summary: journey?.summary || 'Step-by-step government agency applications and approvals.',
    query: query || '',
    status: 'In Progress',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    eligibility: {
      summary: eligibility?.summary || 'Please verify the statutory eligibility criteria before proceeding.',
      criteria: eligibility?.criteria || [
        { id: 'c1', label: 'Citizenship', requirement: 'Malaysian Citizen with valid MyKad', isMandatory: true },
        { id: 'c2', label: 'Age Requirement', requirement: 'Aged 18 years old and above', isMandatory: true },
      ],
      checkedCriteria: {},
      isEligible: false,
    },
    journey: journey || {
      id: `journey-${appId}`,
      title: 'Agency Applications Roadmap',
      steps: [],
    },
  };

  // 1. Save to local storage
  const currentApps = getLocalActiveApplications();
  const updatedApps = [newApp, ...currentApps.filter((a) => a.id !== appId)];
  saveLocalActiveApplications(updatedApps);
  setSelectedApplicationId(appId);

  // 2. Persist to Firestore
  try {
    const appDocRef = doc(db, 'users', safeUserId, 'active_applications', appId);
    await setDoc(appDocRef, {
      ...newApp,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('[JourneyService] Note: Firestore active app save:', err.message);
  }

  return newApp;
}

/**
 * Update eligibility status for an active application
 */
export async function updateApplicationEligibility(userId = 'Jason', appId, checkedCriteria, isEligible) {
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const currentApps = getLocalActiveApplications();
  let updatedApp = null;

  const updatedApps = currentApps.map((app) => {
    if (app.id === appId) {
      updatedApp = {
        ...app,
        eligibility: {
          ...app.eligibility,
          checkedCriteria,
          isEligible,
        },
        updatedAt: new Date().toISOString(),
      };
      return updatedApp;
    }
    return app;
  });

  saveLocalActiveApplications(updatedApps);

  try {
    const appDocRef = doc(db, 'users', safeUserId, 'active_applications', appId);
    await setDoc(appDocRef, {
      eligibility: {
        checkedCriteria,
        isEligible,
      },
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn('[JourneyService] Firestore eligibility update note:', err.message);
  }

  return updatedApp;
}

/**
 * Update journey steps within an active application
 */
export async function updateApplicationJourney(userId = 'Jason', appId, updatedJourney) {
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const currentApps = getLocalActiveApplications();
  let updatedApp = null;

  const updatedApps = currentApps.map((app) => {
    if (app.id === appId) {
      updatedApp = {
        ...app,
        journey: updatedJourney,
        updatedAt: new Date().toISOString(),
      };
      return updatedApp;
    }
    return app;
  });

  saveLocalActiveApplications(updatedApps);

  try {
    const appDocRef = doc(db, 'users', safeUserId, 'active_applications', appId);
    await setDoc(appDocRef, {
      journey: updatedJourney,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn('[JourneyService] Firestore journey update note:', err.message);
  }

  return updatedApp;
}

/**
 * Fetch all submitted applications for the current user
 */
export async function getUserApplications(userId = 'guest') {
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const applications = [];

  try {
    const appsRef = collection(db, 'users', safeUserId, 'applications');
    const snap = await getDocs(appsRef);
    snap.forEach((docSnap) => {
      applications.push(docSnap.data());
    });
    return applications;
  } catch (err) {
    console.warn('[JourneyService] Failed to fetch applications from Firestore:', err.message);
    return [];
  }
}
