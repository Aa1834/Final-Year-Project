import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyCN14GSnNLm6-pz_OuWcXwlnTxJTIgMMB4",
  authDomain: "myfyp-3ca9f.firebaseapp.com",
  projectId: "myfyp-3ca9f",
  storageBucket: "myfyp-3ca9f.firebasestorage.app",
  messagingSenderId: "484227441258",
  appId: "1:484227441258:web:137c2c3b29dd61bb74e013",
  measurementId: "G-H1T0SEVZKV"
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);

// Track selected skills
let selectedSkills = new Set();
let currentUser = null;

// DOM Elements
const skillLabels = document.querySelectorAll('.skill-label');
const selectedCountEl = document.querySelector('#selectedCount');
const saveButton = document.querySelector('#saveSkills');
const clearButton = document.querySelector('#clearSkills');
const statusMessage = document.querySelector('#statusMessage');
const addCustomSkillBtn = document.querySelector('#addCustomSkill');
const customSkillInput = document.querySelector('#customSkillInput');
const customSkillsContainer = document.querySelector('#customSkills');
const loadingMessage = document.querySelector('#loadingMessage');
const skillsContent = document.querySelector('#skillsContent');

// Initialize skill selection
function initSkillSelection() {
  // Add click handlers to all existing skill labels
  document.querySelectorAll('.skill-label').forEach(label => {
    label.addEventListener('click', () => toggleSkill(label));
  });
}

// Toggle skill selection
function toggleSkill(label) {
  const skill = label.getAttribute('data-skill');
  
  if (label.classList.contains('selected')) {
    label.classList.remove('selected');
    selectedSkills.delete(skill);
  } else {
    label.classList.add('selected');
    selectedSkills.add(skill);
  }
  
  updateSelectedCount();
}

// Update selected count display
function updateSelectedCount() {
  selectedCountEl.textContent = selectedSkills.size;
}

// Add custom skill
function addCustomSkill() {
  const customSkill = customSkillInput.value.trim();
  
  if (!customSkill) {
    showStatus('Please enter a skill name', 'error');
    return;
  }
  
  // Check if skill already exists
  if (selectedSkills.has(customSkill)) {
    showStatus('This skill is already added', 'error');
    customSkillInput.value = '';
    return;
  }
  
  // Create new skill label
  const skillLabel = document.createElement('button');
  skillLabel.className = 'skill-label selected';
  skillLabel.setAttribute('data-skill', customSkill);
  skillLabel.textContent = customSkill;
  
  // Add click handler
  skillLabel.addEventListener('click', () => toggleSkill(skillLabel));
  
  // Add to custom skills container
  customSkillsContainer.appendChild(skillLabel);
  
  // Add to selected skills
  selectedSkills.add(customSkill);
  updateSelectedCount();
  
  // Clear input
  customSkillInput.value = '';
  showStatus('Custom skill added!', 'success');
}

// Clear all selections
function clearAllSkills() {
  document.querySelectorAll('.skill-label.selected').forEach(label => {
    label.classList.remove('selected');
  });
  selectedSkills.clear();
  updateSelectedCount();
  showStatus('All selections cleared', 'error');
}

// Save skills to Firestore
async function saveSkills() {
  if (!currentUser) {
    showStatus('Please sign in to save your skills', 'error');
    return;
  }
  
  if (selectedSkills.size === 0) {
    showStatus('Please select at least one skill', 'error');
    return;
  }
  
  try {
    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';
    
    const userRef = doc(db, 'users', currentUser.uid);
    
    // Update user document with skills
    await updateDoc(userRef, {
      skills: Array.from(selectedSkills),
      skillsUpdatedAt: serverTimestamp()
    });
    
    showStatus(`Successfully saved ${selectedSkills.size} skills!`, 'success');
    saveButton.textContent = 'Save Skills';
  } catch (error) {
    console.error('Error saving skills:', error);
    
    // If document doesn't exist, create it
    if (error.code === 'not-found') {
      try {
        await setDoc(userRef, {
          skills: Array.from(selectedSkills),
          skillsUpdatedAt: serverTimestamp(),
          email: currentUser.email
        });
        showStatus(`Successfully saved ${selectedSkills.size} skills!`, 'success');
      } catch (setError) {
        console.error('Error creating user document:', setError);
        showStatus('Failed to save skills. Please try again.', 'error');
      }
    } else {
      showStatus('Failed to save skills. Please try again.', 'error');
    }
    
    saveButton.textContent = 'Save Skills';
  } finally {
    saveButton.disabled = false;
  }
}

// Load user's existing skills
async function loadUserSkills(user) {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists() && userSnap.data().skills) {
      const skills = userSnap.data().skills;
      
      // Pre-select existing skills
      skills.forEach(skill => {
        selectedSkills.add(skill);
        
        // Find and select the label
        const label = document.querySelector(`.skill-label[data-skill="${skill}"]`);
        if (label) {
          label.classList.add('selected');
        } else {
          // If skill doesn't exist in predefined list, add as custom
          const skillLabel = document.createElement('button');
          skillLabel.className = 'skill-label selected';
          skillLabel.setAttribute('data-skill', skill);
          skillLabel.textContent = skill;
          skillLabel.addEventListener('click', () => toggleSkill(skillLabel));
          customSkillsContainer.appendChild(skillLabel);
        }
      });
      
      updateSelectedCount();
    }
  } catch (error) {
    console.error('Error loading user skills:', error);
  } finally {
    loadingMessage.style.display = 'none';
    skillsContent.style.display = 'block';
  }
}

// Show status message
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = type;
  
  setTimeout(() => {
    statusMessage.style.display = 'none';
    statusMessage.className = '';
  }, 3000);
}

// Event Listeners
saveButton.addEventListener('click', saveSkills);
clearButton.addEventListener('click', clearAllSkills);
addCustomSkillBtn.addEventListener('click', addCustomSkill);

customSkillInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addCustomSkill();
  }
});

// Auth state observer
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    loadUserSkills(user);
  } else {
    currentUser = null;
    loadingMessage.textContent = 'Please sign in to manage your skills';
    loadingMessage.style.color = '#721c24';
    // Redirect to sign in page after 2 seconds
    setTimeout(() => {
      window.location.href = 'sign_in.html';
    }, 2000);
  }
});

// Initialize
initSkillSelection();

function moveToJobView(){
    window.location.href = "homePage.html";
}
const nextPageButton = document.querySelector("#nextPage");
nextPageButton.addEventListener("click",moveToJobView);