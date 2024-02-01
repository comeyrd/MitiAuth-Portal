function getCurrClass(){
    const test =  'aria-current="page"';
    const clss = "block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500";
    return clss;
};

function getClass(){
    const clss = "block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent  dark:border-gray-700";
    return clss;
};

const navbarmenu = document.getElementById("navbar-menu");
const navbarItems = document.querySelectorAll("#navbar-menu a");

function clearAll() {
  // Extract and log the IDs of all elements
  const ids = Array.from(navbarItems).map((item) => item.id);
  ids.forEach(id => {
    const element = document.getElementById(id);
    element.removeAttribute("aria-current");

    element.className = getClass();
});

}


navbarmenu.addEventListener("click", function (event) {
    if (event.target.id) {
        const selectedId = event.target.id;
        console.log("Selected id:", selectedId);
        clearAll();
        // Get the element by ID
        const element = document.getElementById(selectedId);
        element.className = getCurrClass();
        element.setAttribute("aria-current", "page");
    }
});

//    <script src="/testing/js/nav.js"></script>
