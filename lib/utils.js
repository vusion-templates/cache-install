const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const config = require('./config');
class Version {
    constructor(root) {
        this.root = root;
    }

    get() {
        if (!this.value) {
            const versionPath = path.join(this.root, '.version.json');
            let version = [];
            if (fs.existsSync(versionPath)) {
                try {
                    const content = fs.readFileSync(versionPath).toString();
                    version = JSON.parse(content);
                } catch (error) {

                }
            }
            this.value = version;
        }
        return this.value;
    }

    set(content) {
        const versionPath = path.join(this.root, '.version.json');
        fs.writeFileSync(versionPath, JSON.stringify(content));
    }
}
const getZipPath = function (root, hash) {
    return path.resolve(root, hash + '.tar');
};
module.exports = {
    isNew() {
        return !fs.existsSync(config.PROJECT_CACHE_PATH);
    },
    Version,
    md5(str, len = 16) {
        const md5 = crypto.createHash('md5');
        return md5.update(str).digest('hex').substr(0, len);
    },
    getZipPath,
    isProject() {
        return ('PARAM_APP_TYPE' in process.env);
    },
    getLatestVersion(templateRoot) {
        const version = new Version(templateRoot);
        const versionList = version.get();
        if (versionList.length) {
            const tmp = versionList.reverse().find((i) => i && fs.existsSync(getZipPath(templateRoot, i)));
            return tmp ? getZipPath(templateRoot, versionList.pop()) : '';
        }
        return '';
    },
    getProjectConfig(root, currentVersion) {
        const version = new Version(root);
        const zipPath = getZipPath(root, currentVersion);
        const versionList = version.get();
        let cacheZipPath;
        if (versionList.length) {
            if (!versionList.includes(currentVersion) || !fs.existsSync(getZipPath(root, currentVersion))) {
                const tmp = versionList.reverse().find((i) => fs.existsSync(getZipPath(root, i)));
                cacheZipPath = tmp ? getZipPath(root, tmp) : '';
            } else {
                cacheZipPath = getZipPath(root, currentVersion);
            }
        }
        return {
            zipPath,
            cacheZipPath,
            version,
        };
    },
    print(str) {
        console.log();
        console.log(`*****************| ${str} |*******************`);
        console.log();
    },
    time(str, action) {
        console.time(str);
        action();
        console.timeEnd(str);
    },
};
