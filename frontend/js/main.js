document.addEventListener("DOMContentLoaded", () => {
  // Mobile navigation
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });

    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => navLinks.classList.remove("open"));
    });
  }

  // Scroll reveal
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry, index) => {
        if (!entry.isIntersecting) return;
        entry.target.style.setProperty("--reveal-delay", `${Math.min(index * 60, 240)}ms`);
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("visible"));
  }

 // Home listing cards
const grid = document.getElementById("listingGrid");
const viewAllBtn = document.getElementById("viewAllBtn");
let showAll = false;

function renderListings(items) {
    if (!grid) return;

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
                <h3>${item.title}</h3>

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
                    class="card-btn"
                    data-id="${item.id}"
                >
                    ☎ <span>Contact for Details</span>
                </button>
            </div>
        </article>
    `).join("");

    grid.querySelectorAll(".card-btn").forEach(button => {
        button.addEventListener("click", () => {
            openPropertyModal(Number(button.dataset.id));
        });
    });
}


// Load rooms from Spring Boot
async function loadListings() {
    try {
        const response = await fetch(
            "http://localhost:8080/api/rooms"
        );

        if (!response.ok) {
            throw new Error("Failed to load rooms");
        }

        listings = await response.json();

        console.log("Rooms loaded from backend:", listings);

        renderListings(listings.slice(0, 6));

    } catch (error) {
        console.error("Error loading rooms:", error);

        if (grid) {
            grid.innerHTML = `
                <div class="empty-state">
                    <p>
                        Unable to load rooms. Please try again later.
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


// View all listings
if (viewAllBtn) {
    viewAllBtn.addEventListener("click", () => {

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
    });
}

  // Search
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const searchStatus = document.getElementById("searchStatus");

  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", event => {
      event.preventDefault();
      const term = searchInput.value.trim().toLowerCase();
      if (!term) {
        document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" });
        return;
      }
      const matches = listings.filter(item =>
        `${item.title} ${item.location} ${item.type} ${item.description}`.toLowerCase().includes(term)
      );
      renderListings(matches);
      document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" });
      if (searchStatus) searchStatus.textContent = `${matches.length} listing${matches.length === 1 ? "" : "s"} found for "${term}".`;
    });
  }

  // Property modal
  const modal = document.getElementById("propertyModal");
  const closeModalButtons = document.querySelectorAll("[data-close-modal]");

  function openPropertyModal(id) {
    if (!modal) return;
    const item = listings.find(listing => listing.id === id);
    if (!item) return;
    document.getElementById("modalImage").src = item.image;
    document.getElementById("modalImage").alt = item.title;
    document.getElementById("modalTitle").textContent = item.title;
    document.getElementById("modalPrice").textContent = item.price;
    document.getElementById("modalLocation").textContent = `⌖ ${item.location}`;
    document.getElementById("modalType").textContent = `⌂ ${item.type}`;
    document.getElementById("modalDescription").textContent = item.description;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  closeModalButtons.forEach(button => button.addEventListener("click", closeModal));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeModal();
  });

  // Contact form - Spring Boot backend
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = contactForm
            .querySelector('[name="name"]')
            .value
            .trim();

        const email = contactForm
            .querySelector('[name="email"]')
            .value
            .trim();

        const phone = contactForm
            .querySelector('[name="phone"]')
            .value
            .trim();

        const message = contactForm
            .querySelector('[name="message"]')
            .value
            .trim();

        if (formStatus) {
            formStatus.textContent = "Sending...";
            formStatus.classList.remove("success");
        }

        try {
            const response = await fetch(
                "http://localhost:8080/api/contact",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        phone: phone,
                        message: message
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to send message."
                );
            }

            if (formStatus) {
                formStatus.textContent = data.message;
                formStatus.classList.add("success");
            }

            contactForm.reset();

        } catch (error) {

            console.error("Contact form error:", error);

            if (formStatus) {
                formStatus.textContent =
                    "Unable to send your message. Please try again.";

                formStatus.classList.remove("success");
            }
        }
    });
}

});