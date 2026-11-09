const galleryImages = document.querySelectorAll(".image-grid img");
const imageGrid = document.querySelector(".image-grid");
const projectInfo = document.querySelector(".gallery-project-info");
const projectTitle = document.querySelector(".gallery-project-title");
const projectToggle = document.querySelector(".gallery-project-toggle");
const projectDescription = document.querySelector(".gallery-project-description");
const projectDescriptionText = projectDescription.querySelector("p");
const projects = [
    "Vestibül - Sculptural light meets architecture",
    "A.E. Köchert - Elegant lighting meets craftsmanship",
    "Sacher - Timeless elegance through illumination",
    "Nest - Woven rattan embraces light",
    "Wajima Lacquerware Lamp - Traditional lacquer meets contemporary light",
    "Newton in Paris - Light transforms spatial perception",
    "Shibari - Fragile washi meets tension",
    "Sacher Hotel - Atmospheric lighting shapes hospitality",
    "Vestibül - Sculptural light meets architecture",
];
const projectDescriptionCopy = "A project exploring the relationship between sculptural light, material, and the atmosphere of a space.";
let currentImageIndex = 0;
let rotationTimer;
const rotationInterval = 800; // Time per image (ms). Lower = faster.

function updateProjectInfo() {
    // Each image carries its own project name (data-title in gallery.html), so the order can change freely.
    const image = galleryImages[currentImageIndex];
    projectTitle.textContent = image.dataset.title || projects[currentImageIndex % projects.length];
    projectDescriptionText.textContent = projectDescriptionCopy;
}

function setProjectDescriptionOpen(isOpen) {
    projectToggle.setAttribute("aria-expanded", String(isOpen));
    projectToggle.setAttribute("aria-label", isOpen ? "Hide project description" : "Show project description");
    projectDescription.setAttribute("aria-hidden", String(!isOpen));
    projectInfo.classList.toggle("is-expanded", isOpen);
}

function showNextGalleryImage() {
    galleryImages[currentImageIndex].classList.remove("is-current");
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    galleryImages[currentImageIndex].classList.add("is-current");
    if (imageGrid.classList.contains("is-paused")) {
        updateProjectInfo();
    }
}

if (galleryImages.length > 0) {
    galleryImages[0].classList.add("is-current");
    updateProjectInfo();
    imageGrid.addEventListener("click", () => {
        if (rotationTimer) {
            window.clearInterval(rotationTimer);
            rotationTimer = undefined;
            imageGrid.classList.add("is-paused");
            projectInfo.classList.add("is-visible");
            updateProjectInfo();
            imageGrid.setAttribute("aria-label", "Image gallery, paused");
            return;
        }

        rotationTimer = window.setInterval(showNextGalleryImage, rotationInterval);
        imageGrid.classList.remove("is-paused");
        projectInfo.classList.remove("is-visible");
        setProjectDescriptionOpen(false);
        imageGrid.setAttribute("aria-label", "Image gallery, playing");
    });
    rotationTimer = window.setInterval(showNextGalleryImage, rotationInterval);
    // Clicking anywhere on the text box (the + included) opens or closes the description.
    // The + button stays for keyboard users; its click bubbles up to this one handler.
    projectInfo.addEventListener("click", () => {
        setProjectDescriptionOpen(projectToggle.getAttribute("aria-expanded") !== "true");
    });
}
