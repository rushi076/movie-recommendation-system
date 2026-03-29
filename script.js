const API_KEY = "be5afabb1e2e6f7a6291070ec34bf934";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

// Enter search
document.getElementById("movieInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchMovie();
});

async function searchMovie() {

    const movie = document.getElementById("movieInput").value.trim();
    const resultDiv = document.getElementById("movieResult");

    if (!movie) return;

    resultDiv.innerHTML = "Searching...";

    try {

        const res = await fetch(
            `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${movie}`
        );

        const data = await res.json();
        const movieData = data.results[0];

        resultDiv.innerHTML = `
            <div class="movieCard" onclick="openMovie(${movieData.id})">
                <img src="${IMG_URL + movieData.poster_path}">
                <h3>${movieData.title}</h3>
                <p class="rating">⭐ ${movieData.vote_average}</p>
                <p>${movieData.overview}</p>
            </div>
        `;

        recommendMovies(movieData.id);

    } catch (err) {
        console.log(err);
    }
}


// Real Recommendation
async function recommendMovies(movieId) {

const recDiv = document.getElementById("recommendations");

recDiv.innerHTML = "Finding similar movies...";

try {

// Get Movie Details
const movieRes = await fetch(
`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`
);

const movieData = await movieRes.json();

const genreId = movieData.genres[0].id;
const language = movieData.original_language;

// Discover similar language movies
const res = await fetch(
`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&with_original_language=${language}&sort_by=popularity.desc`
);

const data = await res.json();

recDiv.innerHTML = "";

const selectedYear = document.getElementById("yearFilter").value;

data.results.forEach(movie => {

if(selectedYear && !movie.release_date.startsWith(selectedYear)) return;

recDiv.innerHTML += `
<div class="movieCard" onclick="openMovie(${movie.id})">
<img src="${IMG_URL + movie.poster_path}">
<h3>${movie.title}</h3>
<p>⭐ ${movie.vote_average}</p>
<p>${movie.release_date}</p>
</div>
`;

});

} catch (err) {
console.log(err);
}
}


// Open Movie Player
async function openMovie(movieId){

const player = document.getElementById("moviePlayer");

player.innerHTML = "Loading movie...";

try{

const res = await fetch(
`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`
);

const data = await res.json();

const trailer = data.results.find(
video => video.type === "Trailer"
);

if(!trailer){
player.innerHTML = "Trailer not available";
return;
}

player.innerHTML = `
<div class="playerBox">
<iframe 
width="100%" 
height="500"
src="https://www.youtube.com/embed/${trailer.key}"
frameborder="0"
allowfullscreen>
</iframe>
</div>
`;

window.scrollTo({
top: player.offsetTop,
behavior: "smooth"
});

}catch(err){
console.log(err);
}

}