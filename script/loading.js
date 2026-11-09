const loadingDuration = 3000; // Keeps the loading sequence at exactly 3 seconds.
const loadingFills = document.querySelectorAll(".loading-fill"); // Finds every element that visually fills a loading bar.
const loadingPage = document.body; // Stores the page body so its loading class can be changed later.
const loadingStartedAt = performance.now(); // Records the exact time when loading begins.

function updateLoadingBar(currentTime) { // Updates the loading bar on each animation frame.
    const elapsedProgress = Math.min(
        (currentTime - loadingStartedAt) / loadingDuration,
        1
    );
    const progress = elapsedProgress * elapsedProgress * (3 - 2 * elapsedProgress);

    loadingFills.forEach((loadingFill) => {
        loadingFill.style.width = `${progress * 100}%`; // Converts progress to a percentage and sets each fill width.
    });

    if (elapsedProgress < 1) { // Checks whether the 3-second loading period is still running.
        requestAnimationFrame(updateLoadingBar); // Schedules the next update before the next browser repaint.
        return; // Stops this function here until the next animation frame.
    } // Ends the loading-period check.

    loadingPage.classList.remove("is-loading"); // Reveals the page content and the navigation text.
    loadingFills.forEach((loadingFill) => {
        loadingFill.setAttribute("aria-hidden", "true"); // Tells assistive technology to ignore each decorative fill.
    });
} // Ends the loading-bar update function.

requestAnimationFrame(updateLoadingBar); // Starts the first loading-bar update.
