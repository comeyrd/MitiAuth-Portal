function createProfileRow(labelText, valueText) {
  const row = document.createElement("div");
  row.classList.add("row");

  const createColumn = (classList, text) => {
    const column = document.createElement("div");
    column.classList.add(...classList);
    const element = document.createElement("p");
    element.classList.add("mb-0", ...(text ? ["text-muted"] : []));
    element.textContent = text;
    column.appendChild(element);
    return column;
  };

  row.appendChild(createColumn(["col-sm-3"], labelText));
  row.appendChild(createColumn(["col-sm-9"], valueText));

  return row;
}

function updateProfile(uInfo) {
  const profileName = document.getElementById("profileName");
  profileName.textContent = uInfo.name.data;
  const profileContainer = document.getElementById("user-info-div");
  profileContainer.innerHTML = "";
  for (const key in uInfo) {
    if (uInfo.hasOwnProperty(key)) {
      const value = uInfo[key];
      const row = createProfileRow(value.pretty, value.data);
      profileContainer.appendChild(row);
      if (key !== Object.keys(uInfo)[Object.keys(uInfo).length - 1]) {
        const separator = document.createElement("hr");
        profileContainer.appendChild(separator);
      }
    }
  }
}

function loadProfile() {
  fetch("/account/getMyInfo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })
    .then((http) => http.json())
    .then((response) => {
      const myInfo = document.getElementById("username");
      myInfo.textContent = response.data.username.data;
      updateProfile(response.data);
    })
    .catch((error) => {
      console.log(error);
      myInfo.textContent = "Error : " + error;
    });
}

loadProfile();
