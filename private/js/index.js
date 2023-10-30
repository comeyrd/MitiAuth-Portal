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

logoutButton.addEventListener("click", function (event) {
  event.preventDefault(); // Prevent the link from navigating
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
      loadProfile(data.data.uInfo);
    })
    .catch((error) => {
      console.log(error);
      myInfo.textContent = "Error : " + error;
    });
}

updateInfo();

function loadProfile(uInfo) {
  const profileName = document.getElementById("profileName");
  profileName.textContent = uInfo.name;
  const profileContainer = document.getElementById("user-info-div");
  // Clear the existing content in the profile container
  profileContainer.innerHTML = "";

  for (const key in uInfo) {
    if (uInfo.hasOwnProperty(key)) {
      const value = uInfo[key];

      // Create a new row element
      const row = document.createElement("div");
      row.classList.add("row");

      // Create a column for the label (col-sm-3)
      const labelColumn = document.createElement("div");
      labelColumn.classList.add("col-sm-3");

      // Create a <p> element for the label text
      const label = document.createElement("p");
      label.classList.add("mb-0");
      label.textContent = key;

      labelColumn.appendChild(label);

      // Create a column for the value (col-sm-9)
      const valueColumn = document.createElement("div");
      valueColumn.classList.add("col-sm-9");

      // Create a <p> element for the value text
      const valueElement = document.createElement("p");
      valueElement.classList.add("text-muted", "mb-0");
      valueElement.textContent = value;

      valueColumn.appendChild(valueElement);

      // Add the columns to the row
      row.appendChild(labelColumn);
      row.appendChild(valueColumn);

      // Append the row to the profile container
      profileContainer.appendChild(row);

      // Add a horizontal line (hr) after each entry
      if (key !== Object.keys(uInfo)[Object.keys(uInfo).length - 1]) {
        const separator = document.createElement("hr");
        profileContainer.appendChild(separator);
      }
    }
  }
}

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
