const API_BASE_URL = "http://localhost:8080";

const requestsContainer =
    document.getElementById("renterRequests");

const totalRequests =
    document.getElementById("totalRequests");

const pendingRequests =
    document.getElementById("pendingRequests");

const approvedRequests =
    document.getElementById("approvedRequests");

const rejectedRequests =
    document.getElementById("rejectedRequests");

const dashboardStatus =
    document.getElementById("renterStatus");


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


function formatDate(value) {

    if (!value) {
        return "Unknown date";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


function statusClass(status) {

    switch (status) {

        case "APPROVED":
            return "approved";

        case "REJECTED":
            return "rejected";

        case "CONTACTED":
            return "contacted";

        default:
            return "pending";
    }
}


function updateStats(requests) {

    const total = requests.length;

    const pending =
        requests.filter(
            request => request.status === "PENDING"
        ).length;

    const approved =
        requests.filter(
            request => request.status === "APPROVED"
        ).length;

    const rejected =
        requests.filter(
            request => request.status === "REJECTED"
        ).length;


    totalRequests.textContent = total;
    pendingRequests.textContent = pending;
    approvedRequests.textContent = approved;
    rejectedRequests.textContent = rejected;
}


function renderRequests(requests) {

    if (!requestsContainer) {
        return;
    }


    if (!requests || requests.length === 0) {

        requestsContainer.innerHTML = `
            <div class="renter-empty-card">

                <div class="renter-empty-icon">
                    ⌂
                </div>

                <h3>No requests yet</h3>

                <p>
                    Your room requests will appear here after
                    you submit your first request.
                </p>

                <a
                    href="index.html#featured"
                    class="btn btn-primary"
                >
                    Find a Room
                </a>

            </div>
        `;

        return;
    }


    requestsContainer.innerHTML =
        requests.map(request => `

            <article class="renter-request-card">

                <div class="renter-request-card-header">

                    <div>

                        <span class="eyebrow">
                            Request #${escapeHtml(request.requestId)}
                        </span>

                        <h3>
                            ${escapeHtml(request.roomTitle)}
                        </h3>

                    </div>

                    <span class="request-status ${statusClass(request.status)}">
                        ${escapeHtml(request.status)}
                    </span>

                </div>


                <div class="renter-request-info">

                    <p>
                        📍
                        <strong>Location:</strong>
                        ${escapeHtml(request.roomLocation)}
                    </p>

                    <p>
                        💰
                        <strong>Price:</strong>
                        ${escapeHtml(request.roomPrice)}
                    </p>

                    <p>
                        📅
                        <strong>Requested:</strong>
                        ${formatDate(request.createdAt)}
                    </p>

                    <p>
                        👤
                        <strong>Name:</strong>
                        ${escapeHtml(request.name)}
                    </p>

                    <p>
                        💼
                        <strong>Occupation:</strong>
                        ${escapeHtml(request.occupation)}
                    </p>

                    <p>
                        🏙️
                        <strong>Pune Duration:</strong>
                        ${escapeHtml(request.puneDuration)}
                    </p>

                </div>


                ${
                    request.message
                        ? `
                            <div class="renter-request-message">

                                <strong>Your Message</strong>

                                <p>
                                    ${escapeHtml(request.message)}
                                </p>

                            </div>
                          `
                        : ""
                }


                ${
                    request.adminReason
                        ? `
                            <div class="renter-admin-response">

                                <strong>
                                    Admin Response
                                </strong>

                                <p>
                                    ${escapeHtml(request.adminReason)}
                                </p>

                            </div>
                          `
                        : ""
                }

            </article>

        `).join("");
}


async function checkRenterAccess() {

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
                "login.html?role=USER&redirect=renter-dashboard.html";

            return false;
        }


        const data =
            await response.json();


        if (
            !data.success ||
            !data.user ||
            data.user.role !== "USER"
        ) {

            alert("Renter access required.");

            window.location.href =
                "index.html";

            return false;
        }


        const welcome =
            document.getElementById("renterWelcome");

        if (welcome) {

            welcome.textContent =
                `Welcome, ${data.user.name}. Manage your room requests here.`;
        }


        return true;

    } catch (error) {

        console.error(
            "Renter access check failed:",
            error
        );

        window.location.href =
            "login.html?role=USER&redirect=renter-dashboard.html";

        return false;
    }
}


async function loadRequests() {

    dashboardStatus.textContent =
        "Loading your requests...";

    dashboardStatus.className =
        "form-status";


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/user/home-requests`,
            {
                method: "GET",
                credentials: "include"
            }
        );


        if (response.status === 401) {

            window.location.href =
                "login.html?role=USER&redirect=renter-dashboard.html";

            return;
        }


        if (response.status === 403) {

            alert("Renter access required.");

            window.location.href =
                "index.html";

            return;
        }


        if (!response.ok) {

            throw new Error(
                "Failed to load home requests."
            );
        }


        const requests =
            await response.json();


        updateStats(requests);

        renderRequests(requests);


        dashboardStatus.textContent =
            `${requests.length} home request(s)`;

        dashboardStatus.className =
            "form-status success";


    } catch (error) {

        console.error(
            "Request loading error:",
            error
        );


        dashboardStatus.textContent =
            "Unable to load your requests.";

        dashboardStatus.className =
            "form-status error";


        requestsContainer.innerHTML = `
            <div class="renter-empty-card">

                <h3>
                    Unable to load requests
                </h3>

                <p>
                    Please refresh the page and try again.
                </p>

            </div>
        `;
    }
}


async function logoutRenter() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/auth/logout`,
            {
                method: "POST",
                credentials: "include"
            }
        );


        if (!response.ok) {
            throw new Error("Logout failed");
        }


        window.location.href =
            "index.html";


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

        alert(
            "Could not logout. Please try again."
        );
    }
}


document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const allowed =
            await checkRenterAccess();

        if (!allowed) {
            return;
        }


        await loadRequests();


        const logoutBtn =
            document.getElementById("renterLogoutBtn");

        if (logoutBtn) {

            logoutBtn.addEventListener(
                "click",
                logoutRenter
            );
        }

    }
);