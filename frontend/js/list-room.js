const roomForm = document.getElementById("roomForm");

const roomFormStatus =
    document.getElementById("roomFormStatus");


roomForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    // Get form values

    const title =
        roomForm.querySelector('[name="title"]').value.trim();

    const price =
        roomForm.querySelector('[name="price"]').value.trim();

    const location =
        roomForm.querySelector('[name="location"]').value.trim();

    const type =
        roomForm.querySelector('[name="type"]').value;

    const description =
        roomForm.querySelector('[name="description"]').value.trim();

    const image =
        roomForm.querySelector('[name="image"]').value.trim();


    // Basic validation

    if (
        !title ||
        !price ||
        !location ||
        !type ||
        !description
    ) {

        roomFormStatus.textContent =
            "Please fill in all required fields.";

        return;
    }


    // Show loading message

    roomFormStatus.textContent =
        "Submitting your listing...";


    try {

        const response = await fetch(
            "http://localhost:8080/api/rooms",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

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


        const data = await response.json();


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

      alert(
      "Room submitted successfully!\n\nYour listing is now waiting for admin approval."
      );


    } catch (error) {

        console.error(
            "Room submission error:",
            error
        );


        roomFormStatus.textContent =
            "Unable to submit your listing. Please try again.";

    }

});