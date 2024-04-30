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
  if (event.target.classList.contains("nav-link")) {
    profileSection.style.display = "none";
    mainSection.style.display = "block";
  }
});


function addTab(prettyName, tabId, content) {
  // Add a new navigation pill dynamically
  const pillsTab = document.getElementById("pills-tab");
  const newPill = document.createElement("li");
  newPill.className = "nav-item";
  newPill.innerHTML = `
      <a href="#" class="nav-link customnav text-center" id="${tabId}"
          data-bs-toggle="pill" data-bs-target="#${tabId}-content" type="button" role="tab"
          aria-controls="${tabId}-content" aria-selected="true">
          ${prettyName}
      </a>
  `;
  pillsTab.appendChild(newPill);

  // Add new content associated with the new pill
  const pillsTabContent = document.getElementById("pills-tabContent");
  const newContent = document.createElement("div");
  newContent.className = "tab-pane fade";
  newContent.id = `${tabId}-content`;
  newContent.innerHTML = content;
  pillsTabContent.appendChild(newContent);
}