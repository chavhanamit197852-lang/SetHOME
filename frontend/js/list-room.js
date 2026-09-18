document.addEventListener("DOMContentLoaded", async function () {

    /*
     * ==========================================
     * FIRST: CHECK VENDOR LOGIN
     * ==========================================
     */

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
                "login.html?role=VENDOR&redirect=list-room.html";

            return;
        }


        const data =
            await response.json();


        /*
         * Logged in but not Vendor
         */

        if (
            !data.success ||
            !data.user ||
            data.user.role !== "VENDOR"
        ) {

            alert(
                "Only Vendor accounts can list rooms."
            );

            window.location.href =
                "index.html";

            return;
        }


        /*
         * ==========================================
         * VENDOR IS ALLOWED
         * ==========================================
         */

        console.log(
            "Vendor access granted:",
            data.user
        );


        /*
         * Now setup the room form.
         */

        const roomForm =
            document.getElementById("roomForm");

        const roomFormStatus =
            document.getElementById("roomFormStatus");


        if (!roomForm) {
            return;
        }


        roomForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const title =
                    roomForm
                        .querySelector('[name="title"]')
                        .value
                        .trim();

                const price =
                    roomForm
                        .querySelector('[name="price"]')
                        .value
                        .trim();

                const location =
                    roomForm
                        .querySelector('[name="location"]')
                        .value
                        .trim();

                const type =
                    roomForm
                        .querySelector('[name="type"]')
                        .value;

                const description =
                    roomForm
                        .querySelector('[name="description"]')
                        .value
                        .trim();

                const image =
                    roomForm
                        .querySelector('[name="image"]')
                        .value
                        .trim();


                /*
                 * Validation
                 */

                if (
                    !title ||
                    !price ||
                    !location ||
                    !type ||
                    !description
                ) {

                    roomFormStatus.textContent =
                        "Please fill in all required fields.";

                    roomFormStatus.className =
                        "form-status error";

                    return;
                }


                roomFormStatus.textContent =
                    "Submitting your listing...";

                roomFormStatus.className =
                    "form-status";


                try {

                    const response =
                        await fetch(
                            "http://localhost:8080/api/vendor/rooms",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                credentials: "include",

                                body: JSON.stringify({

                                    title: title,

                                    price: price,

                                    location: location,

                                    type: type,

                                    description: description,

                                    image: image

                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Failed to submit listing."
                        );
                    }


                    console.log(
                        "Room submitted:",
                        data
                    );


                    roomForm.reset();


                    roomFormStatus.textContent =
                        "Listing submitted successfully. It is now waiting for admin approval.";

                    roomFormStatus.className =
                        "form-status success";


                } catch (error) {

                    console.error(
                        "Room submission error:",
                        error
                    );


                    roomFormStatus.textContent =
                        error.message ||
                        "Unable to submit your listing.";

                    roomFormStatus.className =
                        "form-status error";
                }

            }
        );


    } catch (error) {

        console.error(
            "Vendor authentication check failed:",
            error
        );


        window.location.href =
            "login.html?role=VENDOR&redirect=list-room.html";
    }

});