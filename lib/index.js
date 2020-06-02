const path = require('path');
const fs = require('fs');
const Utils = require('./utils');

Utils.time('npm cache-install', () => {
    const life = require('./life');
    const inited = life.init();
    if (!inited) {
        life.install();
        return;
    }
    const config = require('./config');

    const root = config.root;
    const pkg = config.pkg;
    const PROJECT_CACHE_PATH = config.PROJECT_CACHE_PATH;
    const TEMPLATE_CACHE_PATH = config.TEMPLATE_CACHE_PATH;

    const currentVersion = Utils.md5(JSON.stringify(pkg));
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
        if (!fs.existsSync(zipPath)) {
            life.backup(zipPath);
        }
        const content = version.get();
        content.push(currentVersion);
        version.set(Array.from(new Set(content.reverse())).reverse());
    }

    if (!fs.existsSync(path.join(root, 'node_modules'))) {
        Utils.print('本地无 node_modules');
        if (fs.existsSync(cacheZipPath)) {
            Utils.print('从缓存拷贝 node_modules');
            life.installFromCache(cacheZipPath);
        } else {
            Utils.print('未找到缓存');
        }
    } else {
        Utils.print('本地存在 node_modules');
    }
    install();
});
