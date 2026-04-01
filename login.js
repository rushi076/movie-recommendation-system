function loginUser(){

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

firebase.auth().signInWithEmailAndPassword(email,password)
.then((userCredential)=>{

window.location.href="index.html";

})
.catch((error)=>{

alert(error.message);

});

}


function googleLogin(){

const provider = new firebase.auth.GoogleAuthProvider();

firebase.auth().signInWithPopup(provider)
.then((result)=>{

window.location.href="index.html";

})
.catch((error)=>{

alert(error.message);

});

}


// Auto Login

firebase.auth().onAuthStateChanged((user)=>{

if(user){
window.location.href="index.html";
}

});