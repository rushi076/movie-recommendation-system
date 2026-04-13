const API_KEY = "be5afabb1e2e6f7a6291070ec34bf934"; // Original API Key from current code
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const ORIGINAL_IMG_URL = "https://image.tmdb.org/t/p/original";

// Endpoints
const req = {
    trending: `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=en-US`,
    topRated: `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US`,
    action: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28`,
    popular: `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US`,
    
    // TV Series Endpoints
    trendingTV: `${BASE_URL}/trending/tv/week?api_key=${API_KEY}&language=en-US`,
    popularTV: `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US`,
    topRatedTV: `${BASE_URL}/tv/top_rated?api_key=${API_KEY}&language=en-US`
};

// Generic fetch function
async function fetchMovies(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error("Error fetching movies: ", error);
        return [];
    }
}

async function searchMoviesQuery(query) {
    try {
        const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`);
        const data = await response.json();
        // Filter out actors/people, keep only TV and Movies
        return data.results.filter(item => item.media_type !== 'person');
    } catch(err) {
        console.error("Error searching: ", err);
        return [];
    }
}

async function getMovieDetails(id, type = 'movie') {
    try {
        const res = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&append_to_response=videos,credits`);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Error fetching details: ", err);
        return null;
    }
}

async function getProviders(id, type = 'movie') {
    try {
        const res = await fetch(`${BASE_URL}/${type}/${id}/watch/providers?api_key=${API_KEY}`);
        const data = await res.json();
        return data.results;
    } catch (err) {
        return null;
    }
}

async function getSeasonDetails(tvId, seasonNumber) {
    try {
        const res = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}`);
        const data = await res.json();
        return data;
    } catch (err) {
        return null;
    }
}

// Global functions accessible everywhere
window.api = {
    fetchMovies,
    searchMoviesQuery,
    getMovieDetails,
    getProviders,
    getSeasonDetails,
    req,
    IMG_URL,
    ORIGINAL_IMG_URL
};
