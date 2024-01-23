// Logout Functionality
const logoutButton = document.getElementById("logoutButton");

logoutButton.addEventListener("click", function (event) {
  const myInfo = document.getElementById("username");
  event.preventDefault();
  fetch("/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.Response !== "Ok") {
        console.log("error");
        console.log(data);
        myInfo.textContent = "Error :" + data.data.message;
      } else {
        window.location.reload();
      }
    })
    .catch((error) => {
      console.log(error);
      myInfo.textContent = "Error : " + error;
    });
});
