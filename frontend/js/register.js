const registerForm =
    document.getElementById("registerForm");

const registerStatus =
    document.getElementById("registerStatus");


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


/*
 * ==========================================
 * PRESELECT ROLE
 * ==========================================
 */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (
            requestedRole === "VENDOR"
        ) {

            const vendorOption =
                document.getElementById(
                    "vendorOption"
                );

            if (vendorOption) {
                vendorOption.checked = true;
            }
        }

        if (
            requestedRole === "USER"
        ) {

            const userOption =
                document.querySelector(
                    'input[name="role"][value="USER"]'
                );

            if (userOption) {
                userOption.checked = true;
            }
        }

    }
);


/*
 * ==========================================
 * REGISTER
 * ==========================================
 */

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            registerStatus.textContent =
                "Creating account...";

            registerStatus.className =
                "form-status";


            const formData =
                new FormData(registerForm);


            const name =
                (formData.get("name") || "")
                    .trim();


            const email =
                (formData.get("email") || "")
                    .trim();


            const phone =
                (formData.get("phone") || "")
                    .trim();


            const password =
                formData.get("password") || "";


            const role =
                formData.get("role");


            try {

                const response =
                    await fetch(
                        "http://localhost:8080/api/auth/register",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                name,
                                email,
                                phone,
                                password,
                                role
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    registerStatus.textContent =
                        data.message ||
                        "Registration failed.";

                    registerStatus.className =
                        "form-status error";

                    return;
                }


                registerStatus.textContent =
                    "Account created successfully! Redirecting to login...";

                registerStatus.className =
                    "form-status success";


                registerForm.reset();


                setTimeout(() => {

                    let loginUrl =
                        `login.html?role=${encodeURIComponent(role)}`;


                    if (redirectPage) {

                        loginUrl +=
                            `&redirect=${encodeURIComponent(redirectPage)}`;

                    }


                    if (
                        role === "USER" &&
                        roomId
                    ) {

                        loginUrl +=
                            `&roomId=${encodeURIComponent(roomId)}`;

                    }


                    window.location.href =
                        loginUrl;

                }, 1200);


            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                registerStatus.textContent =
                    "Could not connect to the server.";

                registerStatus.className =
                    "form-status error";
            }

        }
    );
}