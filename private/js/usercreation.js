// User Profile Information

updateUserCreationFields();

// Dynamic Fields for User Creation
function addCreateInfo(key, field) {
  const dynamicFieldsContainer = document.getElementById(
    "dynamic-fields-container"
  );
  const input = document.createElement("input");
  input.type = field.type || "text";
  input.name = key;
  input.className = "form-control rounded-left";
  input.placeholder = field.pretty || key;
  input.required = true;

  const hr = document.createElement("hr");
  dynamicFieldsContainer.appendChild(hr);
  dynamicFieldsContainer.appendChild(input);
}

// Fetch User Creation Fields
function updateUserCreationFields() {
  fetch("/account/get-scheme")
    .then((response) => response.json())
    .then((data) => {
      if (data.Response === "Ok" && data.data && data.data.scheme) {
        Object.keys(data.data.scheme).forEach((key) => {
          const field = data.data.scheme[key];
          addCreateInfo(key, field);
        });
      }
      scheme = data.data;
    })
    .catch((error) => {
      console.error("Error fetching API data:", error);
    });
}

// Form Submission
const loginForm = document.querySelector(".login-form");
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const formObject = {};
  formData.forEach((value, key) => {
    formObject[key] = value;
  });

  const info = {};
  Object.keys(scheme.scheme).forEach((key) => {
    info[key] = formObject[key];
  });

  const payload = JSON.stringify({
    login: formObject.login,
    pass: formObject.password,
    info: info,
    scheme: scheme.scheme,
  });

  fetch("/account/create", {
    method: "POST",
    body: payload,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.Response !== "Ok") {
        processUserCreateError(data.data.api);
      } else {
        processUserCreateSuccess(data.data.message);
      }
    })
    .catch((error) => {
      processUserCreateError(error.message);
    });
});
const createUserMessage = document.getElementById("createUserMessage");

function processUserCreateError(message) {
  createUserMessage.classList.remove("text-success");
  createUserMessage.classList.add("text-danger");
  createUserMessage.textContent = message;
  clearFormFields();
}

function processUserCreateSuccess(message) {
  createUserMessage.classList.remove("text-danger");
  createUserMessage.classList.add("text-success");
  createUserMessage.textContent = message;
  clearFormFields();
}

function clearFormFields() {
  const createUserFields = document.getElementById("createUserFields");
  // Loop through child elements and clear text content
  for (const div of createUserFields.children) {
    for (const child of div.children) {
      child.value = "";
    }
  }
}
