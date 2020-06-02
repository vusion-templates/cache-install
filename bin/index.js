#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const life = require('../lib/life');
const Utils = require('../lib/utils');
const client = path.join(process.cwd(), './client');
const server = path.join(process.cwd(), './server');

if (fs.existsSync(client) && fs.existsSync(path.join(client, './package.json'))) {
    Utils.print('client');
    life.subInit('client');
}
if (fs.existsSync(server) && fs.existsSync(path.join(server, './package.json'))) {
    Utils.print('server');
    life.subInit('server');
}
require('../lib');

process.exit(0);