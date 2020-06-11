const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const config = require('./config');
const Utils = require('./utils');
const TEMPLATE_CACHE_PATH = config.TEMPLATE_CACHE_PATH;
const PROJECT_CACHE_PATH = config.PROJECT_CACHE_PATH;
const CACHE_ROOT = config.CACHE_ROOT;
module.exports = {
    init() {
        if (fs.existsSync(CACHE_ROOT)) {
            if (!fs.existsSync(path.dirname(TEMPLATE_CACHE_PATH))) {
                fs.mkdirSync(path.dirname(TEMPLATE_CACHE_PATH));
            }
            if (!fs.existsSync(path.dirname(PROJECT_CACHE_PATH))) {
                fs.mkdirSync(path.dirname(PROJECT_CACHE_PATH));
            }
            if (!fs.existsSync(TEMPLATE_CACHE_PATH)) {
                fs.mkdirSync(TEMPLATE_CACHE_PATH);
            }
            if (!fs.existsSync(PROJECT_CACHE_PATH)) {
                fs.mkdirSync(PROJECT_CACHE_PATH);
            }
            return true;
        }
        return false;
    },
    install() {
        Utils.print('npm install');
        Utils.time('npm install', () => {
            const result = cp.spawnSync('npm', ['i', '--no-audit', '--progress=false'], {
                stdio: 'inherit',
                pwd: config.root,
            });
            if (result.status !== 0) {
                process.exit(result.status);
            }
        });
        this.forceUpdate();
    },
    forceUpdate() {
        const pkg = config.pkg;
        const keys = Object.keys(pkg.forceUpdate || {});
        if (keys.length) {
            Utils.print('npm force-update');
            Utils.time('npm force-update', () => {
                const result = cp.spawnSync('npm', ['update', '--no-audit', '--progress=false', ...keys], {
                    stdio: 'inherit',
                    pwd: config.root,
                });
                if (result.status !== 0) {
                    process.exit(result.status);
                }
            });
        }
    },
    subInit(subDir) {
        Utils.time('npm ' + subDir + ':init', () => {
            const result = cp.spawnSync('npm', ['run', subDir + ':init'], {
                stdio: 'inherit',
                pwd: config.root,
            });
            if (result.status !== 0) {
                process.exit(result.status);
            }
        });
    },
    backup(zipPath) {
        Utils.print('backup node_modules');
        Utils.time('backup node_modules', () => {
            cp.spawnSync('tar', ['-c', '-f', zipPath, './node_modules'], {
                stdio: 'inherit',
                pwd: config.root,
            });
        });
    },
    clearOldBackup(root) {
        const version = new Utils.Version(root);
        const list = version.get();
        if (list.length > config.MAX_CACHE + 1) {
            const targetVersion = list.shift();
            version.set(list);
            Utils.time('clear cache ' + targetVersion, () => {
                try {
                    fs.unlinkSync(Utils.getZipPath(root, targetVersion));      
                    if (list.length > config.MAX_CACHE + 1) {
                        this.clearOldBackup(root);
                    }
                } catch (error) {
                    list.unshift(targetVersion);
                    version.set(list);
                }
            });
        }

    },
    installFromCache(cacheZipPath) {
        Utils.time('copy cache', () => {
            const result = cp.spawnSync('tar', ['-x', '-f', cacheZipPath, '-C', config.root], {
                stdio: 'inherit',
                pwd: config.root,
            });
            if (result.status !== 0) {
                process.exit(result.status);
            }
        });
    },
};
