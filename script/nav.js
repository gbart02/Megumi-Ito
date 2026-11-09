// Site menu (all pages, including home).
//
// Each item shows only its first letter (H, P, G, A). Hovering an item types the word out
// letter by letter while its box grows; leaving deletes it back to the first letter.
// The home intro (script/intro.js) uses window.siteNav to land on spelled-out words and
// then delete them back to letters.
// Clicking another page: the grey box slides to the clicked item, then that page opens.
// Phones (no hover): one tap types the word out, slides the grey box, then opens the page.

(function () {
    const TYPE = 55; // Time per letter (ms).
    const SLIDE = 450; // Length of the grey box slide (ms).
    const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
    const SPACE_AFTER = 0.7; // Space after the text inside a box, in em.

    const nav = document.querySelector(".middle-bar .site-nav");
    if (!nav) return;

    const links = [...nav.querySelectorAll("a")];
    const current = links.find((a) => a.classList.contains("active") || a.getAttribute("aria-current") === "page");

    // Replace each link's text with a label we can type into; screen readers still get the full word.
    const items = links.map((link) => {
        const word = link.textContent.trim();
        link.setAttribute("aria-label", word);
        link.textContent = "";
        const label = document.createElement("span");
        label.className = "nav-label";
        label.setAttribute("aria-hidden", "true");
        link.append(label);
        return { link, word, label, shown: 0, timer: null };
    });

    // Box sizes: every collapsed box fits the widest first letter, every open box the widest word.
    function textWidth(item, text) {
        item.label.textContent = text;
        return item.label.getBoundingClientRect().width;
    }

    const first = items[0].link;
    const padLeft = parseFloat(getComputedStyle(first).paddingLeft);
    const space = SPACE_AFTER * parseFloat(getComputedStyle(first).fontSize);
    const collapsedWidth = padLeft + Math.max(...items.map((i) => textWidth(i, i.word[0]))) + space;
    const fullWidth = padLeft + Math.max(...items.map((i) => textWidth(i, i.word))) + space;

    function render(item) {
        item.label.textContent = item.word.slice(0, item.shown);
        const progress = item.word.length > 1 ? (item.shown - 1) / (item.word.length - 1) : 1;
        item.link.style.width = `${collapsedWidth + (fullWidth - collapsedWidth) * progress}px`;
    }

    // Types (or deletes) one letter at a time until `target` letters show, then calls `done`.
    function typeTo(item, target, done) {
        clearInterval(item.timer);
        if (item.shown === target) {
            if (done) done();
            return;
        }
        item.timer = setInterval(() => {
            item.shown += item.shown < target ? 1 : -1;
            render(item);
            if (item.shown === target) {
                clearInterval(item.timer);
                if (done) done();
            }
        }, TYPE);
    }

    // Sets every item to its full word or its letter at once (no width transition).
    function showAll(state) {
        links.forEach((link) => (link.style.transition = "none"));
        items.forEach((item) => {
            clearInterval(item.timer);
            item.shown = state === "full" ? item.word.length : 1;
            render(item);
        });
        nav.getBoundingClientRect();
        links.forEach((link) => (link.style.transition = ""));
    }

    // Arriving from a menu click: the clicked word was already spelled out on the previous page,
    // so show it spelled out straight away instead of typing it again.
    const noHover = window.matchMedia("(hover: none)").matches;
    let arrived = null;
    try {
        const word = sessionStorage.getItem("navArrived");
        sessionStorage.removeItem("navArrived");
        if (word) arrived = items.find((i) => i.word === word) || null;
    } catch (error) {}

    // First layout without the width transition, so the boxes don't visibly shrink on page load.
    showAll("letters");
    if (arrived) {
        links.forEach((link) => (link.style.transition = "none"));
        arrived.shown = arrived.word.length;
        render(arrived);
        nav.getBoundingClientRect();
        links.forEach((link) => (link.style.transition = ""));
    }

    // Phones: the tapped word arrives spelled out, then deletes itself back to its letter here.
    if (arrived && noHover) {
        setTimeout(() => typeTo(arrived, 1), 350);
    }

    // With a mouse: if it turns out not to be over that word any more, delete it back to its letter.
    if (arrived && !noHover) {
        const checkPointer = (event) => {
            document.removeEventListener("mousemove", checkPointer);
            if (!arrived.link.contains(event.target)) typeTo(arrived, 1);
        };
        document.addEventListener("mousemove", checkPointer);
    }

    // Hover / keyboard focus: type the word out, and delete it again when leaving.
    items.forEach((item) => {
        const open = () => typeTo(item, item.word.length);
        const close = () => {
            if (!highlight) typeTo(item, 1); // Keep the clicked word while the page changes.
        };
        item.link.addEventListener("mouseenter", open);
        item.link.addEventListener("focus", open);
        item.link.addEventListener("mouseleave", close);
        item.link.addEventListener("blur", close);
    });

    // Clicking another page: grey box slides from the current item to the clicked one.
    let highlight = null;

    function slideTo(link) {
        // Use the widths the boxes are heading to (style.width), not mid-transition measurements.
        const fromWidth = current.style.width || `${current.offsetWidth}px`;
        const toWidth = link.style.width || `${link.offsetWidth}px`;

        highlight = document.createElement("span");
        highlight.className = "nav-highlight";
        highlight.setAttribute("aria-hidden", "true");
        Object.assign(highlight.style, {
            top: `${current.offsetTop}px`,
            left: `${current.offsetLeft}px`,
            width: fromWidth,
            height: `${current.offsetHeight}px`,
        });
        nav.prepend(highlight); // First child, so the words paint on top of it.
        nav.classList.add("nav-sliding");

        // Two steps: first straight up/down to the clicked item, then sideways to its width.
        const moveY = `translateY(${link.offsetTop - current.offsetTop}px)`;
        return highlight.animate(
            [
                { offset: 0, transform: "translateY(0)", width: fromWidth, easing: EASE },
                { offset: 0.6, transform: moveY, width: fromWidth, easing: EASE },
                { offset: 1, transform: moveY, width: toWidth },
            ],
            { duration: SLIDE + 250, fill: "forwards" }
        ).finished;
    }

    items.forEach((item) => {
        item.link.addEventListener("click", (event) => {
            // Let new-tab / new-window clicks behave normally.
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            if (!current) return;

            event.preventDefault();
            if (item.link === current || highlight) return; // Already here, or already on the way.

            // On phones this types the word out first; with a mouse it is usually typed already.
            typeTo(item, item.word.length, () => {
                slideTo(item.link).then(() => {
                    try {
                        sessionStorage.setItem("navArrived", item.word);
                    } catch (error) {}
                    window.location.href = item.link.href;
                });
            });
        });
    });

    // Coming back with the browser's Back button: reset the menu.
    window.addEventListener("pageshow", (event) => {
        if (!event.persisted) return;
        if (highlight) highlight.remove();
        highlight = null;
        nav.classList.remove("nav-sliding");
        showAll("letters");
    });

    // For the home intro: spell every word out at once, or delete them all back to letters.
    window.siteNav = {
        spellAll: () => showAll("full"),
        unspellAll: () => items.forEach((item) => typeTo(item, 1)),
    };
})();
