const path = require('path');
const root = path.resolve(process.cwd());
const CACHE_ROOT = process.env.PARAM_NPM_LOCAL_CACHE || '/root/.npm/.cicd_cache';
// const CACHE_ROOT = process.env.PARAM_NPM_LOCAL_CACHE || path.join(root, '.tmp');
const packagePath = path.resolve(root, 'package.json');
const pkg = require(packagePath);
const template = Object.assign({}, pkg.template);
const PROJECT_CACHE_PATH = process.env.PARAM_PROJECT_NPM_LOCAL_CACHE || path.resolve(CACHE_ROOT, 'projects', pkg.name);
const templateCache = process.env.PARAM_TEMPLATE_NPM_LOCAL_CACHE || path.resolve(CACHE_ROOT, 'templates');
const TEMPLATE_CACHE_PATH = (template.name ? path.resolve(templateCache, template.name) : PROJECT_CACHE_PATH);

module.exports = {
    root,
    packagePath,
    pkg,
    template,
    CACHE_ROOT,
    TEMPLATE_CACHE_PATH,
    MAX_CACHE: process.env.PARAM_MAX_CACHE || 5,
    PROJECT_CACHE_PATH,
};
