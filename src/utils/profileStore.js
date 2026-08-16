import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const getDefaultProfile = () => ({
  // Core Identity
  fullName: '',
  icNumber: '',
  dateOfBirth: '',
  citizenship: '',
  
  // Contact Information
  residentialAddress: '',
  phoneNumber: '',
  emailAddress: '',
  
  // Employment Information
  employmentStatus: '',
  occupation: '',
  employerName: '',
  
  // Education Information
  highestEducation: '',
  institutionName: '',
  fieldOfStudy: '',
  
  // Household Information
  maritalStatus: '',
  numberOfDependents: '',
  householdInfo: '',
  
  // Metadata
  isFirstTimeSetupComplete: false,
  lastUpdated: null,
  verificationStatus: {
    fullName: false,
    icNumber: false,
    dateOfBirth: false,
    citizenship: false,
  }
});

export const getProfile = async (username) => {
  if (!username) return getDefaultProfile();
  
  try {
    const docRef = doc(db, 'profiles', username);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { ...getDefaultProfile(), ...docSnap.data() };
    } else {
      return getDefaultProfile();
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    return getDefaultProfile(); // Fallback to default on error
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
    } catch(error) {
        console.error("Error updating section:", error);
        return { success: false, error: error.message };
    }
}

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
    } catch(error) {
        console.error("Error clearing section:", error);
        return false;
    }
}

export const isFirstTimeUser = async (username) => {
  if (!username) return false;
  try {
    const docRef = doc(db, 'profiles', username);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return !docSnap.data().isFirstTimeSetupComplete;
    }
    return true; // No doc means first time
  } catch (error) {
    console.error("Error checking first time status:", error);
    return false; // Fail safe
  }
};

export const calculateCompletion = (profile) => {
  const sections = {
    identity: ['fullName', 'icNumber', 'dateOfBirth', 'citizenship'],
    contact: ['residentialAddress', 'phoneNumber', 'emailAddress'],
    employment: ['employmentStatus', 'occupation', 'employerName'],
    education: ['highestEducation', 'institutionName', 'fieldOfStudy'],
    household: ['maritalStatus', 'numberOfDependents', 'householdInfo']
  };

  let totalFields = 0;
  let completedFields = 0;
  let missingSections = [];
  const sectionStatus = {};

  Object.entries(sections).forEach(([section, fields]) => {
    let sectionCompleted = 0;
    fields.forEach(field => {
      totalFields++;
      if (profile[field] && profile[field].trim() !== '') {
        completedFields++;
        sectionCompleted++;
      }
    });
    
    sectionStatus[section] = {
        completed: sectionCompleted,
        total: fields.length,
        isComplete: sectionCompleted === fields.length
    }

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
