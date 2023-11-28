<nav id="sidebar">
    <div class="custom-menu">
        <button type="button" id="sidebarCollapse" class="btn btn-primary">
            <i class="fa fa-bars"></i>
            <span class="sr-only">Toggle Menu</span>
        </button>
    </div>
    <div class="p-4 pt-5">
        <h1><a href="index.html" class="logo">MitiPortal</a></h1>
        <ul class="nav nav-pills flex-column flex-grow-1 mb-auto" id="pills-tab" role="tablist">
            <li class="nav-item" role="presentation">
                <a href="#" class="nav-link active customnav text-center" id="pills-home-tab" data-bs-toggle="pill" data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-maker" aria-selected="true">
                    Home
                </a>
            </li>
            <li class="nav-item" role="presentation">
                <a href="#" class="nav-link customnav text-center" id="pills-dashboard-tab" data-bs-toggle="pill" data-bs-target="#pills-dashboard" type="button" role="tab" aria-controls="pills-dashboard" aria-selected="true">
                    Dashboard
                </a>
            </li>
        </ul>
        <hr>

        <div class="dropdown">
            <a href="#" class="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                <strong id="username"></strong>
            </a>
            <ul class="dropdown-menu custom-dropdown text-small shadow" aria-labelledby="dropdownUser1">
                <li><a class="dropdown-item" href="#" id="profileLink">Profile</a></li>
                <li>
                    <hr class="dropdown-divider">
                </li>
                <li><a class="dropdown-item" id="logoutButton" href="">Log out</a></li>
            </ul>
        </div>
    </div>
</nav>