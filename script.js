const API_KEY = "162f101e";

// Enter key se search support
document.getElementById("movieInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchMovie();
});

async function searchMovie() {
    const input = document.getElementById("movieInput");
    const resultDiv = document.getElementById("movieResult");
    const movie = input.value;

    if (!movie) return;

    resultDiv.innerHTML = `<div class="loader">Magic is happening...</div>`;

    try {
        const res = await fetch(`https://omdbapi.com/?t=${movie}&apikey=${API_KEY}`);
        const data = await res.json();

        if (data.Response === "False") {
            resultDiv.innerHTML = `<p>Oops! Movie nahi mili.</p>`;
            return;
        }

        resultDiv.innerHTML = `
            <div class="movieCard" style="max-width: 350px; width: 100%;">
                <img src="${data.Poster !== 'N/A' ? data.Poster : 'https://via.placeholder.com/300x450'}" />
                <div style="padding: 10px;">
                    <h3>${data.Title}</h3>
                    <p class="rating">⭐ ${data.imdbRating} | ${data.Year}</p>
                    <p style="font-size: 0.8rem; opacity: 0.7; margin-top: 8px;">${data.Plot}</p>
                </div>
            </div>
        `;

        recommendMovies(data.Genre.split(",")[0]);

    } catch (err) {
        console.error(err);
    }
}

async function recommendMovies(genre) {
    const recDiv = document.getElementById("recommendations");
    recDiv.innerHTML = "";

    const genrePool = {
        "Action": ["The Dark Knight", "John Wick", "Avengers", "Gladiator", "Inception"],
        "Horror": ["The Conjuring", "It", "Sinister", "A Quiet Place"],
        "Sci-Fi": ["Interstellar", "Tenet", "The Matrix", "Dune"],
        "Comedy": ["Hangover", "Deadpool", "Superbad", "Free Guy"],
        "Drama": ["Forrest Gump", "The Shawshank Redemption", "The Godfather"]
    };

    let moviesList = genrePool[genre.trim()] || ["Avatar", "Titanic", "Inception", "Arrival"];

    for (let title of moviesList) {
        try {
            const res = await fetch(`https://omdbapi.com/?t=${title}&apikey=${API_KEY}`);
            const d = await res.json();

            if (d.Response !== "False") {
                recDiv.innerHTML += `
                    <div class="movieCard">
                        <img src="${d.Poster}">
                        <h3>${d.Title}</h3>
                        <p class="rating">⭐ ${d.imdbRating}</p>
                    </div>
                `;
            }
        } catch (e) {}
    }
}