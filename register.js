function registerUser(){

const name = document.getElementById("name").value;
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

firebase.auth().createUserWithEmailAndPassword(email,password)
.then((userCredential)=>{

alert("Account Created Successfully");

window.location.href="Login.html";

})
.catch((error)=>{

alert(error.message);

});

}


function googleRegister(){

const provider = new firebase.auth.GoogleAuthProvider();

firebase.auth().signInWithPopup(provider)
.then((result)=>{

window.location.href="index.html";

})
.catch((error)=>{

alert(error.message);

});

}