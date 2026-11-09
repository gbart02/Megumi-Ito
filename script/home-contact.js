// Home page contact.
// Click "Contact": the menu fades out, "Contact" moves up (underlined) and
// Instagram / E-mail / Phone number fade in below it.
// Click anywhere else on the page: it all fades back.

(function () {
    const body = document.body;
    const contact = document.querySelector("body > .site-contact");
    const details = document.querySelector(".home-contact");
    if (!contact || !details) return;

    const introNav = document.querySelector(".intro-nav");
    let introNavWasInert = false;

    function open() {
        body.classList.add("contact-open");
        contact.setAttribute("aria-expanded", "true");
        details.inert = false;
        // The big intro words can't be clicked while they're faded out.
        if (introNav) {
            introNavWasInert = introNav.inert;
            introNav.inert = true;
        }
    }

    function close() {
        body.classList.remove("contact-open");
        contact.setAttribute("aria-expanded", "false");
        details.inert = true;
        if (introNav) introNav.inert = introNavWasInert;
    }

    contact.addEventListener("click", (event) => {
        event.preventDefault();
        if (!body.classList.contains("contact-open")) {
            event.stopPropagation(); // Don't let the "click anywhere" handler close it straight away.
            open();
        }
        // When already open, the click falls through to the handler below and closes it.
    });

    document.addEventListener("click", (event) => {
        if (!body.classList.contains("contact-open")) return;
        if (details.contains(event.target)) {
            // Placeholder links (href="#") do nothing yet.
            const link = event.target.closest("a");
            if (link && link.getAttribute("href") === "#") event.preventDefault();
            return;
        }
        close();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && body.classList.contains("contact-open")) close();
    });
})();
