/*! app.js */

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("__INPUT_PATH__");

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const yaml = await response.text();
        const data = jsyaml.load(yaml);

        renderPage(data);
    } catch (error) {
        console.error(
            "Erreur lors du chargement des bookmarks :",
            error
        );

        document.getElementById("page").innerHTML = `
            <p class="error">
                Impossible de charger les bookmarks.
            </p>
        `;
    }
});
