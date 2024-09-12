import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getDatabase, ref, set, get, update, onValue } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCF84T6J6sEOPtpbW3w2-RnEKXIkXGMsbY",
    authDomain: "alapp-da70e.firebaseapp.com",
    databaseURL: "https://alapp-da70e-default-rtdb.firebaseio.com",
    projectId: "alapp-da70e",
    storageBucket: "alapp-da70e.appspot.com",
    messagingSenderId: "884251608582",
    appId: "1:884251608582:web:28b9e878916af3920e2587"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Elements
const profilePic = document.getElementById("profile-pic");
const welcomeMessage = document.getElementById("welcome-message");
const subject1Label = document.getElementById("subject1-label");
const subject2Label = document.getElementById("subject2-label");
const subject3Label = document.getElementById("subject3-label");
const totalPointsElement = document.getElementById("total-points");
const pointsTable = document.querySelector("#points-history-table tbody");
const localTimeElement = document.getElementById("local-time");

// Chart variables
let studyChart;
let studyData = {
    subject1: 0,
    subject2: 0,
    subject3: 0,
    totalPoints: 0
};

// Sign out logic
document.getElementById("signout-btn").addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = "signpage.html";
    }).catch(error => {
        console.error("Sign out error", error);
    });
});

// Get current user and display data
onAuthStateChanged(auth, user => {
    if (user) {
        const userRef = ref(db, 'users/' + user.uid);
        get(userRef).then(snapshot => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                profilePic.src = data.photoURL || "default-profile.png";
                welcomeMessage.textContent = `Welcome, ${data.name}`;
                subject1Label.textContent = data.subjects.subject1;
                subject2Label.textContent = data.subjects.subject2;
                subject3Label.textContent = data.subjects.subject3;

                // Load study data and render chart
                loadStudyData(user.uid);
            }
        });
    } else {
        window.location.href = "signpage.html";
    }
});

// Load study data
function loadStudyData(uid) {
    const studyRef = ref(db, 'study/' + uid);
    onValue(studyRef, snapshot => {
        if (snapshot.exists()) {
            studyData = snapshot.val();
            renderChart();
            updateTable();
        }
    });
}

// Update study hours
document.getElementById("update-btn").addEventListener("click", () => {
    const subject1Hours = parseInt(document.getElementById("subject1-hours").value) || 0;
    const subject2Hours = parseInt(document.getElementById("subject2-hours").value) || 0;
    const subject3Hours = parseInt(document.getElementById("subject3-hours").value) || 0;

    studyData.subject1 = subject1Hours * 10;
    studyData.subject2 = subject2Hours * 10;
    studyData.subject3 = subject3Hours * 10;
    studyData.totalPoints = studyData.subject1 + studyData.subject2 + studyData.subject3;

    update(ref(db, 'study/' + auth.currentUser.uid), studyData).then(() => {
        renderChart();
        updateTable();
    });
});

// Render chart
function renderChart() {
    if (studyChart) studyChart.destroy();

    const ctx = document.getElementById("study-chart").getContext("2d");
    studyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [subject1Label.textContent, subject2Label.textContent, subject3Label.textContent],
            datasets: [{
                label: 'Study Points',
                data: [studyData.subject1, studyData.subject2, studyData.subject3],
                backgroundColor: ['#4caf50', '#f9a825', '#0288d1']
            }]
        }
    });

    totalPointsElement.textContent = `Total Points: ${studyData.totalPoints}`;
}

// Update table
function updateTable() {
    const today = new Date().toLocaleDateString();
    pointsTable.innerHTML = `
        <tr>
            <td>${today}</td>
            <td>${studyData.subject1}</td>
            <td>${studyData.subject2}</td>
            <td>${studyData.subject3}</td>
            <td>${studyData.totalPoints}</td>
        </tr>
    `;
}

// Display local time and reset points at midnight
function updateLocalTime() {
    const now = new Date();
    localTimeElement.textContent = `Local Time: ${now.toLocaleTimeString()}`;
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        resetPoints();
    }
}

function resetPoints() {
    studyData.subject1 = 0;
    studyData.subject2 = 0;
    studyData.subject3 = 0;
    studyData.totalPoints = 0;
    renderChart();
    updateTable();
}

setInterval(updateLocalTime, 1000);
