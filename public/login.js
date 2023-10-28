const logBtn = document.getElementById("logBtn");
const login = document.getElementById("login");
const password = document.getElementById("password");
const MAPIURL = "https://fmapi.ceyraud.com";
const errorDiv = document.getElementById("errordiv"); // Get the error div element

logBtn.addEventListener("click", () => {
  if (login.value.trim() === "" || password.value.trim() === "") {
    // Display an error message or perform other actions if the fields are empty
    errorDiv.textContent = "Please fill in both login and password fields.";
    return; // Prevent form submission if fields are empty
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
    credentials: "include", // Include credentials (cookies) in the request
  })
    .then((response) => response.json())
    .then((data) => {
      if (!(data.Response === "Ok")) {
        console.log("error");
        console.log(data);
        errorDiv.textContent = "Error :" + data.data.message;
      } else {
        errorDiv.textContent = data.data.message;
        window.location.assign("/");
      }
    })
    .catch((error) => {
      console.log(error);
      errorDiv.textContent = "Error : " + error;
    });
});
