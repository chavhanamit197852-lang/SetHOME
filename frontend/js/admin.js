const API_BASE_URL = "http://localhost:8080";

const pendingRooms =
    document.getElementById("pendingRooms");

const adminStatus =
    document.getElementById("adminStatus");

const refreshRoomsBtn =
    document.getElementById("refreshRoomsBtn");

const adminLogoutBtn =
    document.getElementById("adminLogoutBtn");


// ============================================================
// HTML ESCAPE
// ============================================================

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


// ============================================================
// CHECK ADMIN ACCESS
// ============================================================

async function checkAdminAccess() {

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
                "login.html?role=ADMIN&redirect=admin.html";

            return false;
        }


        const data =
            await response.json();


        if (
            !data.success ||
            !data.user ||
            data.user.role !== "ADMIN"
        ) {

            alert(
                "Admin access required."
            );

            window.location.href =
                "index.html";

            return false;
        }


        return true;

    } catch (error) {

        console.error(error);

        alert(
            "Unable to verify admin access."
        );

        window.location.href =
            "index.html";

        return false;
    }
}


// ============================================================
// LOAD PENDING ROOMS
// ============================================================

async function loadPendingRooms() {

    adminStatus.textContent =
        "Loading pending listings...";

    adminStatus.className =
        "form-status";


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/admin/rooms/pending`,
            {
                method: "GET",
                credentials: "include"
            }
        );


        if (response.status === 401) {

            window.location.href =
                "login.html?role=ADMIN&redirect=admin.html";

            return;
        }


        if (response.status === 403) {

            alert(
                "Admin access required."
            );

            window.location.href =
                "index.html";

            return;
        }


        if (!response.ok) {

            throw new Error(
                "Failed to load pending rooms."
            );
        }


        const rooms =
            await response.json();


        adminStatus.textContent =
            `${rooms.length} pending listing(s)`;

        adminStatus.className =
            "form-status success";


        renderPendingRooms(rooms);

    } catch (error) {

        console.error(error);

        adminStatus.textContent =
            "Unable to load pending listings.";

        adminStatus.className =
            "form-status error";
    }
}


// ============================================================
// RENDER PENDING ROOMS
// ============================================================

function renderPendingRooms(rooms) {

    if (!rooms || rooms.length === 0) {

        pendingRooms.innerHTML = `
            <div class="admin-empty-card">

                <div class="admin-empty-icon">
                    ✓
                </div>

                <h3>No pending listings</h3>

                <p>
                    There are currently no rooms
                    waiting for approval.
                </p>

            </div>
        `;

        return;
    }


    pendingRooms.innerHTML =
        rooms.map(room => {

            const imageHtml =
                room.image
                    ? `
                        <img
                            src="${escapeHtml(room.image)}"
                            alt="${escapeHtml(room.title)}"
                        >
                    `
                    : `
                        <div class="admin-no-image">
                            No Image
                        </div>
                    `;


            return `
                <article class="admin-room-card">

                    <div class="admin-room-image">
                        ${imageHtml}
                    </div>


                    <div class="admin-room-content">

                        <div class="admin-room-top">

                            <span class="eyebrow blue">
                                ${escapeHtml(room.type)}
                            </span>

                            <span class="admin-status-badge">
                                ${escapeHtml(room.status)}
                            </span>

                        </div>


                        <h3>
                            ${escapeHtml(room.title)}
                        </h3>


                        <p class="admin-room-meta">
                            📍 ${escapeHtml(room.location)}
                        </p>


                        <p class="admin-room-price">
                            ₹${escapeHtml(room.price)}
                        </p>


                        <p class="admin-room-description">
                            ${escapeHtml(room.description)}
                        </p>


                        <div class="admin-vendor-info">

                            <strong>
                                Vendor
                            </strong>

                            <span>
                                ${escapeHtml(room.vendorEmail)}
                            </span>

                        </div>


                        <div class="admin-actions">

                            <button
                                type="button"
                                class="btn btn-primary"
                                onclick="approveRoom(${room.id})"
                            >
                                Approve
                            </button>


                            <button
                                type="button"
                                class="btn btn-secondary"
                                onclick="rejectRoom(${room.id})"
                            >
                                Reject
                            </button>

                        </div>

                    </div>

                </article>
            `;

        }).join("");
}


// ============================================================
// APPROVE ROOM
// ============================================================

async function approveRoom(id) {

    const confirmed =
        confirm(
            "Are you sure you want to approve this listing?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/admin/rooms/${id}/approve`,
            {
                method: "PATCH",
                credentials: "include"
            }
        );


        if (response.status === 401) {

            window.location.href =
                "login.html?role=ADMIN&redirect=admin.html";

            return;
        }


        if (response.status === 403) {

            alert(
                "Admin access required."
            );

            return;
        }


        if (!response.ok) {

            throw new Error(
                "Approval failed."
            );
        }


        alert(
            "Room approved successfully."
        );


        await loadPendingRooms();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to approve the room."
        );
    }
}


// ============================================================
// REJECT ROOM
// ============================================================

async function rejectRoom(id) {

    const reason =
        prompt(
            "Enter the reason for rejecting this listing:"
        );


    if (reason === null) {
        return;
    }


    const trimmedReason =
        reason.trim();


    if (!trimmedReason) {

        alert(
            "A rejection reason is required."
        );

        return;
    }


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/admin/rooms/${id}/reject`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({
                    reason: trimmedReason
                })
            }
        );


        if (response.status === 401) {

            window.location.href =
                "login.html?role=ADMIN&redirect=admin.html";

            return;
        }


        if (response.status === 403) {

            alert(
                "Admin access required."
            );

            return;
        }


        if (!response.ok) {

            throw new Error(
                "Rejection failed."
            );
        }


        alert(
            "Room rejected successfully."
        );


        await loadPendingRooms();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to reject the room."
        );
    }
}


// ============================================================
// LOGOUT
// ============================================================

async function logoutAdmin() {

    try {

        await fetch(
            `${API_BASE_URL}/api/auth/logout`,
            {
                method: "POST",
                credentials: "include"
            }
        );

    } catch (error) {

        console.error(error);

    } finally {

        window.location.href =
            "index.html";
    }
}


// ============================================================
// EVENTS
// ============================================================

if (refreshRoomsBtn) {

    refreshRoomsBtn.addEventListener(
        "click",
        loadPendingRooms
    );
}


if (adminLogoutBtn) {

    adminLogoutBtn.addEventListener(
        "click",
        logoutAdmin
    );
}


// ============================================================
// INITIALIZE
// ============================================================

async function initializeAdminDashboard() {

    const isAdmin =
        await checkAdminAccess();


    if (!isAdmin) {
        return;
    }


    await loadPendingRooms();
}


initializeAdminDashboard();