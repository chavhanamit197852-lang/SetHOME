const loginForm =
    document.getElementById("loginForm");

const loginStatus =
    document.getElementById("loginStatus");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            loginStatus.textContent =
                "Logging in...";

            loginStatus.className =
                "form-status";


            const formData =
                new FormData(loginForm);


            const email =
                (formData.get("email") || "")
                    .trim();

            const password =
                formData.get("password") || "";


            const params =
                new URLSearchParams(
                    window.location.search
                );


            const requestedRole =
                (params.get("role") || "")
                    .toUpperCase();


            const redirectPage =
                params.get("redirect") ||
                "index.html";


            const roomId =
                params.get("roomId");


            try {

                const response =
                    await fetch(
                        "http://localhost:8080/api/auth/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            credentials: "include",

                            body: JSON.stringify({
                                email: email,
                                password: password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    loginStatus.textContent =
                        data.message ||
                        "Invalid email or password.";

                    loginStatus.className =
                        "form-status error";

                    return;
                }


                const user =
                    data.user;


                console.log(
                    "Login successful:",
                    user
                );
                const sessionCheck = await fetch(
    "http://localhost:8080/api/auth/me",
    {
        method: "GET",
        credentials: "include"
    }
);

console.log(
    "SESSION AFTER LOGIN:",
    sessionCheck.status,
    await sessionCheck.text()
);


                /*
                 * ======================================
                 * VENDOR REQUIRED
                 * ======================================
                 */

                if (
                    requestedRole === "VENDOR"
                ) {

                    if (
                        user.role !== "VENDOR"
                    ) {

                        const message =
                            "You cannot list a room using a Renter account.\n\nPlease login with a Vendor account or create a Vendor account.";

                        alert(message);

                        loginStatus.textContent =
                            "Vendor account required to list a room.";

                        loginStatus.className =
                            "form-status error";

                        return;
                    }


                    loginStatus.textContent =
                        `Welcome ${user.name}! Redirecting to List Your Room...`;

                    loginStatus.className =
                        "form-status success";


                    setTimeout(() => {

                        window.location.href =
                            "list-room.html";

                    }, 700);

                    return;
                }


                /*
                 * ======================================
                 * RENTER / USER REQUIRED
                 * ======================================
                 */

                if (
                    requestedRole === "USER"
                ) {

                    if (
                        user.role !== "USER"
                    ) {

                        const message =
                            "You cannot request a home using a Vendor account.\n\nPlease login with a Renter account or create a Renter account.";

                        alert(message);

                        loginStatus.textContent =
                            "Renter account required to request a home.";

                        loginStatus.className =
                            "form-status error";

                        return;
                    }


                    loginStatus.textContent =
                        `Welcome ${user.name}! Redirecting...`;

                    loginStatus.className =
                        "form-status success";


                    setTimeout(() => {

                        if (
                            redirectPage ===
                                "request-home.html" &&
                            roomId
                        ) {

                            window.location.href =
                                `request-home.html?roomId=${encodeURIComponent(roomId)}`;

                            return;
                        }


                        window.location.href =
                            redirectPage;

                    }, 700);

                    return;
                }


                /*
                 * ======================================
                 * NORMAL LOGIN
                 * ======================================
                 */

                loginStatus.textContent =
                    `Welcome ${user.name}!`;

                loginStatus.className =
                    "form-status success";


                setTimeout(() => {

                    window.location.href =
                        redirectPage;

                }, 700);

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );

                loginStatus.textContent =
                    "Could not connect to the server.";

                loginStatus.className =
                    "form-status error";
            }

        }
    );
}


/*
 * =========================================
 * REGISTER LINK
 * =========================================
 */

const registerLink =
    document.getElementById("registerLink");


if (registerLink) {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const requestedRole =
        (params.get("role") || "")
            .toUpperCase();


    const redirectPage =
        params.get("redirect");


    const roomId =
        params.get("roomId");


    let registerUrl =
        "register.html";


    if (
        requestedRole === "VENDOR" ||
        requestedRole === "USER"
    ) {

        registerUrl +=
            `?role=${encodeURIComponent(requestedRole)}`;


        if (redirectPage) {

            registerUrl +=
                `&redirect=${encodeURIComponent(redirectPage)}`;

        }


        if (
            requestedRole === "USER" &&
            roomId
        ) {

            registerUrl +=
                `&roomId=${encodeURIComponent(roomId)}`;

        }

    }


    registerLink.href =
        registerUrl;
}