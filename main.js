'use strict';

const {app, BrowserWindow, ipcMain} = require('electron');

const path = require('path');
const url = require('url');

let mainWindow;
let settingsWindow;

app.on('ready', function () {
    console.log("-- begin --");
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        // backgroundColor: "D6D8DC",
        // don't show until ready
        show: false
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'app/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // show window when page is ready
    mainWindow.once('ready-to-show', function() {
        mainWindow.show()
    });

    mainWindow.on('closed', function() {
        mainWindow = null;
    })

    // initialize();
    console.log("-- init done --");
})

ipcMain.on('open-settings-window', function() {
    if (settingsWindow) {
        return;
    }

    settingsWindow = new BrowserWindow({
        frame: false,
        height: 200,
        width: 600
    });

    settingsWindow.loadURL('file://' + __dirname + 'app/settings.html');

    settingsWindow.on('closed', function() {
        settingsWindow = null;
    });
})

ipcMain.on('close-settings-window', function() {
    if (settingsWindow) {
        settingsWindow.close();
    }
})

ipcMain.on('close-main-window', function() {
    app.quit();
});
