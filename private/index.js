const logoutButton = document.getElementById("logoutButton");
const myInfo = document.getElementById("myInfo");

logoutButton.addEventListener("click", () => {
  fetch("/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Include credentials (cookies) in the request
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
      errorDiv.textContent = "Error : " + error;
    });
});

function updateInfo() {
  fetch("/account/getMyInfo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Include credentials (cookies) in the request
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data.data.userInfo);
      myInfo.textContent = "Your Name : " + data.data.uInfo.name;
    })
    .catch((error) => {
      console.log(error);
      myInfo.textContent = "Error : " + error;
    });
}

updateInfo();
