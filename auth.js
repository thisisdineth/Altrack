import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyCF84T6J6sEOPtpbW3w2-RnEKXIkXGMsbY",
    authDomain: "alapp-da70e.firebaseapp.com",
    databaseURL: "https://alapp-da70e-default-rtdb.firebaseio.com",
    projectId: "alapp-da70e",
    storageBucket: "alapp-da70e.appspot.com",
    messagingSenderId: "884251608582",
    appId: "1:884251608582:web:28b9e878916af3920e2587"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

// Show Loading Spinner
const showLoading = () => {
    document.getElementById('loading-container').classList.remove('hidden');
};

// Hide Loading Spinner
const hideLoading = () => {
    document.getElementById('loading-container').classList.add('hidden');
};

// Sign-Up Function
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading(); // Show loading spinner

    const name = document.getElementById('signup-name').value;
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;
    const stream = document.querySelector('input[name="stream"]:checked').value;
    const subject1 = document.getElementById('signup-subject1').value;
    const subject2 = document.getElementById('signup-subject2').value;
    const subject3 = document.getElementById('signup-subject3').value;
    const photoFile = document.getElementById('signup-photo').files[0];

    try {
        // Create a user with the mobile number (used as email)
        const userCredential = await createUserWithEmailAndPassword(auth, `${phone}@studytracker.com`, password);
        const user = userCredential.user;

        let photoURL = "";
        if (photoFile && photoFile.size <= 2 * 1024 * 1024) {
            const storagePath = `profilePictures/${user.uid}/${photoFile.name}`;
            const imageRef = storageRef(storage, storagePath);
            await uploadBytes(imageRef, photoFile);
            photoURL = await getDownloadURL(imageRef);
        }

        // Save user profile data in the database
        await set(ref(db, 'users/' + user.uid), {
            name: name,
            phone: phone,
            stream: stream,
            subjects: { subject1, subject2, subject3 },
            photoURL: photoURL
        });

        alert("Sign Up Successful!");
        window.location.href = "index.html"; // Redirect to the main page after sign-up
    } catch (error) {
        console.error("Sign Up Error:", error.message);
        alert(error.message);
    } finally {
        hideLoading(); // Hide loading spinner
    }
});

// Sign-In Function
document.getElementById('signin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading(); // Show loading spinner

    const phone = document.getElementById('signin-phone').value;
    const password = document.getElementById('signin-password').value;

    try {
        // Sign in with the mobile number (used as email)
        await signInWithEmailAndPassword(auth, `${phone}@studytracker.com`, password);
        alert("Sign In Successful!");
        window.location.href = "index.html"; // Redirect to the main page after sign-in
    } catch (error) {
        console.error("Sign In Error:", error.message);
        alert(error.message);
    } finally {
        hideLoading(); // Hide loading spinner
    }
});

// Toggle between Sign In and Sign Up
document.addEventListener('DOMContentLoaded', () => {
    const switchBtn = document.getElementById('switch-btn');
    const signupContainer = document.getElementById('signup-container');
    const signinContainer = document.getElementById('signin-container');

    switchBtn.addEventListener('click', () => {
        if (signupContainer.style.display === 'none') {
            signupContainer.style.display = 'block';
            signinContainer.style.display = 'none';
            switchBtn.textContent = 'Already Have an Account?';
        } else {
            signupContainer.style.display = 'none';
            signinContainer.style.display = 'block';
            switchBtn.textContent = 'Create an Account';
        }
    });
});

// Monitor Auth State
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is signed in:", user);
    } else {
        console.log("No user is signed in.");
    }
});
