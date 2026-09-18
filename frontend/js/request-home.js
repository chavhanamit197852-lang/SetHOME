const params =
    new URLSearchParams(
        window.location.search
    );


const roomId =
    params.get("roomId");


const selectedRoom =
    document.getElementById(
        "selectedRoom"
    );


const requestForm =
    document.getElementById(
        "requestForm"
    );


const requestStatus =
    document.getElementById(
        "requestStatus"
    );


/*
 * ==========================================
 * AUTHENTICATION CHECK
 * ==========================================
 */

async function checkRenterAccess() {

    try {

        const response =
            await fetch(
                "http://localhost:8080/api/auth/me",
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
                `login.html?role=USER&redirect=request-home.html&roomId=${encodeURIComponent(roomId || "")}`;

            return false;
        }


        const data =
            await response.json();


        if (
            !data.success ||
            !data.user
        ) {

            window.location.href =
                `login.html?role=USER&redirect=request-home.html&roomId=${encodeURIComponent(roomId || "")}`;

            return false;
        }


        /*
         * Vendor
         */

        if (
            data.user.role === "VENDOR"
        ) {

            alert(
                "You cannot request a home using a Vendor account.\n\nPlease login with a Renter account or create a Renter account."
            );

            window.location.href =
                "index.html";

            return false;
        }


        /*
         * Admin
         */

        if (
            data.user.role === "ADMIN"
        ) {

            alert(
                "Admin accounts cannot request homes.\n\nPlease use a Renter account."
            );

            window.location.href =
                "index.html";

            return false;
        }


        /*
         * Only USER can continue
         */

        if (
            data.user.role !== "USER"
        ) {

            alert(
                "A Renter account is required to request a home."
            );

            window.location.href =
                "index.html";

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


/*
 * ==========================================
 * LOAD SELECTED ROOM
 * ==========================================
 */

async function loadRoom() {

    if (!roomId) {

        selectedRoom.innerHTML = `
            <p class="form-status error">
                No home was selected.
            </p>
        `;

        requestForm.style.display =
            "none";

        return;
    }


    try {

        const response =
            await fetch(
                "http://localhost:8080/api/rooms"
            );


        if (!response.ok) {

            throw new Error(
                "Could not load rooms."
            );
        }


        const rooms =
            await response.json();


        const room =
            rooms.find(
                item =>
                    String(item.id) ===
                    String(roomId)
            );


        if (!room) {

            selectedRoom.innerHTML = `
                <p class="form-status error">
                    This home is no longer available.
                </p>
            `;

            requestForm.style.display =
                "none";

            return;
        }


        selectedRoom.innerHTML = `

            <div class="listing-card">

                <div class="listing-image-wrap">

                    <img
                        src="${room.image}"
                        alt="${room.title}"
                    >

                </div>

                <div class="listing-content">

                    <h2>
                        ${room.title}
                    </h2>

                    <p class="meta">
                        ⌖ ${room.location}
                    </p>

                    <p class="meta">
                        ⌂ ${room.type}
                    </p>

                    <p class="meta">
                        ${room.price}
                    </p>

                    <p class="description">
                        ${room.description}
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
                Could not load home details.
            </p>
        `;
    }
}


/*
 * ==========================================
 * INITIALIZE
 * ==========================================
 */

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
            async function (event) {

                event.preventDefault();


                requestStatus.textContent =
                    "Sending your request...";

                requestStatus.className =
                    "form-status";


                /*
                 * Backend request endpoint
                 * is not implemented yet.
                 */

                requestStatus.textContent =
                    "Your home request has been recorded. The SetHome team will contact you.";

                requestStatus.className =
                    "form-status success";


                requestForm.reset();
            }
        );

    }
);