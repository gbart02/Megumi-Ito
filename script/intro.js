// Home page intro (plays once per visit).
// Phase 1: "Megumi Ito" fills from grey to black, left to right, like a loading bar.
// Phase 2: when full, the title slides up into the small title, "Contact" rises into place,
//          and the big navigation slides up into the centre. It waits for a click.
// Phase 3: clicking a word slides the big navigation into the small menu.
//          Home stays on this page; Projects, Gallery and About then open that page.

(function () {
    const LOADING = 3000; // How long the title takes to fill (ms).
    const SLIDE = 1200; // Length of each sliding transition (ms).
    const STAGGER = 90; // Delay between each navigation word (ms).
    const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
    const BACKGROUND = "../images/main%20page/firstpage.png";

    const html = document.documentElement;
    const body = document.body;
    const intro = document.querySelector(".intro");
    if (!intro) return;

    const bigTitle = intro.querySelector(".intro-title");
    const titleFill = intro.querySelector(".intro-title-fill");
    const bigNavBox = intro.querySelector(".intro-nav");
    const bigNav = [...bigNavBox.querySelectorAll(".intro-word")];

    const realTitle = document.querySelector(".middle-bar .site-title");
    const realContact = document.querySelector("body > .site-contact");
    const realNav = [...document.querySelectorAll(".middle-bar .site-nav a")];

    // Box around the text itself (ignores padding and backgrounds).
    function textRect(el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        return range.getBoundingClientRect();
    }

    // Transform that moves and scales `from` so its text lands exactly on `to`'s text.
    function flipTo(from, to) {
        const box = from.getBoundingClientRect();
        const a = textRect(from);
        const b = textRect(to);
        from.style.transformOrigin = `${a.left - box.left}px ${a.top - box.top}px`;
        return `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(${b.height / a.height})`;
    }

    function animate(el, keyframes, options) {
        return el.animate(keyframes, { duration: SLIDE, easing: EASE, fill: "forwards", ...options }).finished;
    }

    function wait(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function backgroundLoaded() {
        const img = new Image();
        img.src = BACKGROUND;
        return img.decode().catch(() => {});
    }

    // Removes the intro and leaves the normal home page (phase 3).
    function finish() {
        [realTitle, realContact, ...realNav].forEach((el) => (el.style.visibility = "visible"));
        intro.remove();
        body.classList.remove("intro-running");
    }

    // Phase 1: fill the title like a loading bar (and make sure the background is ready).
    async function loading() {
        await Promise.all([
            titleFill.animate(
                // Negative insets reach past the line box so the "g" descender fills too.
                [{ clipPath: "inset(-30% 100% -30% -10%)" }, { clipPath: "inset(-30% -10% -30% -10%)" }],
                { duration: LOADING, easing: "ease-in-out", fill: "forwards" }
            ).finished,
            backgroundLoaded(),
        ]);
    }

    // Phase 1 -> 2
    async function toPhaseTwo() {
        // `translate` is used for Contact because beauty.css locks its `transform` with !important.
        realContact.style.visibility = "visible";
        const contactRise = realContact.animate(
            [{ translate: "0 3rem", opacity: 0 }, { translate: "0 0", opacity: 1 }],
            { duration: SLIDE, easing: EASE, fill: "backwards" }
        ).finished;

        await Promise.all([
            animate(bigTitle, [{ transform: "none" }, { transform: flipTo(bigTitle, realTitle) }]),
            contactRise,
            ...bigNav.map((word, i) =>
                animate(
                    word,
                    [
                        { transform: "translateY(60vh)", opacity: 0 },
                        { transform: "translateY(0)", opacity: 1 },
                    ],
                    { delay: i * STAGGER }
                )
            ),
        ]);

        realTitle.style.visibility = "visible";
        bigTitle.style.visibility = "hidden";
        bigNavBox.inert = false; // The big words are now clickable.
    }

    // Phase 2 -> 3: slide the big words into the small menu.
    async function toPhaseThree() {
        bigNavBox.inert = true; // No double clicks while sliding.

        // The small menu normally shows letters; spell it out so the big words have full words to land on.
        if (window.siteNav) window.siteNav.spellAll();

        await Promise.all(
            bigNav.map((word, i) =>
                animate(
                    word,
                    [
                        { transform: "none", opacity: 1 },
                        { transform: flipTo(word, realNav[i]), opacity: 1 },
                    ],
                    { delay: i * STAGGER }
                )
            )
        );
    }

    async function onWordClick(event) {
        event.preventDefault();
        const link = event.currentTarget;
        const isHome = link === bigNav[0];

        await toPhaseThree();

        if (isHome) {
            // Fade the real links (with their background boxes) in over the landed words.
            realNav.forEach((el) => {
                el.style.visibility = "visible";
                el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, easing: "ease" });
            });
            await wait(400);
            finish();
            // Then the words delete themselves back to their letters (H, P, G, A).
            await wait(250);
            if (window.siteNav) window.siteNav.unspellAll();
        } else {
            // The background switches straight to the clicked page, where the clicked word
            // arrives spelled out (like a normal menu click) and the others show their letters.
            const word = link.textContent.trim();
            try {
                sessionStorage.setItem("navArrived", word);
            } catch (error) {}
            window.location.href = link.href;
        }
    }

    // Coming back with the browser's Back button restores the page mid-intro: show the normal home page.
    window.addEventListener("pageshow", (event) => {
        if (event.persisted && intro.isConnected) finish();
    });

    // Already played during this visit (checked in main.html's <head>; a reload always replays),
    // or the visitor prefers less motion: skip it.
    if (html.classList.contains("intro-seen") || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        finish();
        return;
    }

    try {
        sessionStorage.setItem("introSeen", "1");
    } catch (error) {}

    bigNav.forEach((word) => word.addEventListener("click", onWordClick));
    loading().then(toPhaseTwo).catch(finish);
})();
