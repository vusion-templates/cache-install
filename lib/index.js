const path = require('path');
const fs = require('fs');
const Utils = require('./utils');

Utils.time('npm cache-install', () => {
    const config = require('./config');
    const pkg = config.pkg;
    if (!(Object.keys(pkg.devDependencies || {}).length + Object.keys(pkg.dependencies || {}).length)) {
        return;
    }
    const isCI = Utils.isCI();
    const life = require('./life');
    const inited = life.init();
    if (!inited) {
        life.install();
        return;
    }

    const root = config.root;
    const PROJECT_CACHE_PATH = config.PROJECT_CACHE_PATH;
    const TEMPLATE_CACHE_PATH = config.TEMPLATE_CACHE_PATH;

    let currentVersion = Utils.md5(JSON.stringify(pkg));
    let zipPath;
    let cacheZipPath;
    let version;
    if (Utils.isProject()) {
        const config = Utils.getProjectConfig(PROJECT_CACHE_PATH, currentVersion);
        zipPath = config.zipPath;
        cacheZipPath = config.cacheZipPath;
        version = config.version;
        if (!cacheZipPath) {
            cacheZipPath = Utils.getLatestVersion(TEMPLATE_CACHE_PATH);
        }
    } else {
        const templateConfig = Utils.getProjectConfig(TEMPLATE_CACHE_PATH, currentVersion);
        zipPath = templateConfig.zipPath;
        cacheZipPath = templateConfig.cacheZipPath;
        version = templateConfig.version;
    }

    function install() {
        life.install();
        const tmpZipPath = Utils.getLatestHash();
        const cachePath = Utils.isProject() ? PROJECT_CACHE_PATH : TEMPLATE_CACHE_PATH;
        if (tmpZipPath) {
            currentVersion = tmpZipPath;
            zipPath = Utils.getZipPath(cachePath, tmpZipPath);
        }
        if (!fs.existsSync(zipPath) && isCI && !process.env.PARAM_SKIP_BACKUP) {
            life.backup(zipPath);
            const content = version.get();
            content.push(currentVersion);
            version.set(Array.from(new Set(content.reverse())).reverse());
            life.clearOldBackup(cachePath);
        }
    }

    if (!fs.existsSync(path.join(root, 'node_modules'))) {
        Utils.print('本地无 node_modules');
        if (cacheZipPath && fs.existsSync(cacheZipPath)) {
            Utils.print('从缓存拷贝 node_modules');
            console.log(cacheZipPath);
            life.installFromCache(cacheZipPath);
        } else {
            Utils.print('未找到缓存');
            console.log(cacheZipPath);
        }
    } else {
        Utils.print('本地存在 node_modules');
    }
    install();
});
