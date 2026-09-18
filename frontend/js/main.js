const API_BASE_URL = "http://localhost:8080";

function escapeHtml(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function updateListingVisibility(user) {

    const listRoomNav =
        document.getElementById("listRoomNav");

    const listRoomHero =
        document.getElementById("listRoomHero");


    /*
     * ==========================================
     * NOT LOGGED IN
     * ==========================================
     */

    if (!user) {

        if (listRoomNav) {

            listRoomNav.href =
                "login.html?role=VENDOR&redirect=list-room.html";

        }

        if (listRoomHero) {

            listRoomHero.href =
                "login.html?role=VENDOR&redirect=list-room.html";

        }

        return;
    }


    /*
     * ==========================================
     * VENDOR
     * ==========================================
     */

    if (user.role === "VENDOR") {

        if (listRoomNav) {

            listRoomNav.href =
                "list-room.html";

        }

        if (listRoomHero) {

            listRoomHero.href =
                "list-room.html";

        }

        return;
    }


    /*
     * ==========================================
     * RENTER / USER
     * ==========================================
     */

    if (user.role === "USER") {

    if (listRoomNav) {
        listRoomNav.style.display = "none";
    }

    if (listRoomHero) {
        listRoomHero.style.display = "none";
    }

    return;
}


    /*
     * ==========================================
     * ADMIN
     * ==========================================
     */

    if (user.role === "ADMIN") {

        if (listRoomNav) {

            listRoomNav.href = "#";

            listRoomNav.onclick =
                function (event) {

                    event.preventDefault();

                    alert(
                        "Admin accounts cannot list rooms as Vendors."
                    );
                };
        }


        if (listRoomHero) {

            listRoomHero.href = "#";

            listRoomHero.onclick =
                function (event) {

                    event.preventDefault();

                    alert(
                        "Admin accounts cannot list rooms as Vendors."
                    );
                };
        }
    }
}

// ============================================================
// AUTHENTICATION / SESSION
// ============================================================

async function checkLoginSession() {
    const authLinks = document.getElementById("authLinks");

    if (!authLinks) {
        return;
    }

    try {
        const response = await fetch(
            "http://localhost:8080/api/auth/me",
            {
                method: "GET",
                credentials: "include"
            }
        );

        if (!response.ok) {
            showLoggedOutState(authLinks);
            return;
        }

        const data = await response.json();

        if (!data.success || !data.user) {
            showLoggedOutState(authLinks);
            return;
        }

        console.log("Logged-in user:", data.user);

        showLoggedInState(data.user);
        updateListingVisibility(data.user);

    } catch (error) {
        console.error("Session check failed:", error);
        showLoggedOutState(authLinks);
    }
}


// Show Login + Register when user is not logged in
function showLoggedOutState(authLinks) {

    authLinks.innerHTML = `
        <a href="login.html">Login</a>
    `;
}


// Show user information when logged in
function showLoggedInState(user) {
    const authLinks = document.getElementById("authLinks");

    if (!authLinks) return;

    authLinks.innerHTML = `
        <span class="user-name">👤 ${escapeHtml(user.name)}</span>

        ${
            user.role === "ADMIN"
                ? `<a href="admin.html" class="admin-dashboard-link">Admin Dashboard</a>`
                : ""
        }

        <a href="#" id="profileLink">My Profile</a>

        <button type="button"
                class="logout-btn"
                id="logoutBtn">
            Logout
        </button>
    `;

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logoutUser);
    }
}


// Logout user
async function logoutUser() {
    try {
        const response = await fetch(
            "http://localhost:8080/api/auth/logout",
            {
                method: "POST",
                credentials: "include"
            }
        );

        if (!response.ok) {
            throw new Error("Logout failed");
        }

        console.log("User logged out successfully.");

        // Reload home page
        window.location.href = "index.html";

    } catch (error) {
        console.error("Logout error:", error);

        alert(
            "Could not logout. Please try again."
        );
    }
}


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    // Check whether the user is logged in
    checkLoginSession();


    // ========================================================
    // MOBILE NAVIGATION
    // ========================================================

    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");

    if (menuToggle && navLinks) {

        menuToggle.addEventListener("click", () => {

            const open =
                navLinks.classList.toggle("open");

            menuToggle.setAttribute(
                "aria-expanded",
                String(open)
            );
        });


        // Close mobile menu after clicking a link
        navLinks
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener("click", () => {
                    navLinks.classList.remove("open");

                    if (menuToggle) {
                        menuToggle.setAttribute(
                            "aria-expanded",
                            "false"
                        );
                    }
                });

            });
    }


    // ========================================================
    // SCROLL REVEAL ANIMATIONS
    // ========================================================

    const revealItems =
        document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window) {

        const observer =
            new IntersectionObserver(
                (entries, obs) => {

                    entries.forEach((entry, index) => {

                        if (!entry.isIntersecting) {
                            return;
                        }

                        entry.target.style.setProperty(
                            "--reveal-delay",
                            `${Math.min(index * 60, 240)}ms`
                        );

                        entry.target.classList.add(
                            "visible"
                        );

                        obs.unobserve(entry.target);
                    });

                },
                {
                    threshold: 0.12
                }
            );

        revealItems.forEach(item => {
            observer.observe(item);
        });

    } else {

        revealItems.forEach(item => {
            item.classList.add("visible");
        });
    }


    // ========================================================
    // HOME LISTING CARDS
    // ========================================================

    const grid =
        document.getElementById("listingGrid");

    const viewAllBtn =
        document.getElementById("viewAllBtn");

    let showAll = false;


    function renderListings(items) {

    if (!grid) {
        return;
    }

    if (!items.length) {

        grid.innerHTML = `
            <div class="empty-state">
                <p>No listings found.</p>
            </div>
        `;

        return;
    }

    grid.innerHTML = items.map((item, index) => `

        <article
            class="listing-card reveal visible"
            style="--reveal-delay:${index * 60}ms"
        >

            <div class="listing-image-wrap">

                <img
                    src="${item.image}"
                    alt="${item.title}"
                    loading="${index > 1 ? "lazy" : "eager"}"
                >

                <span class="price-badge">
                    ${item.price}
                </span>

            </div>

            <div class="listing-content">

                <h3>
                    ${item.title}
                </h3>

                <p class="meta">
                    ⌖ ${item.location}
                </p>

                <p class="meta">
                    ⌂ ${item.type}
                </p>

                <p class="description">
                    ${item.description}
                </p>

                <button
                    class="card-btn request-home-btn"
                    data-id="${item.id}"
                    type="button"
                >
                    ☎
                    <span>
                        Request Home
                    </span>
                </button>

            </div>

        </article>

    `).join("");

    /*
     * ==========================================
     * REQUEST HOME
     * ==========================================
     */

    grid
        .querySelectorAll(".request-home-btn")
        .forEach(button => {

            button.addEventListener("click", async function () {

                const roomId =
                    button.dataset.id;

                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/auth/me`,
                            {
                                method: "GET",
                                credentials: "include"
                            }
                        );

                    /*
                     * Not logged in
                     */
                    if (!response.ok) {

                        window.location.href =
                            `login.html?role=USER&redirect=request-home.html&roomId=${encodeURIComponent(roomId)}`;

                        return;
                    }

                    const data =
                        await response.json();

                    if (
                        !data.success ||
                        !data.user
                    ) {

                        window.location.href =
                            `login.html?role=USER&redirect=request-home.html&roomId=${encodeURIComponent(roomId)}`;

                        return;
                    }

                    /*
                     * Vendor cannot request a home
                     */
                    if (
                        data.user.role === "VENDOR"
                    ) {

                        alert(
                            "You cannot request a home using a Vendor account.\n\nPlease login with a Renter account or create a Renter account."
                        );

                        return;
                    }

                    /*
                     * Admin cannot request a home
                     */
                    if (
                        data.user.role === "ADMIN"
                    ) {

                        alert(
                            "Admin accounts cannot request homes.\n\nPlease use a Renter account."
                        );

                        return;
                    }

                    /*
                     * Renter
                     */
                    if (
                        data.user.role === "USER"
                    ) {

                        window.location.href =
                            `request-home.html?roomId=${encodeURIComponent(roomId)}`;

                        return;
                    }

                } catch (error) {

                    console.error(
                        "Request Home authentication error:",
                        error
                    );

                    window.location.href =
                        `login.html?role=USER&redirect=request-home.html&roomId=${encodeURIComponent(roomId)}`;
                }

            });

        });
}


    // ========================================================
    // LOAD ROOMS FROM SPRING BOOT
    // ========================================================

    async function loadListings() {

        try {

            const response = await fetch(
                "http://localhost:8080/api/rooms"
            );


            if (!response.ok) {
                throw new Error(
                    "Failed to load rooms"
                );
            }


            listings = await response.json();


            console.log(
                "Rooms loaded from backend:",
                listings
            );


            // Show first 6 rooms
            renderListings(
                listings.slice(0, 6)
            );


        } catch (error) {

            console.error(
                "Error loading rooms:",
                error
            );


            if (grid) {

                grid.innerHTML = `
                    <div class="empty-state">
                        <p>
                            Unable to load rooms.
                            Please try again later.
                        </p>
                    </div>
                `;

            }
        }
    }


    // Load rooms when page opens
    if (grid) {
        loadListings();
    }


    // ========================================================
    // VIEW ALL LISTINGS
    // ========================================================

    if (viewAllBtn) {

        viewAllBtn.addEventListener(
            "click",
            () => {

                showAll = !showAll;


                renderListings(
                    showAll
                        ? listings
                        : listings.slice(0, 6)
                );


                viewAllBtn.textContent =
                    showAll
                        ? "Show Featured Listings"
                        : "View All Listings";

            }
        );
    }


    // ========================================================
    // SEARCH
    // ========================================================

    const searchForm =
        document.getElementById("searchForm");

    const searchInput =
        document.getElementById("searchInput");

    const searchStatus =
        document.getElementById("searchStatus");


    if (searchForm && searchInput) {

        searchForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const term =
                    searchInput.value
                        .trim()
                        .toLowerCase();


                // Empty search
                if (!term) {

                    document
                        .getElementById("featured")
                        ?.scrollIntoView({
                            behavior: "smooth"
                        });

                    return;
                }


                // Search rooms
                const matches =
                    listings.filter(item =>

                        `
                        ${item.title}
                        ${item.location}
                        ${item.type}
                        ${item.description}
                        `
                            .toLowerCase()
                            .includes(term)

                    );


                // Display results
                renderListings(matches);


                // Scroll to listings
                document
                    .getElementById("featured")
                    ?.scrollIntoView({
                        behavior: "smooth"
                    });


                // Search result message
                if (searchStatus) {

                    searchStatus.textContent =
                        `${matches.length} listing` +
                        `${matches.length === 1 ? "" : "s"} ` +
                        `found for "${term}".`;

                }

            }
        );
    }


    // ========================================================
    // PROPERTY MODAL
    // ========================================================

    const modal =
        document.getElementById("propertyModal");

    const closeModalButtons =
        document.querySelectorAll(
            "[data-close-modal]"
        );


    function openPropertyModal(id) {

        if (!modal) {
            return;
        }


        const item =
            listings.find(
                listing => listing.id === id
            );


        if (!item) {
            return;
        }


        document.getElementById(
            "modalImage"
        ).src = item.image;


        document.getElementById(
            "modalImage"
        ).alt = item.title;


        document.getElementById(
            "modalTitle"
        ).textContent = item.title;


        document.getElementById(
            "modalPrice"
        ).textContent = item.price;


        document.getElementById(
            "modalLocation"
        ).textContent =
            `⌖ ${item.location}`;


        document.getElementById(
            "modalType"
        ).textContent =
            `⌂ ${item.type}`;


        document.getElementById(
            "modalDescription"
        ).textContent =
            item.description;


        modal.classList.add("open");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );
    }


    function closeModal() {

        if (!modal) {
            return;
        }


        modal.classList.remove("open");

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );
    }


    // Close modal buttons
    closeModalButtons.forEach(button => {

        button.addEventListener(
            "click",
            closeModal
        );

    });


    // Close modal with Escape
    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {
                closeModal();
            }

        }
    );


    // ========================================================
    // CONTACT FORM - SPRING BOOT BACKEND
    // ========================================================

    const contactForm =
        document.getElementById("contactForm");

    const formStatus =
        document.getElementById("formStatus");


    if (contactForm) {

        contactForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const name =
                    contactForm
                        .querySelector(
                            '[name="name"]'
                        )
                        .value
                        .trim();


                const email =
                    contactForm
                        .querySelector(
                            '[name="email"]'
                        )
                        .value
                        .trim();


                const phone =
                    contactForm
                        .querySelector(
                            '[name="phone"]'
                        )
                        .value
                        .trim();


                const message =
                    contactForm
                        .querySelector(
                            '[name="message"]'
                        )
                        .value
                        .trim();


                if (formStatus) {

                    formStatus.textContent =
                        "Sending...";

                    formStatus.classList.remove(
                        "success"
                    );

                }


                try {

                    const response =
                        await fetch(
                            "http://localhost:8080/api/contact",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    name: name,
                                    email: email,
                                    phone: phone,
                                    message: message
                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Failed to send message."
                        );

                    }


                    if (formStatus) {

                        formStatus.textContent =
                            data.message;

                        formStatus.classList.add(
                            "success"
                        );

                    }


                    contactForm.reset();


                } catch (error) {

                    console.error(
                        "Contact form error:",
                        error
                    );


                    if (formStatus) {

                        formStatus.textContent =
                            "Unable to send your message. Please try again.";

                        formStatus.classList.remove(
                            "success"
                        );

                    }
                }
            }
        );
    }

});