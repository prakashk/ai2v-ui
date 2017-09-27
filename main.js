'use strict';

const {app, BrowserWindow} = require('electron');

var path = require('path');
var url = require('url');

let mainWindow;

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
