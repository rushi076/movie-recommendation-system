const API_KEY = "162f101e";

async function searchMovie(){

let movie = document.getElementById("movieInput").value;

let response = await fetch(`https://omdbapi.com/?t=${movie}&apikey=${API_KEY}`);

let data = await response.json();

let result = document.getElementById("movieResult");

result.innerHTML = `
<div class="movieCard">
<img src="${data.Poster}">
<h3>${data.Title}</h3>
<p>⭐ Rating: ${data.imdbRating}</p>
<p>Genre: ${data.Genre}</p>
</div>
`;

recommendMovies(data.Genre);

}

async function recommendMovies(genre){

let recDiv = document.getElementById("recommendations");

recDiv.innerHTML="";

let moviesList = [];

// Genre based recommendation
if(genre.includes("Action")){
moviesList = ["Avengers","Iron Man","Thor","Batman","Superman"];
}

else if(genre.includes("Romance")){
moviesList = ["Titanic","The Notebook","La La Land","Romeo and Juliet"];
}

else if(genre.includes("Fantasy")){
moviesList = ["Harry Potter","Fantastic Beasts","Lord of the Rings"];
}

else{
moviesList = ["Avatar","Inception","Interstellar"];
}

// Fetch recommended movies
for(let m of moviesList){

let response = await fetch(`https://www.omdbapi.com/?t=${m}&apikey=${API_KEY}`);

let data = await response.json();

recDiv.innerHTML += `
<div class="movieCard">
<img src="${data.Poster}">
<h3>${data.Title}</h3>
<p>⭐ Rating: ${data.imdbRating}</p>
</div>
`;

}

}