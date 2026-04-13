// Recommendation Engine
window.loadRecommendations = function() {
    firebase.auth().onAuthStateChanged(async (user) => {
        const recContainer = document.getElementById("recommendedMovies");
        if (!recContainer) return; // not on home page

        if (!user || !window.db) {
            // Not logged in -> Fallback to Popular Movies / Default Action Movies
            const defaultM = await window.api.fetchMovies(window.api.req.action);
            injectMovies(defaultM, recContainer);
            return;
        }

        try {
            const doc = await db.collection("users").doc(user.uid).get();
            if (!doc.exists) {
                fallbackRec(recContainer);
                return;
            }

            const data = doc.data();
            const liked = data.likedMovies || [];
            const viewed = data.recentlyViewed || [];
            
            // Collect seeding IDs
            // Use last 2 liked/viewed movies to find similarities
            const seedIdsRaw = [...liked, ...viewed].slice(-2); 
            
            // Parse for backward compatibility: if Number return it, if "type_id" extract id and type natively (recommendations best with movies but tmdb supports tv similar)
            const seedItems = seedIdsRaw.map(s => {
                if(typeof s === 'number') return {id: s, type: 'movie'};
                const parts = String(s).split('_');
                return {type: parts[0], id: parseInt(parts[1])};
            });

            if (seedItems.length === 0) {
                // If no history, maybe search history?
                const searches = data.searchHistory || [];
                if(searches.length > 0) {
                    const searchRes = await window.api.searchMoviesQuery(searches[searches.length - 1]);
                    injectMovies(searchRes, recContainer);
                    return;
                }

                fallbackRec(recContainer);
                return;
            }

            // Fetch similar movies/tv for seeds
            let recs = [];
            for (const item of seedItems) {
                try {
                    const res = await fetch(`${window.api.BASE_URL}/${item.type}/${item.id}/similar?api_key=${document.querySelector('script[src="js/api.js"]') ? window.api.req.popular.split('api_key=')[1].split('&')[0] : 'be5afabb1e2e6f7a6291070ec34bf934'}`);
                    const json = await res.json();
                    
                    if(json.results) {
                        // Tag results with media_type for goToMovie
                        json.results.forEach(val => val.media_type = item.type);
                        recs = [...recs, ...json.results];
                    }
                } catch(e) {}
            }

            // Remove duplicates
            const uniqueRecs = getUniqueMovies(recs).sort(() => 0.5 - Math.random()).slice(0, 15);
            
            if (uniqueRecs.length > 0) {
                injectMovies(uniqueRecs, recContainer);
            } else {
                fallbackRec(recContainer);
            }

        } catch (e) {
            console.error("Error generating recommendations: ", e);
            fallbackRec(recContainer);
        }
    });
};

async function fallbackRec(container) {
    const defaultM = await window.api.fetchMovies(window.api.req.action);
    injectMovies(defaultM, container);
}

function injectMovies(movies, container) {
    let html = "";
    movies.forEach(movie => {
        if (movie.poster_path) {
            const poster = `${window.api.IMG_URL}${movie.poster_path}`;
            const title = movie.title || movie.name || "Unknown";
            const rating = (movie.vote_average || 0).toFixed(1);
            const mType = movie.media_type || 'movie';
            
            html += `
                <div class="movie-card" onclick="goToMovie(${movie.id}, '${mType}')">
                    <img src="${poster}" alt="${title}" loading="lazy">
                    <div class="movie-overlay">
                        <h4>${title}</h4>
                        <div class="meta">
                            <span class="rating">${rating} Rating</span>
                        </div>
                    </div>
                </div>
            `;
        }
    });

    container.innerHTML = html || "<p style='padding:20px'>No recommendations right now. Go like some movies!</p>";
}

function getUniqueMovies(movies) {
    const map = new Map();
    for (const item of movies) {
        if (!map.has(item.id)) {
            map.set(item.id, item);
        }
    }
    return Array.from(map.values());
}
