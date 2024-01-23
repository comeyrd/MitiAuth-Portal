function getCookie(cookieName) {
    const name = cookieName + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    for(const element of cookieArray) {
        let cookie = element.trim();
        if (cookie.startsWith(name)) {
            return cookie.substring(name.length, cookie.length);
        }
    }

    return null;
}


function setupAdmin() {
    const type = getCookie("mapiType");
    const conditionMet = (type == "admin"); // Your condition to determine whether to add the new pill
  if (conditionMet) {
    addTab("Admin", "admin", '<h2 class="mb-4">Admin page</h2><br><p>Admin page<p>');
  }
}

setupAdmin();