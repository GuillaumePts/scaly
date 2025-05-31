const fs = require('fs');
const path = require('path');

const copyFolderContent = (src, dest) => {
    return fs.promises.readdir(src, { withFileTypes: true }).then(entries => {
        return Promise.all(entries.map(entry => {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);

            if (entry.isDirectory()) {
                return fs.promises.mkdir(destPath, { recursive: true })
                    .then(() => copyFolderContent(srcPath, destPath));
            } else {
                return fs.promises.copyFile(srcPath, destPath);
            }
        }));
    });
};

const updateClientTheme = async (siteId, newColor) => {
    const allowedFolders = ['css', 'icon', 'iconfooter', 'js', 'logo', 'svg'];

    const themeName = newColor === 'Noir' ? 'pics-noir' : 'pics-blanc';
    const themePublicPath = path.join(__dirname, '..', 'build', themeName, 'public');
    const clientPublicPath = path.join(__dirname, '..', 'clients', siteId, 'public');

    for (const folderName of allowedFolders) {
        const srcFolder = path.join(themePublicPath, folderName);
        const destFolder = path.join(clientPublicPath, folderName);

        // Supprimer l'ancien dossier (s'il existe) puis copier le nouveau
        if (fs.existsSync(destFolder)) {
            await fs.promises.rm(destFolder, { recursive: true, force: true });
        }

        if (fs.existsSync(srcFolder)) {
            await fs.promises.mkdir(destFolder, { recursive: true });
            await copyFolderContent(srcFolder, destFolder);
        } else {
            console.warn(`Le dossier source n'existe pas : ${srcFolder}`);
        }
    }
};

module.exports = updateClientTheme;
