// Profile Section Navigation
const profileLink = document.getElementById("profileLink");
const profileSection = document.getElementById("profilecontent");
const mainSection = document.getElementById("maincontent");
const navButtonsContainer = document.getElementById("pills-tab");

profileLink.addEventListener("click", function (event) {
  event.preventDefault();
  profileSection.style.display = "block";
  mainSection.style.display = "none";
  const pillElements = navButtonsContainer.getElementsByClassName("nav-link");
  for (const pill of pillElements) {
    pill.classList.remove("active");
  }
});

navButtonsContainer.addEventListener("click", function (event) {
  event.preventDefault();
  if (event.target.classList.contains("nav-link")) {
    profileSection.style.display = "none";
    mainSection.style.display = "block";
  }
});
