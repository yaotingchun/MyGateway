import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

export const getDefaultProfile = (username = 'Jason') => ({
  // Core Identity (JPN / MyDigital ID Central Registry)
  fullName: username === 'Jason' || !username ? 'Jason Tan Wei Lun' : username,
  icNumber: '980315-14-5219',
  dateOfBirth: '1998-03-15',
  gender: 'Male (Lelaki)',
  stateOfBirth: 'Wilayah Persekutuan Kuala Lumpur',
  citizenship: 'Malaysian Citizen',
  race: 'Chinese (Cina)',
  religion: 'Buddhist (Buddha)',
  digitalIdStatus: 'MyDigital ID Verified (Tier-1 Biometric)',

  // Contact Information (Verified via SMS OTP / Gov Portal)
  phoneNumber: '+60 12-345 6789',
  emailAddress: 'jason.tan@gmail.com',
  residentialAddress: 'No. 28, Jalan Solaris 3, Solaris Dutamas',
  postcode: '50480',
  city: 'Kuala Lumpur',
  state: 'Wilayah Persekutuan Kuala Lumpur',

  // Socio-Economic & PADU Centralized Household Record (PADU / LHDN)
  paduStatus: 'PADU Verified (2026/Q1)',
  incomeCategory: 'B40',
  monthlyIncome: 'RM 3,200',
  householdIncome: 'RM 3,200',
  employmentStatus: 'Self-Employed (Bekerja Sendiri)',
  occupation: 'Food & Beverage Entrepreneur',
  employerName: 'Tan Deli Enterprise',
  taxNumber: 'IG-910482180',
  maritalStatus: 'Single (Bujang)',
  numberOfDependents: '0',
  householdInfo: 'Single individual urban household.',

  // Education & Higher Learning (MOHE / KPM Records)
  highestEducation: 'Degree (Ijazah Sarjana Muda)',
  institutionName: 'Universiti Malaya (UM)',
  fieldOfStudy: 'Bachelor of Business Administration (Hons)',
  graduationYear: '2021',
  studentStatus: 'Alumni / Graduated',

  // Financial, Social Security & Government Welfare Registrations
  bankName: 'Maybank (Malayan Banking Berhad)',
  bankAccountNumber: '114012398471',
  sspnAccount: 'SSPN-10894218',
  kwspNumber: 'EPF-194820194',
  perkesoNumber: 'SOCSO-980315145219',
  strEligibility: 'Eligible (STR 2026 B40 Single Category)',

  // Health, Transport & Licensing Records (KKM / JPJ)
  drivingLicence: 'Classes D, DA, B2 (Valid until 2029)',
  bloodType: 'O+',
  foodHandlerSlpm: 'Not Certified',
  typhoidVaccine: 'Not Taken',

  // Metadata
  isFirstTimeSetupComplete: true,
  lastUpdated: new Date().toISOString(),
  verificationStatus: {
    fullName: true,
    icNumber: true,
    dateOfBirth: true,
    citizenship: true,
    phoneNumber: true,
    emailAddress: true,
    paduStatus: true,
    taxNumber: true,
    bankAccountNumber: true,
    sspnAccount: true,
    digitalIdStatus: true,
  }
});

export const getProfile = async (username = 'Jason') => {
  const safeName = username || 'Jason';
  const defaultProf = getDefaultProfile(safeName);

  try {
    const docRef = doc(db, 'profiles', safeName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { ...defaultProf, ...docSnap.data() };
    } else {
      // Initialize default in Firestore
      try {
        await setDoc(docRef, defaultProf);
      } catch (_) {}
      return defaultProf;
    }
  } catch (error) {
    console.warn('[ProfileStore] Firestore load notice (using centralized default profile):', error.message);
    return defaultProf;
  }
};

export const saveProfile = async (username, profileData) => {
  if (!username) return;
  try {
    const docRef = doc(db, 'profiles', username);
    await setDoc(docRef, {
      ...profileData,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving profile:", error);
    return false;
  }
};

export const updateSection = async (username, sectionData) => {
  if (!username) return { success: false, error: 'No username provided' };
  try {
    const docRef = doc(db, 'profiles', username);
    await setDoc(docRef, {
      ...sectionData,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error updating section:", error);
    return { success: false, error: error.message };
  }
};

export const clearSection = async (username, fieldNames) => {
  if (!username || !fieldNames || fieldNames.length === 0) return;
  try {
    const docRef = doc(db, 'profiles', username);
    const updates = {};
    fieldNames.forEach(field => {
      updates[field] = '';
    });
    await setDoc(docRef, {
      ...updates,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error clearing section:", error);
    return false;
  }
};

export const isFirstTimeUser = async (username) => {
  if (!username) return false;
  try {
    const docRef = doc(db, 'profiles', username);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return !docSnap.data().isFirstTimeSetupComplete;
    }
    return false;
  } catch (error) {
    return false;
  }
};

export const calculateCompletion = (profile = {}) => {
  const sections = {
    identity: ['fullName', 'icNumber', 'dateOfBirth', 'citizenship'],
    contact: ['residentialAddress', 'phoneNumber', 'emailAddress'],
    socioeconomic: ['incomeCategory', 'monthlyIncome', 'employmentStatus', 'occupation', 'taxNumber'],
    education: ['highestEducation', 'institutionName', 'fieldOfStudy'],
    financial: ['bankName', 'bankAccountNumber', 'sspnAccount', 'kwspNumber']
  };

  let totalFields = 0;
  let completedFields = 0;
  let missingSections = [];
  const sectionStatus = {};

  Object.entries(sections).forEach(([section, fields]) => {
    let sectionCompleted = 0;
    fields.forEach(field => {
      totalFields++;
      if (profile[field] && String(profile[field]).trim() !== '') {
        completedFields++;
        sectionCompleted++;
      }
    });

    sectionStatus[section] = {
      completed: sectionCompleted,
      total: fields.length,
      isComplete: sectionCompleted === fields.length
    };

    if (sectionCompleted < fields.length) {
      missingSections.push(section);
    }
  });

  const percentage = Math.round((completedFields / totalFields) * 100);

  return {
    percentage,
    completedFields,
    totalFields,
    missingSections,
    sectionStatus
  };
};

/**
 * Automated Statutory Eligibility Evaluator
 * Checks criteria against Government Centralized Profile (JPN, PADU, LHDN, PTPTN, JPJ).
 * Criteria that cannot be verified automatically require explicit citizen confirmation (click).
 */
export function evaluateEligibilityCriteria(criteria = [], profile = {}) {
  const currentYear = new Date().getFullYear();
  let citizenAge = 28;
  if (profile.dateOfBirth) {
    const parts = profile.dateOfBirth.split('-');
    if (parts.length === 3) {
      citizenAge = currentYear - parseInt(parts[0], 10);
    }
  }

  return criteria.map((c, idx) => {
    const cId = c.id || `c-${idx}`;
    const label = (c.label || '').toLowerCase();
    const req = (c.requirement || '').toLowerCase();

    // 1. Automatic Check: Malaysian Citizenship & MyKad
    if (label.includes('citizen') || req.includes('malaysian citizen') || req.includes('mykad') || req.includes('mypr')) {
      const isCitizen = profile.citizenship?.includes('Citizen') || profile.citizenship === 'Malaysian Citizen';
      return {
        ...c,
        id: cId,
        isAutoChecked: true,
        autoCheckedValue: isCitizen,
        autoCheckSource: 'JPN / MyDigital ID National Registry',
        autoCheckReason: `Verified Malaysian Citizen (MyKad: ${profile.icNumber || '980315-14-5219'})`,
      };
    }

    // 2. Automatic Check: Age Demographics
    if (label.includes('age') || req.includes('aged 18') || req.includes('years old') || req.includes('45 years')) {
      const meetsAge = req.includes('45') ? (citizenAge >= 18 && citizenAge <= 45) : (citizenAge >= 18);
      return {
        ...c,
        id: cId,
        isAutoChecked: true,
        autoCheckedValue: meetsAge,
        autoCheckSource: 'JPN Civil Demographics',
        autoCheckReason: `Verified ${citizenAge} years old (Born ${profile.dateOfBirth || '1998-03-15'})`,
      };
    }

    // 3. Automatic Check: Simpan SSPN Account
    if (label.includes('sspn') || req.includes('sspn')) {
      const hasSspn = !!profile.sspnAccount && profile.sspnAccount.trim() !== '';
      return {
        ...c,
        id: cId,
        isAutoChecked: true,
        autoCheckedValue: hasSspn,
        autoCheckSource: 'PTPTN / Simpan SSPN Digital Registry',
        autoCheckReason: hasSspn ? `Active Simpan SSPN Account: ${profile.sspnAccount}` : 'No active account on record',
      };
    }

    // 4. Automatic Check: PADU Income Category / B40 Bracket
    if (label.includes('income') || req.includes('b40') || req.includes('income threshold') || label.includes('b40')) {
      const isB40 = profile.incomeCategory === 'B40';
      return {
        ...c,
        id: cId,
        isAutoChecked: true,
        autoCheckedValue: isB40,
        autoCheckSource: 'PADU / LHDN Income Record',
        autoCheckReason: `Verified ${profile.incomeCategory || 'B40'} Tier (${profile.monthlyIncome || 'RM 3,200'}/month)`,
      };
    }

    // 5. Automatic Check: Tax Number (TIN)
    if (label.includes('tax') || req.includes('tax file') || req.includes('lhdn')) {
      const hasTax = !!profile.taxNumber && profile.taxNumber.trim() !== '';
      return {
        ...c,
        id: cId,
        isAutoChecked: true,
        autoCheckedValue: hasTax,
        autoCheckSource: 'LHDN e-Daftar Tax Portal',
        autoCheckReason: hasTax ? `Active Tax Identification Number: ${profile.taxNumber}` : 'No tax number on record',
      };
    }

    // 6. Non-Automatic Criteria (Require User Action / Physical Confirmation)
    let manualReason = 'Requires statutory citizen confirmation / physical documentation';
    if (label.includes('premise') || req.includes('tenancy')) {
      manualReason = 'Commercial tenancy contracts are held privately with landlords (User confirmation required)';
    } else if (label.includes('food handler') || req.includes('slpm') || req.includes('typhoid')) {
      manualReason = 'Physical training attendance & clinic appointment (User confirmation required)';
    } else if (label.includes('offer') || req.includes('ipta') || req.includes('university')) {
      manualReason = 'Institutional admission letter confirmation (User confirmation required)';
    }

    return {
      ...c,
      id: cId,
      isAutoChecked: false,
      autoCheckedValue: false,
      autoCheckSource: null,
      autoCheckReason: manualReason,
    };
  });
}
