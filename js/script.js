// UI Logic (Scroll/Search/Drawer) now handled in navbar.js

// Generate Movie Card UI
function createMovieCard(movie, defaultType = 'movie') {
    const poster = movie.poster_path ? `${window.api.IMG_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster';
    const title = movie.title || movie.name || "Unknown Title";
    const rating = (movie.vote_average || 0).toFixed(1);
    const releaseDate = movie.release_date || movie.first_air_date || '';
    const type = movie.media_type || defaultType;

    return `
        <div class="movie-card" onclick="goToMovie(${movie.id}, '${type}')">
            <img src="${poster}" alt="${title}" loading="lazy">
            <div class="movie-overlay">
                <h4>${title}</h4>
                <div class="meta">
                    <span class="rating">${rating} Review</span>
                    <span>${releaseDate ? releaseDate.substring(0, 4) : ''}</span>
                </div>
            </div>
        </div>
    `;
}

// Render row helper
async function renderRow(url, elementId, defaultType = 'movie') {
    const el = document.getElementById(elementId);
    if (!el) return null;

    try {
        const movies = await window.api.fetchMovies(url);
        let html = "";
        movies.forEach(movie => {
            if (movie.poster_path) html += createMovieCard(movie, defaultType);
        });
        el.innerHTML = html;
        return movies;
    } catch {
        console.error("Failed to load row");
        el.innerHTML = '<p>Failed to load items</p>';
    }
}

function goToMovie(id, type = 'movie') {
    window.open(`movie.html?id=${id}&type=${type}`, '_blank');
}

// Load Home Page Content
async function initHome() {
    // Inject movies into sections
    const trending = await renderRow(window.api.req.trending, 'trendingMovies', 'movie');
    renderRow(window.api.req.popular, 'popularMovies', 'movie');
    renderRow(window.api.req.topRated, 'topRatedMovies', 'movie');

    // TV Shows
    renderRow(window.api.req.trendingTV, 'trendingTV', 'tv');
    renderRow(window.api.req.popularTV, 'popularTV', 'tv');
    renderRow(window.api.req.topRatedTV, 'topRatedTV', 'tv');

    // Set Hero UI based on first trending movie
    if (trending && trending.length > 0) {
        const hero = trending[Math.floor(Math.random() * trending.length)];
        const title = hero.title || hero.name;
        const banner = hero.backdrop_path ? `${window.api.ORIGINAL_IMG_URL}${hero.backdrop_path}` : `${window.api.ORIGINAL_IMG_URL}${hero.poster_path}`;

        document.getElementById("heroBanner").style.backgroundImage = `url(${banner})`;
        document.getElementById("heroContent").innerHTML = `
            <h1 class="hero-title">${title}</h1>
            <p class="hero-desc">${hero.overview}</p>
            <div class="hero-buttons">
                <button class="btn btn-primary" onclick="goToMovie(${hero.id}, 'movie')"><i class="fas fa-play"></i> Play</button>
                <button class="btn btn-secondary" onclick="goToMovie(${hero.id}, 'movie')"><i class="fas fa-info-circle"></i> More Info</button>
            </div>
        `;
        setInterval(() => {
            const hero = trending[Math.floor(Math.random() * trending.length)];

            document.getElementById("heroBanner").style.backgroundImage =
                `url(${window.api.ORIGINAL_IMG_URL}${hero.backdrop_path})`;

            document.querySelector(".hero-title").textContent =
                hero.title || hero.name;

            document.querySelector(".hero-desc").textContent =
                hero.overview;

        }, 8000);


    }

    // Call Recommendation logic if logic exists
    if (window.loadRecommendations) {
        window.loadRecommendations();
    }
}

// Search functionality
const searchInput = document.getElementById('movieInput');
if (searchInput) {
    searchInput.addEventListener("input", async (e) => {
        const query = e.target.value.trim();
        const resultSection = document.getElementById("searchResultsSection");
        const resultContainer = document.getElementById("searchResults");

        if (query.length > 2) {
            resultSection.style.display = "block";
            resultContainer.innerHTML = '<div class="movie-card skeleton"></div><div class="movie-card skeleton"></div><div class="movie-card skeleton"></div>';

            const results = await window.api.searchMoviesQuery(query);
            let html = "";
            results.forEach(movie => {
                if (movie.poster_path) html += createMovieCard(movie, movie.media_type || 'movie');
            });

            resultContainer.innerHTML = html || "<p style='padding:20px; color:var(--text-muted);'>No results found</p>";

            if (window.db && firebase.auth().currentUser) {
                const uid = firebase.auth().currentUser.uid;
                db.collection("users").doc(uid).update({
                    searchHistory: firebase.firestore.FieldValue.arrayUnion(query)
                });
            }

        } else if (query.length === 0) {
            resultSection.style.display = "none";
        }
    });
}

// Admin Link Verification
firebase.auth().onAuthStateChanged((user) => {
    if (user && window.db) {
        db.collection("users").doc(user.uid).get().then(doc => {
            const adminLink = document.getElementById("adminLink");
            if (doc.exists && doc.data().role === 'admin' && adminLink) {
                adminLink.style.display = "block";
            }
        });
    }
});

// Run Init if on index page
if (document.getElementById("heroBanner")) {
    document.addEventListener("DOMContentLoaded", initHome);
}

// Expose generically for other pages
window.createMovieCard = createMovieCard;
window.goToMovie = goToMovie;