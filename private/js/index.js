(function ($) {
  "use strict";

  var fullHeight = function () {
    $(".js-fullheight").css("height", $(window).height());
    $(window).resize(function () {
      $(".js-fullheight").css("height", $(window).height());
    });
  };
  fullHeight();

  $("#sidebarCollapse").on("click", function () {
    $("#sidebar").toggleClass("active");
  });
})(jQuery);

const logoutButton = document.getElementById("logoutButton");
const myInfo = document.getElementById("username");

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
const profileName = document.getElementById("profileName");
const profileName2 = document.getElementById("profileName2");
const profileUsername = document.getElementById("profileUsername");

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
      myInfo.textContent = data.data.uInfo.username;
      profileName.textContent = data.data.uInfo.name;
      profileUsername.textContent = data.data.uInfo.username;
      profileName2.textContent = data.data.uInfo.name;
    })
    .catch((error) => {
      console.log(error);
      myInfo.textContent = "Error : " + error;
    });
}

updateInfo();

const profileLink = document.getElementById("profileLink"); // Assuming you have an element with id "profileLink"
const profileSection = document.getElementById("profilecontent"); // Assuming you have an element with id "profile"
const mainSection = document.getElementById("maincontent");
const navButtonsContainer = document.getElementById("pills-tab");

profileLink.addEventListener("click", function (event) {
  event.preventDefault(); // Prevent the link from navigating
  profileSection.style.display = "block";
  mainSection.style.display = "none";
  const pillElements = navButtonsContainer.getElementsByClassName("nav-link");
  for (const pill of pillElements) {
    pill.classList.remove("active");
  }
});

navButtonsContainer.addEventListener("click", function (event) {
  event.preventDefault(); // Prevent the link from navigating
  if (event.target.classList.contains("nav-link")) {
    console.log("here");
    profileSection.style.display = "none";
    mainSection.style.display = "block";
  }
});
