Chart.defaults.color = '#e5e5e5';
Chart.defaults.font.family = "'Inter', sans-serif";

document.addEventListener("DOMContentLoaded", () => {
    // Authenticate Admin
    firebase.auth().onAuthStateChanged(async (user) => {
        if (!user || !window.db) {
            blockAccess();
            return;
        }

        try {
            const doc = await db.collection("users").doc(user.uid).get();
            if (doc.exists && doc.data().role === 'admin') {
                document.getElementById('adminContent').style.display = 'block';
                loadDashboardData();
            } else {
                blockAccess();
            }
        } catch (e) {
            console.error("Admin check failed", e);
            blockAccess();
        }
    });

    function blockAccess() {
        document.getElementById('adminContent').style.display = 'none';
        document.getElementById('unauthorizedMsg').style.display = 'block';
    }

    async function loadDashboardData() {
        try {
            const snapshot = await db.collection("users").get();

            let totalUsers = 0;
            let totalLikes = 0;
            let active7Days = 0;

            let searchesMap = {};
            let rolesMap = { 'admin': 0, 'user': 0 };
            let likesMap = {};

            const now = new Date();
            const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

            let usersHTML = "";

            snapshot.forEach(doc => {
                totalUsers++;
                const data = doc.data();

                const likes = data.likedMovies || [];
                totalLikes += likes.length;
                likes.forEach(item => {
                    likesMap[item] = (likesMap[item] || 0) + 1;
                });

                if (data.role) {
                    rolesMap[data.role] = (rolesMap[data.role] || 0) + 1;
                }

                if (data.lastActive && data.lastActive.toDate) {
                    const activeDate = data.lastActive.toDate();
                    if (activeDate >= sevenDaysAgo) {
                        active7Days++;
                    }
                }

                (data.searchHistory || []).forEach(term => {
                    const t = term.toLowerCase().trim();
                    searchesMap[t] = (searchesMap[t] || 0) + 1;
                });

                // Generate table row (top 50)
                if (totalUsers <= 50) {
                    usersHTML += `
                        <tr>
                            <td>${data.email || 'N/A'}</td>
                            <td>${data.username || 'Anonymous'}</td>
                            <td><span style="background:${data.role === 'admin' ? '#e50914' : '#333'}; padding: 3px 8px; border-radius:10px; font-size:0.8rem;">${data.role || 'user'}</span></td>
                            <td>${data.lastActive?.toDate ? data.lastActive.toDate().toLocaleDateString() : 'Never'}</td>
                        </tr>
                    `;
                }
            });

            document.getElementById('usersList').innerHTML = usersHTML;

            // Most Liked Computation
            let topLikedId = null;
            let topLikedCount = 0;
            for (const [id, count] of Object.entries(likesMap)) {
                if (count > topLikedCount) {
                    topLikedCount = count;
                    topLikedId = id;
                }
            }

            if (topLikedId) {
                const type = typeof topLikedId === 'string' && topLikedId.includes('_') ? topLikedId.split('_')[0] : 'movie';
                const parsedId = typeof topLikedId === 'string' && topLikedId.includes('_') ? topLikedId.split('_')[1] : topLikedId;

                try {
                    const topMovie = await window.api.getMovieDetails(parsedId, type);
                    if (topMovie) {
                        document.getElementById('statTopLiked').innerText = `${topMovie.title || topMovie.name} (${topLikedCount} Likes)`;
                    } else {
                        document.getElementById('statTopLiked').innerText = `ID: ${parsedId} (${topLikedCount} Likes)`;
                    }
                } catch (e) {
                    document.getElementById('statTopLiked').innerText = "Varies";
                }
            }

            // Update stats
            document.getElementById('statTotalUsers').innerText = totalUsers;
            document.getElementById('statTotalLikes').innerText = totalLikes;
            document.getElementById('statActiveUsers').innerText = active7Days;

            // Render Search Chart
            let searchArr = Object.entries(searchesMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
            renderBarChart('searchChart', searchArr.map(s => s[0]), searchArr.map(s => s[1]));

            // Render Role Chart
            renderDoughnutChart('roleChart', Object.keys(rolesMap), Object.values(rolesMap));

        } catch (e) {
            console.error("Error loading dashboard data", e);
        }
    }

    function renderBarChart(id, labels, data) {
        const ctx = document.getElementById(id).getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Search Count',
                    data: data,
                    backgroundColor: 'rgba(229, 9, 20, 0.7)',
                    borderColor: 'rgba(229, 9, 20, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    function renderDoughnutChart(id, labels, data) {
        const ctx = document.getElementById(id).getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        'rgba(229, 9, 20, 0.8)',
                        'rgba(51, 51, 51, 0.8)'
                    ],
                    borderColor: '#141414',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

});
