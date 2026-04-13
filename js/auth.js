// Check auth state globally
firebase.auth().onAuthStateChanged((user) => {
    const publicPages = ['login.html', 'register.html', 'index.html', ''];
    let currentPath = window.location.pathname.split("/").pop().toLowerCase();
    
    // Quick fix for empty path
    if (currentPath === "") currentPath = "index.html"; 
    
    if (user) {
        // Track active time for admin dashboard
        if (window.db) {
            db.collection("users").doc(user.uid).set({
                lastActive: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }
    } else {
        // User is signed out, block access to protected pages
        if (!publicPages.includes(currentPath)) {
            window.location.href = "login.html";
        }
    }
});

// Login User
async function loginUser(email, password) {
    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        window.location.href = "index.html";
    } catch (error) {
        throw error;
    }
}

// Register User
async function registerUser(email, password, username) {
    try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update display name
        await user.updateProfile({
            displayName: username
        });

        // Initialize user document in Firestore
        if (window.db) {
            await db.collection("users").doc(user.uid).set({
                username: username,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                role: 'user', // Default role for admin checks
                searchHistory: [],
                likedMovies: [],
                watchlist: [],
                recentlyViewed: []
            });
        }
        
        window.location.href = "index.html";
    } catch (error) {
        throw error;
    }
}

// Logout
function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = "login.html";
    }).catch(console.error);
}

// Expose functions easily
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logout = logout;

// Global Mobile Menu Toggle
window.toggleMobileMenu = function() {
    const navLinks = document.getElementById("navLinks");
    if(navLinks) {
        navLinks.classList.toggle("active");
    }
};
