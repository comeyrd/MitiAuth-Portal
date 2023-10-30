const login = document.getElementById("login");
const password = document.getElementById("password");
const loginForm = document.querySelector(".login-form"); // Get the form element
const errorDiv = document.getElementById("errorDiv");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent the default form submission behavior

  if (login.value.trim() === "" || password.value.trim() === "") {
    errorDiv.textContent = "Please fill in both username and password fields.";
    return;
  }

  errorDiv.textContent = "";
  const jsonData = JSON.stringify({
    login: login.value,
    password: password.value,
  });

  fetch("/login", {
    method: "POST",
    body: jsonData,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.Response !== "Ok") {
        console.log("error");
        console.log(data);
        errorDiv.classList.remove("text-success");
        errorDiv.classList.add("text-danger");
        errorDiv.textContent = data.data.message;
      } else {
        errorDiv.classList.remove("text-danger");
        errorDiv.classList.add("text-success");
        errorDiv.textContent = data.data.message;
        window.location.assign("/");
      }
    })
    .catch((error) => {
      console.log(error);
      errorDiv.classList.remove("text-success");
      errorDiv.classList.add("text-danger");
      errorDiv.textContent = "Error: " + error.message;
    });
});
