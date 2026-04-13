// Navbar & Side Drawer Logic

document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.getElementById("navbar");
    const hamburger = document.getElementById("hamburger");
    const sideDrawer = document.getElementById("sideDrawer");
    const drawerOverlay = document.getElementById("drawerOverlay");
    const closeDrawerBtn = document.getElementById("closeDrawer");

    // 1. Scroll Effect
    window.addEventListener("scroll", () => {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add("scrolled");
            } else {
                navbar.classList.remove("scrolled");
            }
        }
    });

    // 2. Hamburger Menu Toggle
    if (hamburger && sideDrawer && drawerOverlay) {
        hamburger.addEventListener("click", () => {
            sideDrawer.classList.add("active");
            drawerOverlay.classList.add("active");
            document.body.style.overflow = "hidden"; // Prevent background scroll
        });

        const closeDrawer = () => {
            sideDrawer.classList.remove("active");
            drawerOverlay.classList.remove("active");
            document.body.style.overflow = ""; // Restore scroll
        };

        drawerOverlay.addEventListener("click", closeDrawer);
        if (closeDrawerBtn) closeDrawerBtn.addEventListener("click", closeDrawer);
        
        // Also close on link click (for SPA-like feel or if links are on same page)
        const drawerLinks = sideDrawer.querySelectorAll("a");
        drawerLinks.forEach(link => {
            link.addEventListener("click", closeDrawer);
        });
    }
});

// 3. Search Toggle (Exposed globally for HTML onclick)
function toggleSearch() {
    const searchContainer = document.getElementById("searchContainer");
    if(searchContainer) {
        searchContainer.classList.toggle("active");
        if (searchContainer.classList.contains("active")) {
            const searchInput = document.getElementById("movieInput");
            if (searchInput) searchInput.focus();
        }
    }
}
