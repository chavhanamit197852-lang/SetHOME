const API_BASE_URL = "http://localhost:8080";

const params = new URLSearchParams(window.location.search);
const roomId = params.get("roomId");

const selectedRoom = document.getElementById("selectedRoom");
const requestForm = document.getElementById("requestForm");
const requestStatus = document.getElementById("requestStatus");
const submitRequestBtn = document.getElementById("submitRequestBtn");


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
                `login.html?role=USER&redirect=request-home.html&roomId=${encodeURIComponent(roomId || "")}`;

            return false;
        }

        const data = await response.json();

        if (!data.success || !data.user) {

            window.location.href =
                `login.html?role=USER&redirect=request-home.html&roomId=${encodeURIComponent(roomId || "")}`;

            return false;
        }


        if (data.user.role === "VENDOR") {

            alert(
                "You cannot request a home using a Vendor account.\n\nPlease login with a Renter account."
            );

            window.location.href = "index.html";

            return false;
        }


        if (data.user.role === "ADMIN") {

            alert(
                "Admin accounts cannot request homes.\n\nPlease use a Renter account."
            );

            window.location.href = "index.html";

            return false;
        }


        if (data.user.role !== "USER") {

            alert("A Renter account is required to request a home.");

            window.location.href = "index.html";

            return false;
        }


        return true;

    } catch (error) {

        console.error(
            "Renter authentication check failed:",
            error
        );

        window.location.href =
            `login.html?role=USER&redirect=request-home.html&roomId=${encodeURIComponent(roomId || "")}`;

        return false;
    }
}


async function loadRoom() {

    if (!roomId) {

        selectedRoom.innerHTML = `
            <p class="form-status error">
                No home was selected.
            </p>
        `;

        requestForm.style.display = "none";

        return;
    }


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/rooms/${encodeURIComponent(roomId)}`
        );

        if (!response.ok) {

            throw new Error(
                "Could not load home."
            );
        }


        const room = await response.json();


        selectedRoom.innerHTML = `

            <div class="listing-card">

                <div class="listing-image-wrap">

                    <img
                        src="${escapeHtml(room.image || "")}"
                        alt="${escapeHtml(room.title || "Home")}"
                    >

                </div>

                <div class="listing-content">

                    <h2>
                        ${escapeHtml(room.title)}
                    </h2>

                    <p class="meta">
                        ⌖ ${escapeHtml(room.location)}
                    </p>

                    <p class="meta">
                        ⌂ ${escapeHtml(room.type)}
                    </p>

                    <p class="meta">
                        ${escapeHtml(room.price)}
                    </p>

                    <p class="description">
                        ${escapeHtml(room.description)}
                    </p>

                </div>

            </div>
        `;

    } catch (error) {

        console.error(
            "Room loading error:",
            error
        );

        selectedRoom.innerHTML = `
            <p class="form-status error">
                This home is no longer available.
            </p>
        `;

        requestForm.style.display = "none";
    }
}


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


function showStatus(message, type) {

    if (!requestStatus) {
        return;
    }

    requestStatus.textContent = message;

    requestStatus.className =
        `form-status ${type}`;
}


async function submitHomeRequest(event) {

    event.preventDefault();


    if (!roomId) {

        showStatus(
            "No home was selected.",
            "error"
        );

        return;
    }


    const name =
        document.getElementById("name")
            .value
            .trim();

    const phone =
        document.getElementById("phone")
            .value
            .trim();

    const age =
        document.getElementById("age")
            .value;

    const occupation =
        document.getElementById("occupation")
            .value
            .trim();

    const qualification =
        document.getElementById("qualification")
            .value
            .trim();

    const puneDuration =
        document.getElementById("puneDuration")
            .value;

    const message =
        document.getElementById("message")
            .value
            .trim();


    if (
        !name ||
        !phone ||
        !age ||
        !occupation ||
        !qualification ||
        !puneDuration
    ) {

        showStatus(
            "Please fill in all required fields.",
            "error"
        );

        return;
    }


    submitRequestBtn.disabled = true;
    submitRequestBtn.textContent = "Sending...";

    showStatus(
        "Submitting your request...",
        ""
    );


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/user/home-requests`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                credentials: "include",

                body: JSON.stringify({

                    roomId: Number(roomId),

                    name: name,

                    phone: phone,

                    age: Number(age),

                    occupation: occupation,

                    qualification: qualification,

                    puneDuration: puneDuration,

                    message: message
                })
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to submit your request."
            );
        }


        showStatus(
            "Home request submitted successfully. The SetHome team will review it.",
            "success"
        );


        requestForm.reset();


    } catch (error) {

        console.error(
            "Home request submission error:",
            error
        );

        showStatus(
            error.message ||
            "Unable to submit your request. Please try again.",
            "error"
        );

    } finally {

        submitRequestBtn.disabled = false;

        submitRequestBtn.textContent =
            "Send Home Request";
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


        await loadRoom();


        if (!requestForm) {
            return;
        }


        requestForm.addEventListener(
            "submit",
            submitHomeRequest
        );
    }
);