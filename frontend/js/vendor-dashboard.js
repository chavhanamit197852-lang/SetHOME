const API_BASE_URL = "http://localhost:8080";

const vendorRooms =
    document.getElementById("vendorRooms");

const vendorStatus =
    document.getElementById("vendorStatus");

const vendorWelcome =
    document.getElementById("vendorWelcome");

const totalListings =
    document.getElementById("totalListings");

const pendingListings =
    document.getElementById("pendingListings");

const approvedListings =
    document.getElementById("approvedListings");

const rejectedListings =
    document.getElementById("rejectedListings");

const refreshVendorRooms =
    document.getElementById("refreshVendorRooms");

const vendorLogoutBtn =
    document.getElementById("vendorLogoutBtn");


function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/*
 * ==========================================
 * CHECK VENDOR LOGIN
 * ==========================================
 */

async function checkVendorAccess() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/auth/me`,
            {
                method: "GET",
                credentials: "include"
            }
        );


        if (!response.ok) {

            window.location.href =
                "login.html?role=VENDOR&redirect=vendor-dashboard.html";

            return false;
        }


        const data =
            await response.json();


        if (
            !data.success ||
            !data.user
        ) {

            window.location.href =
                "login.html?role=VENDOR&redirect=vendor-dashboard.html";

            return false;
        }


        if (
            data.user.role !== "VENDOR"
        ) {

            alert(
                "Vendor access required."
            );

            window.location.href =
                "index.html";

            return false;
        }


        vendorWelcome.textContent =
            `Welcome, ${data.user.name}. Manage your room listings here.`;

        return true;

    } catch (error) {

        console.error(
            "Vendor access check failed:",
            error
        );

        alert(
            "Unable to verify your account."
        );

        window.location.href =
            "index.html";

        return false;
    }
}


/*
 * ==========================================
 * LOAD VENDOR ROOMS
 * ==========================================
 */

async function loadVendorRooms() {

    vendorStatus.textContent =
        "Loading your listings...";

    vendorStatus.className =
        "form-status";


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/vendor/rooms`,
            {
                method: "GET",
                credentials: "include"
            }
        );


        if (response.status === 401) {

            window.location.href =
                "login.html?role=VENDOR&redirect=vendor-dashboard.html";

            return;
        }


        if (response.status === 403) {

            alert(
                "Vendor access required."
            );

            window.location.href =
                "index.html";

            return;
        }


        if (!response.ok) {

            throw new Error(
                "Failed to load vendor listings."
            );
        }


        const rooms =
            await response.json();


        updateStatistics(rooms);

        renderVendorRooms(rooms);


        vendorStatus.textContent =
            `${rooms.length} listing(s) found.`;

        vendorStatus.className =
            "form-status success";


    } catch (error) {

        console.error(
            "Vendor rooms error:",
            error
        );

        vendorStatus.textContent =
            "Unable to load your listings.";

        vendorStatus.className =
            "form-status error";
    }
}


/*
 * ==========================================
 * STATISTICS
 * ==========================================
 */

function updateStatistics(rooms) {

    const pending =
        rooms.filter(
            room => room.status === "PENDING"
        ).length;


    const approved =
        rooms.filter(
            room => room.status === "APPROVED"
        ).length;


    const rejected =
        rooms.filter(
            room => room.status === "REJECTED"
        ).length;


    totalListings.textContent =
        rooms.length;

    pendingListings.textContent =
        pending;

    approvedListings.textContent =
        approved;

    rejectedListings.textContent =
        rejected;
}


/*
 * ==========================================
 * RENDER ROOMS
 * ==========================================
 */

function renderVendorRooms(rooms) {

    if (
        !rooms ||
        rooms.length === 0
    ) {

        vendorRooms.innerHTML = `

            <div class="vendor-empty-card">

                <div class="vendor-empty-icon">
                    +
                </div>

                <h3>No listings yet</h3>

                <p>
                    You have not submitted any room listings.
                </p>

                <a
                    href="list-room.html"
                    class="btn btn-primary"
                >
                    List Your First Room
                </a>

            </div>

        `;

        return;
    }


    vendorRooms.innerHTML =
        rooms.map(room => {

            const status =
                room.status || "UNKNOWN";


            const statusClass =
                status.toLowerCase();


            const imageHtml =
                room.image

                ? `
                    <img
                        src="${escapeHtml(room.image)}"
                        alt="${escapeHtml(room.title)}"
                    >
                  `

                : `
                    <div class="vendor-no-image">
                        No Image
                    </div>
                  `;


            const rejectionHtml =
                status === "REJECTED" &&
                room.rejectionReason

                ? `
                    <div class="vendor-rejection">

                        <strong>
                            Rejection Reason
                        </strong>

                        <p>
                            ${escapeHtml(
                                room.rejectionReason
                            )}
                        </p>

                    </div>
                  `

                : "";


            return `

                <article class="vendor-room-card">

                    <div class="vendor-room-image">

                        ${imageHtml}

                    </div>


                    <div class="vendor-room-content">

                        <div class="vendor-room-top">

                            <span class="eyebrow">
                                ${escapeHtml(room.type)}
                            </span>

                            <span
                                class="
                                    vendor-status-badge
                                    ${statusClass}
                                "
                            >
                                ${escapeHtml(status)}
                            </span>

                        </div>


                        <h3>
                            ${escapeHtml(room.title)}
                        </h3>


                        <p class="vendor-room-meta">
                            📍 ${escapeHtml(room.location)}
                        </p>


                        <p class="vendor-room-price">
                            ₹${escapeHtml(room.price)}
                        </p>


                        <p class="vendor-room-description">
                            ${escapeHtml(room.description)}
                        </p>


                        ${rejectionHtml}

                    </div>

                </article>

            `;

        }).join("");
}


/*
 * ==========================================
 * LOGOUT
 * ==========================================
 */

async function logoutVendor() {

    try {

        await fetch(
            `${API_BASE_URL}/api/auth/logout`,
            {
                method: "POST",
                credentials: "include"
            }
        );

    } catch (error) {

        console.error(
            "Vendor logout error:",
            error
        );

    } finally {

        window.location.href =
            "index.html";
    }
}


/*
 * ==========================================
 * EVENTS
 * ==========================================
 */

if (refreshVendorRooms) {

    refreshVendorRooms.addEventListener(
        "click",
        loadVendorRooms
    );
}


if (vendorLogoutBtn) {

    vendorLogoutBtn.addEventListener(
        "click",
        logoutVendor
    );
}


/*
 * ==========================================
 * INITIALIZE
 * ==========================================
 */

async function initializeVendorDashboard() {

    const isVendor =
        await checkVendorAccess();


    if (!isVendor) {
        return;
    }


    await loadVendorRooms();
}


initializeVendorDashboard();