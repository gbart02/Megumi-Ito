const projectImages = [
    "../images/process/13248cd0-b619-46f2-84a7-b01932e6d31f.jpg.avif",
    "../images/process/1b1b568e-daa6-4045-b404-b31f9acd9840.jpg.avif",
    "../images/process/1ee492ec-3eb9-43f7-a247-f5a3afd301a3.jpg.avif",
    "../images/process/26c2a791-779b-41a9-a597-81160a5ed7cb.jpg.avif",
    "../images/process/28660352-fbf9-44d4-b6ad-29d73e0fb03b.jpg.avif",
    "../images/process/49d7ebb9-eb49-4506-a9ea-6e93dee9d04d.jpg.avif",
    "../images/process/58e37e4d-9979-4c26-918d-9f10e52a5dca.jpg.avif",
    "../images/process/6bcfbcd1-5c25-450b-beeb-5b84c4bb6b29.jpg.avif",
    "../images/process/74ff45f5-1d5a-4004-b9ee-38d30ef8f3e5.jpg.avif",
    "../images/process/78976383-c3fe-43e9-87f3-896e14ba5396.jpg.avif",
    "../images/process/8c8dfbda-03aa-40c2-8150-2ab58db7fff4.jpg.avif",
    "../images/process/bcb2d2a4-7cce-4948-ba67-d80e4fe550bb.jpg.avif",
    "../images/process/e229a657-4cca-456d-a0d2-024608bbd5fd.jpg.avif",
    "../images/process/e914c2ad-1088-4b1f-8b3a-6936dbe35458.jpg.avif",
    "../images/process/faed9c83-d9b4-46f1-9697-a9939d298e92.jpg.avif",
];

const projectCards = document.querySelectorAll(".project-card");
const projectListItems = document.querySelectorAll(".project-list-item");
const projectListToggle = document.querySelector(".project-list-toggle");
const projectList = document.querySelector(".project-list-items");
const projectFilters = document.querySelectorAll(".project-filter");
const projectModal = document.querySelector(".project-modal");
const projectModalTitle = document.querySelector("#project-modal-title");
const closeButton = document.querySelector(".project-modal-close");
const slides = [...document.querySelectorAll(".pm-slide")];
let currentImageIndex = 0;
let currentProjectImages = projectImages;

const projectCategories = {
    "Vestibül - Sculptural light meets architecture": "space",
    "A.E. Köchert - Elegant lighting meets craftsmanship": "material",
    "Sacher - Timeless elegance through illumination": "light",
    "Nest - Woven rattan embraces light": "material",
    "Wajima Lacquerware Lamp - Traditional lacquer meets contemporary light": "material",
    "Newton in Paris - Light transforms spatial perception": "space",
    "Shibari - Fragile washi meets tension": "material",
    "Sacher Hotel - Atmospheric lighting shapes hospitality": "light",
};

function getProjectTitle(element) {
    return element.querySelector(".project-card-caption span:last-child")?.textContent ||
        element.dataset.projectTitle;
}

function filterProjects(filter) {
    projectCards.forEach((projectCard) => {
        const title = getProjectTitle(projectCard);
        projectCard.hidden = filter !== "all" && projectCategories[title] !== filter;
    });

    projectListItems.forEach((projectListItem) => {
        projectListItem.hidden = filter !== "all" &&
            projectCategories[projectListItem.dataset.projectTitle] !== filter;
    });

    projectFilters.forEach((projectFilter) => {
        const isActive = projectFilter.dataset.filter === filter;
        projectFilter.classList.toggle("is-active", isActive);
        projectFilter.setAttribute("aria-pressed", String(isActive));
    });
}

projectFilters.forEach((projectFilter) => {
    projectFilter.addEventListener("click", () => {
        filterProjects(projectFilter.dataset.filter);
    });
});

projectListToggle.addEventListener("click", () => {
    const isExpanded = projectListToggle.getAttribute("aria-expanded") === "true";
    projectListToggle.setAttribute("aria-expanded", String(!isExpanded));
    projectList.hidden = isExpanded;
    projectListToggle.querySelector("span").textContent = isExpanded ? "+" : "—";
});

// ----- Project window carousel -----
// Three image slots take turns: the front image, the one faded behind it on the right, and
// one waiting further back. Moving on: the front image slides off to the left, the one behind
// slides into the front, and the waiting one fades in behind.
const AUTOPLAY = 10000; // Moves on by itself after 10 seconds; restarts after every click.
const SLIDE_TIME = 900; // Must match the .pm-slide transition in beauty.css.
let slots = { main: slides[0], next: slides[1], waiting: slides[2] };
let autoplayTimer = null;
let moving = false;

function imageAt(offset) {
    const count = currentProjectImages.length;
    return currentProjectImages[(((currentImageIndex + offset) % count) + count) % count];
}

function setSlot(slide, state) {
    slide.classList.remove("is-main", "is-next", "is-waiting", "is-leaving");
    slide.classList.add(state);
}

// Puts every slot in place at once (when opening a project or jumping back).
function placeSlides() {
    slides.forEach((slide) => slide.classList.add("no-transition"));
    slots.main.src = imageAt(0);
    slots.next.src = imageAt(1);
    slots.waiting.src = imageAt(2);
    setSlot(slots.main, "is-main");
    setSlot(slots.next, "is-next");
    setSlot(slots.waiting, "is-waiting");
    slots.main.alt = `${projectModalTitle.textContent}, image ${currentImageIndex + 1} of ${currentProjectImages.length}`;
    slots.next.alt = "Next image";
    slots.waiting.alt = "";
    slides[0].getBoundingClientRect();
    slides.forEach((slide) => slide.classList.remove("no-transition"));
}

function showNextImage() {
    if (moving) return;
    moving = true;
    currentImageIndex = (currentImageIndex + 1) % currentProjectImages.length;

    const leaving = slots.main;
    setSlot(leaving, "is-leaving");
    setSlot(slots.next, "is-main");
    setSlot(slots.waiting, "is-next");
    slots = { main: slots.next, next: slots.waiting, waiting: leaving };
    slots.main.alt = `${projectModalTitle.textContent}, image ${currentImageIndex + 1} of ${currentProjectImages.length}`;
    slots.next.alt = "Next image";

    // Once it has slid away, the old front image goes to the back with the image after next.
    setTimeout(() => {
        leaving.classList.add("no-transition");
        setSlot(leaving, "is-waiting");
        leaving.src = imageAt(2);
        leaving.alt = "";
        leaving.getBoundingClientRect();
        leaving.classList.remove("no-transition");
        moving = false;
    }, SLIDE_TIME);
}

function showPreviousImage() {
    currentImageIndex = (currentImageIndex - 1 + currentProjectImages.length) % currentProjectImages.length;
    placeSlides();
}

function restartAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(showNextImage, AUTOPLAY);
}

// "Vestibül - Sculptural light meets architecture": name in normal type, the part after the dash in italic.
function setProjectTitle(title) {
    const dash = title.indexOf(" - ");
    projectModalTitle.textContent = "";
    if (dash === -1) {
        projectModalTitle.textContent = title;
        return;
    }
    const subtitle = document.createElement("em");
    subtitle.textContent = title.slice(dash + 3);
    projectModalTitle.append(title.slice(0, dash + 3), subtitle);
}

// Puts the image (and the description beside it) exactly halfway between the title and the details line.
const projectModalContent = document.querySelector(".project-modal-content");
const projectDetails = document.querySelector(".pm-details");

function centreProjectStage() {
    if (!projectModal.open) return;
    const top = projectModalContent.getBoundingClientRect().top;
    const titleBottom = projectModalTitle.getBoundingClientRect().bottom - top;
    const detailsTop = projectDetails.getBoundingClientRect().top - top;
    projectModalContent.style.setProperty("--pm-center", `${(titleBottom + detailsTop) / 2}px`);
}

window.addEventListener("resize", centreProjectStage);

function openProject(projectCard) {
    const thumbnail = projectCard.querySelector(".project-card-image img");
    const title = projectCard.querySelector(".project-card-caption span:last-child").textContent;
    currentProjectImages = [thumbnail.src, ...projectImages];
    currentImageIndex = 0;
    setProjectTitle(title);
    projectModal.showModal();
    centreProjectStage();
    placeSlides();
    restartAutoplay();
}

projectCards.forEach((projectCard) => {
    projectCard.addEventListener("click", () => openProject(projectCard));
});

projectListItems.forEach((projectListItem) => {
    projectListItem.addEventListener("click", () => {
        const projectCard = [...projectCards].find((card) =>
            getProjectTitle(card) === projectListItem.dataset.projectTitle
        );

        if (projectCard) {
            openProject(projectCard);
        }
    });
});

// Clicking the front image or the image behind it moves on, and restarts the 10-second timer.
slides.forEach((slide) => {
    slide.addEventListener("click", () => {
        if (slide !== slots.main && slide !== slots.next) return;
        showNextImage();
        restartAutoplay();
    });
});

function closeProject() {
    clearInterval(autoplayTimer);
    if (projectModal.open) projectModal.close();
}

closeButton.addEventListener("click", closeProject);
projectModal.addEventListener("close", () => clearInterval(autoplayTimer));

projectModal.addEventListener("click", (event) => {
    if (event.target === projectModal) {
        closeProject();
    }
});

document.addEventListener("keydown", (event) => {
    if (!projectModal.open) {
        return;
    }

    if (event.key === "ArrowLeft") {
        showPreviousImage();
        restartAutoplay();
    } else if (event.key === "ArrowRight") {
        showNextImage();
        restartAutoplay();
    }
});
