const fs = require('fs');
const db = require('./db');

let js_files = ["systemConfigure.js"];

module.exports = {
    models: []
};

for (let f of js_files) {
    // console.log(`import model from file ${f}...`);
    let name = f.substring(0, f.length - 3);
    module.exports[name] = require('./' + f);

    module.exports.models.push(name);
}

module.exports.db = db;