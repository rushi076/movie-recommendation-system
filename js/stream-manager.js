/**
 * StreamManager.js
 * Simplified Manual Stream Selector for CineMagic Player.
 */

class StreamManager {
    constructor(options) {
        this.tmdbId = options.id;
        this.type = options.type || 'movie';
        this.season = options.season || 1;
        this.episode = options.episode || 1;

        this.iframe = document.getElementById(options.iframeId);
        this.loader = document.getElementById(options.loaderId);
        this.statusElement = document.getElementById(options.statusId);

        // Settings
        this.ytApiKey = "AIzaSyCdHE0rwe0r-KmDzodkegjXxOW5ZdmBF8o";
        this.failTimer = null;
        this.failTimeout = 20000;

        // state flag (IMPORTANT FIX)
        this.isLoaded = false;

        this.providers = [
            {
                id: "vidsrc1",
                name: "VidSrc 1 (Primary)",
                movie: `https://vidsrc.to/embed/movie/${this.tmdbId}`,
                tv: `https://vidsrc.to/embed/tv/${this.tmdbId}/${this.season}/${this.episode}`
            },
            {
                id: "vidsrc2",
                name: "VidSrc 2",
                movie: `https://vidsrc.me/embed/movie?tmdb=${this.tmdbId}`,
                tv: `https://vidsrc.me/embed/tv?tmdb=${this.tmdbId}&season=${this.season}&episode=${this.episode}`
            },
            {
                id: "vidsrc3",
                name: "VidSrc 3",
                movie: `https://vidsrc.xyz/embed/movie/${this.tmdbId}`,
                tv: `https://vidsrc.xyz/embed/tv/${this.tmdbId}/${this.season}/${this.episode}`
            },
            {
                id: "youtube",
                name: "YouTube (Backup)",
                type: "youtube"
            }
        ];

        this.init();
    }

    init() {
        this.iframe.onload = () => {
            this.handleIframeLoad();
        };

        // default load
        this.switchToProvider(0);
    }

    switchToProvider(index) {
        const provider = this.providers[index];
        if (!provider) return;

        console.log(`Manual Selection: ${provider.name}`);

        this.clearFailTimer();
        this.isLoaded = false;

        // show loader
        if (this.loader) this.loader.style.display = 'flex';

        if (this.statusElement) {
            this.statusElement.innerText = `Connecting to ${provider.name}...`;
            this.statusElement.style.display = 'block';
            this.statusElement.style.background = 'rgba(0,0,0,0.5)';
        }

        const badge = document.getElementById('backupBadge');
        if (badge) badge.style.display = 'none';

        // ROUTING
        if (provider.type === "youtube") {
            this.handleYouTubeSelection();
        } else {
            const url = this.type === 'movie' ? provider.movie : provider.tv;
            this.iframe.style.display = 'block';
            this.iframe.src = url;
            this.startFailTimer();
        }

        const selector = document.getElementById('serverSelector');
        if (selector) selector.value = index;
    }

    handleIframeLoad() {
        console.log("Iframe load event detected.");

        this.isLoaded = true;

        // ONLY UI handling
        if (this.loader) this.loader.style.display = 'none';
        if (this.statusElement) this.statusElement.style.display = 'none';

        this.clearFailTimer();
    }

    startFailTimer() {
        this.clearFailTimer();

        this.failTimer = setTimeout(() => {
            if (!this.isLoaded) {
                this.showErrorMessage("Source not available. Please select another server.");
            }
        }, this.failTimeout);
    }

    clearFailTimer() {
        if (this.failTimer) {
            clearTimeout(this.failTimer);
            this.failTimer = null;
        }
    }

    async handleYouTubeSelection() {
        if (this.type !== 'movie') {
            this.showErrorMessage("YouTube is only for Movies.");
            return;
        }

        try {
            const cacheKey = `yt_${this.tmdbId}`;
            const cached = localStorage.getItem(cacheKey);

            if (cached) {
                this.embedYouTube(cached);
                return;
            }

            const details = await window.api.getMovieDetails(this.tmdbId, 'movie');
            const title = details.title;
            const year = details.release_date?.substring(0, 4) || "";

            const query = `${title} ${year} Full Movie`;

            console.log("Searching YouTube:", query);

            const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=5&key=${this.ytApiKey}`;
            const searchRes = await fetch(searchUrl);
            const searchData = await searchRes.json();

            if (!searchData.items?.length) {
                this.showErrorMessage("No YouTube results found.");
                return;
            }

            const videoIds = searchData.items.map(i => i.id.videoId).join(',');

            const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds}&key=${this.ytApiKey}`;
            const videoRes = await fetch(videoUrl);
            const videoData = await videoRes.json();

            // 🔥 FIXED FILTER (less strict)
            const filtered = videoData.items.filter(v => {
                const duration = this.parseDuration(v.contentDetails.duration);
                const titleLower = v.snippet.title.toLowerCase();

                return (
                    duration > 1800 && // FIXED (30 min instead of 60)
                    !titleLower.includes("trailer")
                );
            });

            if (!filtered.length) {
                this.showErrorMessage("No suitable movie found on YouTube.");
                return;
            }

            // BEST PICK
            filtered.sort((a, b) =>
                this.parseDuration(b.contentDetails.duration) -
                this.parseDuration(a.contentDetails.duration)
            );

            const bestId = filtered[0].id;
            localStorage.setItem(cacheKey, bestId);

            this.embedYouTube(bestId);

        } catch (err) {
            console.error(err);
            this.showErrorMessage("YouTube error occurred.");
        }
    }

    embedYouTube(videoId) {
        const url = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

        this.iframe.src = url;
        this.iframe.style.display = 'block';

        const badge = document.getElementById('backupBadge');
        if (badge) badge.style.display = 'block';

        if (this.loader) this.loader.style.display = 'none';
        if (this.statusElement) this.statusElement.style.display = 'none';

        this.clearFailTimer();
        this.isLoaded = true;
    }

    showErrorMessage(msg) {
        if (this.loader) this.loader.style.display = 'none';

        if (this.statusElement) {
            this.statusElement.innerText = msg;
            this.statusElement.style.display = 'block';
            this.statusElement.style.background = 'rgba(229, 9, 20, 0.8)';
        }
    }

    parseDuration(duration) {
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        const h = parseInt(match[1]) || 0;
        const m = parseInt(match[2]) || 0;
        const s = parseInt(match[3]) || 0;
        return h * 3600 + m * 60 + s;
    }
}

window.StreamManager = StreamManager;