function initNavbar() {
    const navbar = document.createElement('div');
    navbar.className = 'navbar';

    const title = document.createElement('div');
    title.className = 'title';
    title.innerHTML = 'New Jersey Flood Network by <span>I-SMART Lab</span>';

    const navbarRight = document.createElement('div');
    navbarRight.className = 'navbar-right';

    navbar.appendChild(title);
    navbar.appendChild(navbarRight);

    document.body.insertBefore(navbar, document.body.firstChild);
}
