const pendingRooms =
    document.getElementById("pendingRooms");

const adminStatus =
    document.getElementById("adminStatus");


async function loadPendingRooms() {

    adminStatus.textContent =
        "Loading pending listings...";


    try {

        const response = await fetch(
            "http://localhost:8080/api/admin/rooms/pending"
        );


        if (!response.ok) {

            throw new Error(
                "Failed to load pending rooms."
            );
        }


        const rooms = await response.json();


        adminStatus.textContent =
            `${rooms.length} pending listing(s)`;


        renderPendingRooms(rooms);


    } catch (error) {

        console.error(error);

        adminStatus.textContent =
            "Unable to load pending listings.";
    }
}


function renderPendingRooms(rooms) {

    if (rooms.length === 0) {

        pendingRooms.innerHTML = `
            <div class="form-card">
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
        rooms.map(room => `

            <article class="listing-card">

                <div class="listing-image">

                    ${
                        room.image
                        ?
                        `<img
                            src="${room.image}"
                            alt="${room.title}"
                        >`
                        :
                        `<div>
                            No Image
                        </div>`
                    }

                </div>


                <div class="listing-content">

                    <span class="eyebrow">
                        ${room.type}
                    </span>

                    <h3>
                        ${room.title}
                    </h3>

                    <p>
                        ${room.location}
                    </p>

                    <strong>
                        ${room.price}
                    </strong>

                    <p>
                        ${room.description}
                    </p>


                    <div class="admin-actions">

                        <button
                            class="btn btn-primary"
                            onclick="approveRoom(${room.id})"
                        >
                            Approve
                        </button>

                        <button
                            class="btn btn-secondary"
                            onclick="rejectRoom(${room.id})"
                        >
                            Reject
                        </button>

                    </div>

                </div>

            </article>

        `).join("");
}


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
            `http://localhost:8080/api/admin/rooms/${id}/approve`,
            {
                method: "PATCH"
            }
        );


        if (!response.ok) {

            throw new Error(
                "Approval failed."
            );
        }


        alert(
            "Room approved successfully."
        );


        loadPendingRooms();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to approve the room."
        );
    }
}


async function rejectRoom(id) {

    const confirmed =
        confirm(
            "Are you sure you want to reject this listing?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `http://localhost:8080/api/admin/rooms/${id}/reject`,
            {
                method: "PATCH"
            }
        );


        if (!response.ok) {

            throw new Error(
                "Rejection failed."
            );
        }


        alert(
            "Room rejected successfully."
        );


        loadPendingRooms();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to reject the room."
        );
    }
}


// Load when page opens

loadPendingRooms();