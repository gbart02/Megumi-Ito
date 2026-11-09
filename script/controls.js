const controls = document.querySelector(".bottom-bar");
const root = document.documentElement;
const bars = document.querySelectorAll(".middle-bar, .bottom-bar");

const backgroundColors = {
    white: "#ffffff",
    lightGray: "#d2d3d4",
    warmBeige: "#c2b59b",
};

const shadowColors = {
    blue: "rgba(255, 255, 255, 0.85), 0 0 4rem rgba(254, 254, 255, 0.55)",
    pastelYellow: "rgba(255, 252, 220, 0.85), 0 0 4rem rgba(255, 246, 198, 0.55)",
    green: "rgba(228, 246, 255, 0.85), 0 0 4rem rgba(228, 246, 255, 0.55)",
};

const swatchColors = {
    white: "#ffffff",
    lightGray: "#d2d3d4",
    warmBeige: "#c2b59b",
    blue: "#ffffff",
    pastelYellow: "#fffcdc",
    green: "#e4f6ff",
};

if (controls) {
    function setActiveControl(attribute, value) {
        controls.querySelectorAll(`[data-${attribute}]`).forEach((button) => {
            button.setAttribute("aria-pressed", String(button.dataset[attribute] === value));
        });
    }

    controls.querySelectorAll(".bar-control").forEach((button) => {
        const color = swatchColors[button.dataset.background || button.dataset.shadow];
        button.style.setProperty("--swatch-color", color);
    });

    controls.querySelectorAll("[data-background]").forEach((button) => {
        button.addEventListener("click", () => {
            const background = backgroundColors[button.dataset.background];
            root.style.setProperty("--page-background", background);
            setActiveControl("background", button.dataset.background);
        });
    });

    controls.querySelectorAll("[data-shadow]").forEach((button) => {
        button.addEventListener("click", () => {
            const isActive = button.getAttribute("aria-pressed") === "true";
            if (isActive) {
                root.style.setProperty("--bar-shadow", "none");
                bars.forEach((bar) => {
                    bar.style.setProperty("--bar-shadow", "none");
                });
                setActiveControl("shadow", "");
                return;
            }

            const shadow = `0 0 1.25rem ${shadowColors[button.dataset.shadow]}`;
            root.style.setProperty("--bar-shadow", shadow);
            bars.forEach((bar) => {
                bar.style.setProperty("--bar-shadow", shadow);
            });
            setActiveControl("shadow", button.dataset.shadow);
        });
    });
}
