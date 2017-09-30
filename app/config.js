'use strict';

const fs = require('fs');
const nconf = require('nconf');

const appName = 'ai2v-ui';
const platform = process.platform;

function getUserHome() {
    return process.env[platform == 'win32' ? 'USERPROFILE' : 'HOME'];
}

function getConfigFile() {
    const home = getUserHome();
    if (platform == 'win32') {
        home + '/' + appName + '.json';
    }
    else {
        const configDir = fs.lstatSync(home + '/.config');
        if (configDir.isDirectory()) {
            return configDir + '/' + appName + '.json';
        }
        else {
            return home + '/.' + appName + '.json';
        }
    }
}
function readSetting(key) {
    let config = nconf.file(getConfigFile());
    config.load();
    return config.get(key);
}

function saveSetting(key, value) {
    let config = nconf.file(getConfigFile());
    config.set(key, value);
    config.save();
}

module.exports = {
    saveSetting: saveSetting,
    readSetting: readSetting
};
