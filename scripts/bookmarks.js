/*! bookmarks.js */

let _data = null;
let _activeTagId = null;
let _searchQuery = "";
let _searchTimer = null;

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderPage(data) {
    _data = data;

    const tagMap = Object.fromEntries(
        data.tags.map(tag => [tag.id, tag.label])
    );

    const terms = _searchQuery
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

    const visibleBookmarks = data.bookmarks.filter(bookmark => {
        // Filtre par tag actif
        if (
            _activeTagId !== null &&
            !(bookmark.tags ?? []).some(tag => tag.id === _activeTagId)
        ) {
            return false;
        }

        // Pas de recherche
        if (terms.length === 0) {
            return true;
        }

        const name = String(bookmark.name ?? "").toLowerCase();

        const tagLabels = (bookmark.tags ?? [])
            .map(tag => tagMap[tag.id] ?? "")
            .join(" ")
            .toLowerCase();

        return terms.every(term =>
            name.includes(term) || tagLabels.includes(term)
        );
    });

    document.getElementById("page").innerHTML = `
        <div class="page">

            <header class="page-header">
                <div class="page-header-content">
                    <h1>Bookmarks</h1>

                    <input
                        type="search"
                        id="search-input"
                        placeholder="Rechercher…"
                        value="${escapeHtml(_searchQuery)}"
                    >
                </div>
            </header>

            <div class="page-content">

                <aside class="page-content-left-column">
                    <section class="page-content-section">

                        <div class="page-content-section-title">
                            Tags
                        </div>

                        <div class="label-list">
                            ${data.tags.map(tag => `
                                <div
                                    class="label-gauge ${tag.id === _activeTagId ? "active" : ""}"
                                    data-tag-id="${escapeHtml(tag.id)}"
                                    role="button"
                                    tabindex="0"
                                >
                                    <div class="label-name">
                                        ${escapeHtml(tag.label)}
                                    </div>
                                </div>
                            `).join("")}
                        </div>

                    </section>
                </aside>

                <main class="page-content-right-column">
                    <section class="section">

                        <div class="section-title">
                            <div class="page-content-section-title">
                                Liens
                            </div>

                            <button
                                type="button"
                                class="btn-add"
                                id="btn-add"
                                title="Ajouter un lien"
                            >
                                ➕
                            </button>
                        </div>

                        <form id="form-add" class="form-add" hidden>
                            <input
                                type="text"
                                name="name"
                                placeholder="Libellé du lien"
                                required
                            >

                            <input
                                type="url"
                                name="url"
                                placeholder="Adresse https://…"
                                required
                            >

                            <input
                                type="text"
                                name="tags"
                                placeholder="tags,séparés,par,des,virgules"
                            >

                            <div class="form-actions">
                                <button type="submit">
                                    Ajouter
                                </button>
                            </div>
                        </form>

                        ${
                            visibleBookmarks.map(bookmark => `
                                <article class="section">
                                    <div class="section-header">

                                        <a
                                            class="section-title"
                                            href="${escapeHtml(bookmark.url)}"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            ${escapeHtml(bookmark.name)}
                                        </a>

                                        <div class="section-labels">
                                            ${(bookmark.tags ?? [])
                                                .map(tag => `
                                                    <span class="section-label">
                                                        ${escapeHtml(
                                                            tagMap[tag.id] ?? tag.id
                                                        )}
                                                    </span>
                                                `)
                                                .join("")}
                                        </div>

                                        <button
                                            type="button"
                                            class="btn-delete"
                                            data-url="${escapeHtml(bookmark.url)}"
                                            title="Supprimer le lien"
                                        >
                                            ✖️
                                        </button>

                                    </div>
                                </article>
                            `).join("")
                            || '<p class="empty">Aucun lien.</p>'
                        }

                    </section>
                </main>

            </div>
        </div>
    `;

    bindTagEvents();
    bindDeleteEvents();
    bindSearchEvent();
    bindAddEvent();
}

/**
 * Gestion des tags
 */
function bindTagEvents() {
    document.querySelectorAll(".label-gauge").forEach(label => {
        const selectTag = () => {
            const id = Number(label.dataset.tagId);

            _activeTagId = _activeTagId === id ? null : id;

            renderPage(_data);
        };

        label.addEventListener("click", selectTag);

        label.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                selectTag();
            }
        });
    });
}

/**
 * Gestion de la suppression
 */
function bindDeleteEvents() {
    document.querySelectorAll(".btn-delete").forEach(button => {
        button.addEventListener("click", () => {
            const url = button.dataset.url;

            _data.bookmarks = _data.bookmarks.filter(
                bookmark => bookmark.url !== url
            );

            renderPage(_data);
        });
    });
}

/**
 * Gestion de la recherche
 */
function bindSearchEvent() {
    const input = document.getElementById("search-input");

    input.addEventListener("input", event => {
        clearTimeout(_searchTimer);

        const caretStart = event.target.selectionStart;
        const caretEnd = event.target.selectionEnd;
        const value = event.target.value;

        _searchTimer = setTimeout(() => {
            _searchQuery = value;

            renderPage(_data);

            const newInput = document.getElementById("search-input");

            newInput.focus();
            newInput.setSelectionRange(caretStart, caretEnd);
        }, 300);
    });
}

/**
 * Gestion de l'ajout
 */
function bindAddEvent() {
    const btnAdd = document.getElementById("btn-add");
    const formAdd = document.getElementById("form-add");

    btnAdd.addEventListener("click", () => {
        formAdd.hidden = !formAdd.hidden;

        if (!formAdd.hidden) {
            formAdd.elements.name.focus();
        }
    });

    formAdd.addEventListener("submit", event => {
        event.preventDefault();

        const name = formAdd.elements.name.value.trim();
        const url = formAdd.elements.url.value.trim();
        const tagsRaw = formAdd.elements.tags.value.trim();

        const tagIds = [];

        if (tagsRaw) {
            tagsRaw
                .split(",")
                .map(label => label.trim())
                .filter(Boolean)
                .forEach(label => {
                    let tag = _data.tags.find(
                        existingTag =>
                            existingTag.label.toLowerCase() === label.toLowerCase()
                    );

                    if (!tag) {
                        const maxId = _data.tags.reduce(
                            (max, existingTag) =>
                                Math.max(max, Number(existingTag.id) || 0),
                            0
                        );

                        tag = {
                            id: maxId + 1,
                            label
                        };

                        _data.tags.push(tag);
                    }

                    if (!tagIds.includes(tag.id)) {
                        tagIds.push(tag.id);
                    }
                });
        }

        _data.bookmarks.push({
            name,
            url,
            tags: tagIds.map(id => ({ id }))
        });

        renderPage(_data);
    });
}
