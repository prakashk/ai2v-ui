'use strict';

const {ipcRenderer, remote} = require('electron');
const {dialog} = remote;
const path = require('path');
const config = require('./config');

function chooseFfmpegPath() {
    dialog.showOpenDialog(
        {
            title: "Select ffmpeg program location",
            filters: {
                name: "Program files",
                extensions: process.platform == 'win32' ? 'exe' : ''
            },
            properties: ['openFile']
        },
        function(filePath) {
            $('#ffmpeg-program').val(filePath);
        }
    )
}

function chooseOutputFolder() {
    dialog.showOpenDialog(
        {
            title: "Select folder to save video files",
            properties: ['openDirectory']
        },
        function(filePath) {
            $('#video-output-folder').val(filePath);
        }
    )
}

function saveUpdatedSettings() {
    config.saveSetting('ffmpeg_path', $('#ffmpeg-program').val());
    config.saveSetting('video_output_folder', $('#video-output-folder').val());
}

onload = function() {
    $('#choose-ffmpeg').click(chooseFfmpegPath);
    $('#ffmpeg-program').val(config.readSetting('ffmpeg_path'));

    $('#choose-output-folder').click(chooseOutputFolder);
    $('#video-output-folder').val(config.readSetting('video_output_folder'));

    $('#save-settings').click(saveUpdatedSettings);
}
