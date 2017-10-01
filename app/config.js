'use strict';

const fs = require('fs');
const nconf = require('nconf');

const appName = 'ai2v-ui';
const platform = process.platform;

function getUserHome() {
    return process.env[platform == 'win32' ? 'USERPROFILE' : 'HOME'];
}

function getConfigFile() {
    let configFile = appName + '.json';
    const home = getUserHome();
    console.log('home = ' + home);
    if (platform == 'win32') {
        configFile = home + '/' + configFile;
    }
    else {
        let configDirPath = home + '/.config';
        const configDir = fs.lstatSync(configDirPath);
        // console.log('configDir = ', configDir);
        if (configDir && configDir.isDirectory()) {
            configFile = configDirPath + '/' + configFile;
        }
        else {
            configFile = home + '/.' + configFile;
        }
    }
    console.log('configFile = ', configFile);

    if (!fs.existsSync(configFile)) {
        initConfig(configFile);
    }

    return configFile;
}

const defaultConfig = {};

function initConfig(configFile) {
    fs.writeFileSync(configFile, JSON.stringify(defaultConfig));
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
