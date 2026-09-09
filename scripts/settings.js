/*! settings.js */

function initSettings() {
    const root = document.documentElement;
    const panel = document.querySelector(".settings-menu-panel");

    if (!panel) {
        return;
    }

    const DEFAULT_THEME = "system";
    const DEFAULT_LAYOUT = "three-areas";

    const getTheme = () =>
        localStorage.getItem("theme") ?? DEFAULT_THEME;

    const getLayout = () =>
        localStorage.getItem("layout") ?? DEFAULT_LAYOUT;

    const applyTheme = theme => {
        if (theme === "system") {
            root.removeAttribute("theme-color");
            return;
        }

        root.setAttribute("theme-color", theme);
    };

    const applyLayout = layout => {
        root.setAttribute("theme-layout", layout);
    };

    const refreshActive = () => {
        const theme = getTheme();
        const layout = getLayout();

        panel.querySelectorAll("[theme-color]").forEach(button => {
            button.classList.toggle(
                "active",
                button.getAttribute("theme-color") === theme
            );
        });

        panel.querySelectorAll("[theme-layout]").forEach(button => {
            button.classList.toggle(
                "active",
                button.getAttribute("theme-layout") === layout
            );
        });
    };

    const exportData = () => {
        if (typeof _data === "undefined" || !_data) {
            alert("Aucune donnée à exporter.");
            return;
        }

        const yaml = jsyaml.dump(_data, {
            indent: 2,
            lineWidth: -1
        });

        const blob = new Blob(
            [yaml],
            { type: "application/x-yaml;charset=utf-8" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "bookmarks.yml";
        link.click();

        URL.revokeObjectURL(url);
    };

    const importData = () => {
        fileInput.click();
    };

    const fileInput = document.createElement("input");

    fileInput.type = "file";
    fileInput.id = "file-input";
    fileInput.accept = ".yml,.yaml";
    fileInput.hidden = true;

    document.body.appendChild(fileInput);

    panel.addEventListener("click", event => {
        const button = event.target.closest(".settings-menu-item");

        if (!button || !panel.contains(button)) {
            return;
        }

        const theme = button.getAttribute("theme-color");

        if (theme) {
            localStorage.setItem("theme", theme);
            applyTheme(theme);
            refreshActive();
            return;
        }

        const layout = button.getAttribute("theme-layout");

        if (layout) {
            localStorage.setItem("layout", layout);
            applyLayout(layout);
            refreshActive();
            return;
        }

        switch (button.id) {
            case "btn-export":
                exportData();
                break;

            case "btn-import":
                importData();
                break;
        }
    });

    fileInput.addEventListener("change", event => {
        const [file] = event.target.files;

        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            try {
                const data = jsyaml.load(reader.result);

                if (!data || typeof data !== "object") {
                    throw new Error("La structure du fichier est invalide.");
                }

                if (!Array.isArray(data.tags)) {
                    data.tags = [];
                }

                if (!Array.isArray(data.bookmarks)) {
                    data.bookmarks = [];
                }

                _activeTagId = null;
                _searchQuery = "";

                renderPage(data);
            } catch (error) {
                alert(`Fichier YAML invalide : ${error.message}`);
            }
        };

        reader.onerror = () => {
            alert("Impossible de lire le fichier YAML.");
        };

        reader.readAsText(file);

        // Permet de sélectionner à nouveau le même fichier.
        fileInput.value = "";
    });

    const mediaQuery = window.matchMedia(
        "(prefers-color-scheme: dark)"
    );

    mediaQuery.addEventListener("change", () => {
        if (getTheme() === "system") {
            applyTheme(DEFAULT_THEME);
        }
    });

    // État initial
    applyTheme(getTheme());
    applyLayout(getLayout());
    refreshActive();
}

document.addEventListener("DOMContentLoaded", initSettings);
