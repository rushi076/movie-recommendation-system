const API_KEY = "be5afabb1e2e6f7a6291070ec34bf934";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

firebase.auth().onAuthStateChanged((user)=>{

if(!user){
window.location.href="Login.html";
}

});

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

const movieRes = await fetch(
`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`
);

const movieData = await movieRes.json();

const genreId = movieData.genres[0].id;
const language = movieData.original_language;

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


// NETMIRROR STYLE PLAYER

async function openMovie(movieId){

const player = document.getElementById("moviePlayer");

player.innerHTML = "Finding Best Movie Source...";

try{

const movieRes = await fetch(
`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`
);

const movieData = await movieRes.json();

const movieName = movieData.title;
const year = movieData.release_date?.split("-")[0];

player.innerHTML = `

<div class="playerBox">

<h2>${movieName} (${year})</h2>

<div id="videoPlayer">
Searching Best Source...
</div>

</div>

`;

playBestSource(movieId);

window.scrollTo({
top: player.offsetTop,
behavior:"smooth"
});

}catch(err){
console.log(err);
}

}


// SMART AUTO DETECT PLAYER

function playBestSource(id){

const sources = [

`https://vidsrc.me/embed/movie?tmdb=${id}`,
//`https://multiembed.mov/?video_id=${id}&tmdb=1`,
//`https://player.autoembed.app/embed/movie/${id}`,
//`https://vidbinge.to/movie/${id}`

];

window.open(sources[0],"_blank");

}

let index = 0;

function tryNext(){

if(index >= sources.length){

document.getElementById("videoPlayer").innerHTML = `
<h3>Movie Not Found</h3>
<button onclick="openExternal('${id}')">
Search On Web
</button>
`;

return;
}

const iframe = document.createElement("iframe");

window.open(sources[index],"_blank");
iframe.width = "100%";
iframe.height = "500";
iframe.allowFullscreen = true;

iframe.onerror = () => {
index++;
tryNext();
};

document.getElementById("videoPlayer").innerHTML = "";
document.getElementById("videoPlayer").appendChild(iframe);

}

tryNext();



// FINAL FALLBACK

function openExternal(id){

window.open(
`https://www.google.com/search?q=watch+movie+${id}+online+free`,
"_blank"
);

}

function logout(){

firebase.auth().signOut()
.then(()=>{

window.location.href="Login.html";

})

}


// VOICE SEARCH
function startVoice(){
    const recognition = new(window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.start();

    recognition.onstart = ()=>{ console.log("Listening..."); };
    recognition.onresult = function(event){
        const transcript = event.results[0][0].transcript;
        document.getElementById("movieInput").value = transcript;
        searchMovie();
        searchSeries();
    };
    recognition.onerror = ()=>{ alert("Voice search not supported"); };
}