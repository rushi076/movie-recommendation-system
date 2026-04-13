// TODO: Add your Firebase configuration here
const firebaseConfig = {
    apiKey: "AIzaSyCdHE0rwe0r-KmDzodkegjXxOW5ZdmBF8o",
    authDomain: "cinemagic-cf6e8.firebaseapp.com",
    projectId: "cinemagic-cf6e8",
    storageBucket: "cinemagic-cf6e8.firebasestorage.app",
    messagingSenderId: "367203406092",
    appId: "1:367203406092:web:b4b7cead69b1f14897b929",
    measurementId: "G-7DNJNW60FW"
};
// Initialize Firebase
let app, auth, db;
if (!firebase.apps.length) {
    app = firebase.initializeApp(firebaseConfig);
} else {
    app = firebase.app(); // if already initialized
}

auth = firebase.auth();
db = firebase.firestore();

// Optional: Enable Firestore offline persistence for better UX
db.enablePersistence()
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
        } else if (err.code == 'unimplemented') {
            console.warn('The current browser does not support all of the features required to enable persistence');
        }
    });

window.auth = auth;
window.db = db;