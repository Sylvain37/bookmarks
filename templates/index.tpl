<!--! index.tpl -->

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bookmarks</title>
    <link rel="icon" type="image/x-icon" href="static/favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="static/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="96x96" href="static/favicon-96x96.png">
    <link rel="icon" type="image/png" sizes="32x32" href="static/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="static/favicon-16x16.png">
    <link rel="manifest" href="static/site.webmanifest">
    <link rel="stylesheet" href="static/style.css">
    <script src="scripts/settings.js"></script>
    <script src="scripts/js-yaml.min.js"></script>
    <script src="scripts/bookmarks.js"></script>
</head>
<body>
    <div class="settings-menu" id="settings-menu">
        <button class="settings-menu-trigger" aria-label="Paramètres" aria-haspopup="true">🧰</button>
        <div class="settings-menu-panel" role="menu">
            <div class="settings-menu-group">
                <div class="settings-menu-label">Teinte du thème</div>
                <button class="settings-menu-item" theme-color="light" role="menuitem">☀️ Claire</button>
                <button class="settings-menu-item" theme-color="dark" role="menuitem">🌙 Sombre</button>
                <button class="settings-menu-item" theme-color="system" role="menuitem">🔗 Système</button>
            </div>
            <div class="settings-menu-group">
                <div class="settings-menu-label">Disposition</div>
                <button class="settings-menu-item" theme-layout="onepage" role="menuitem">One-page</button>
                <button class="settings-menu-item" theme-layout="three-areas" role="menuitem">Titre + 2 colonnes</button>
            </div>
            <div class="settings-menu-group">
                <div class="settings-menu-label">Données</div>
                <button class="settings-menu-item" id="btn-export" role="menuitem">💾 Sauvegarder (YAML)</button>
                <button class="settings-menu-item" id="btn-import" role="menuitem">📥 Importer (YAML)</button>
            </div>
        </div>
    </div>
    <div id="page"></div>
    <script>
        fetch("__INPUT_PATH__")
        .then(r => r.text())
        .then(yaml => {
            const data = jsyaml.load(yaml);
            renderPage(data);
        })
    .catch(error => {
        console.error(
            "Erreur lors du chargement du fichier __INPUT_PATH__ :",
            error
        );
    });
    </script>
</body>
</html>
