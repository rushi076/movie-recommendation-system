const API_KEY = "162f101e";

async function searchMovie() {
    const movieInput = document.getElementById("movieInput");
    const resultDiv = document.getElementById("movieResult");
    const movie = movieInput.value;

    if (!movie) return alert("Please enter a movie name");

    resultDiv.innerHTML = "<p>Searching...</p>";

    try {
        const response = await fetch(`https://omdbapi.com/?t=${movie}&apikey=${API_KEY}`);
        const data = await response.json();

        if (data.Response === "False") {
            resultDiv.innerHTML = `<p>❌ Movie not found!</p>`;
            return;
        }

        resultDiv.innerHTML = `
            <div class="movieCard" style="width: 100%; max-width: 300px; margin: 0 auto;">
                <img src="${data.Poster !== 'N/A' ? data.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}" alt="${data.Title}">
                <h3>${data.Title}</h3>
                <p class="rating">⭐ ${data.imdbRating}</p>
                <p style="font-size: 0.8rem; opacity: 0.8;">${data.Genre}</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">${data.Plot.substring(0, 100)}...</p>
            </div>
        `;

        // Recommendation trigger
        recommendMovies(data.Genre.split(",")[0]); // Pehla primary genre pick karega

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

async function recommendMovies(genre) {
    const recDiv = document.getElementById("recommendations");
    recDiv.innerHTML = "<p>Loading recommendations...</p>";

    // Advanced: Genre mapping for better variety
    const genreMap = {
        "Action": ["The Dark Knight", "John Wick", "Mad Max: Fury Road"],
        "Comedy": ["The Hangover", "Superbad", "Step Brothers"],
        "Horror": ["The Conjuring", "It", "Hereditary"],
        "Sci-Fi": ["Interstellar", "The Matrix", "Blade Runner 2049"],
        "Romance": ["About Time", "Notebook", "Past Lives"]
    };

    let moviesList = genreMap[genre] || ["Inception", "Arrival", "Gravity"];

    let html = "";
    for (let m of moviesList) {
        try {
            const res = await fetch(`https://www.omdbapi.com/?t=${m}&apikey=${API_KEY}`);
            const d = await res.json();
            
            html += `
                <div class="movieCard">
                    <img src="${d.Poster}" alt="${d.Title}">
                    <h3>${d.Title}</h3>
                    <p class="rating">⭐ ${d.imdbRating}</p>
                </div>
            `;
        } catch (e) { console.log(e); }
    }
    recDiv.innerHTML = html;
}