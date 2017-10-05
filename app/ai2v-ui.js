'use strict';

const {ipcRenderer, remote} = require('electron');
const {dialog} = remote;
const path = require('path');
const config = require('./config');

var ffmpeg_path;

var audioAdd, audioRemove, audioMoveUp, audioMoveDown;
var imageAdd, imageRemove, imageMoveUp, imageMoveDown;

var audioFiles, imageFiles, create_video, edit_settings;

function load_config() {
    // ffmpeg path
    ffmpeg_path = config.readSetting('ffmpeg_path') || '/usr/bin/ffmpeg';

    // default video output folder
}

function makeOption(filePath) {
    var option = document.createElement('option');
    option.text = path.basename(filePath);
    option.value = filePath.toString();
    return option;
}

function updateSummary(summary_id, message) {
    var summary = document.getElementById(summary_id);
    $(summary).text(message);
}

function showStatus(message) {
    updateSummary('status-message', message);
}

function clearStatus() {
    updateSummary('status-message', '');
}

function addFiles(file_list_id, file_types, summary_id) {
    var file_list = document.getElementById(file_list_id);
    dialog.showOpenDialog(
        {
            filters: file_types,
            properties: ['openFile', 'multiSelections']
        },
        function (filePaths) {
            if (filePaths != undefined) {
                for (let filePath of filePaths) {
                    file_list.appendChild(makeOption(filePath));
                }
            }
            updateSummary(summary_id, file_list.options.length + " files selected");
        }
    );
}

function moveFiles(file_list_id, direction) {
    var file_list = document.getElementById(file_list_id);
    if (file_list.options.length == 0) {
        alert("Nothing to move");
        return;
    }
    var selectedFiles = file_list.selectedOptions;
    if (selectedFiles.length == 0) {
        alert("Select a file to move");
        return;
    }
    if (selectedFiles.length > 1) {
        alert("Cannot move multiple files");
        return;
    }
    var selectedFile = selectedFiles[0];
    console.log(selectedFile);

    var sibiling = direction == "up"
        ? $(selectedFile).prev()
        : $(selectedFile).next();

    if (sibiling.length > 0) {
        $(selectedFile).detach();
        if (direction == "up") {
            $(sibiling).before(selectedFile);
        }
        else {
            $(sibiling).after(selectedFile);
        }
    }

}

function removeFiles(file_list_id, summary_id) {
    var file_list = document.getElementById(file_list_id);
    if (file_list.options.length == 0) {
        alert("Nothing to remove");
        return;
    }

    var selectedFiles = file_list.selectedOptions;
    if (selectedFiles.length == 0) {
        alert("Select a file to remove");
        return;
    }
    for (const file of selectedFiles) {
        file_list.remove(file);
    }
    updateSummary(summary_id, file_list.options.length + " files selected");
}

function handleAudioAdd() {
    var filters = [
        {
            name: 'Audio files',
            extensions: ['mp3', 'wav']
        }
    ];
    addFiles('audio-files', filters, "audio-summary");
}

function handleAudioRemove() {
    removeFiles('audio-files', "audio-summary");
}

function handleAudioMoveUp() {
    moveFiles('audio-files', 'up');
}

function handleAudioMoveDown() {
    moveFiles('audio-files', 'down');
}

function handleImageAdd() {
    var filters = [
        {
            name: 'Image files',
            extensions: ['jpg', 'jpeg', 'png']
        }
    ];
    addFiles('image-files', filters, "image-summary");
}

function handleImageRemove() {
    removeFiles('image-files', "image-summary");
}

function handleImageMoveUp() {
    moveFiles('image-files', 'up');
}

function handleImageMoveDown() {
    moveFiles('image-files', 'down');
}

function initializeAudioFileChooser(name) {
    // audio file chooser
    audioAdd = document.getElementById(name + '-add');
    audioAdd.addEventListener('click', handleAudioAdd);

    audioRemove = document.getElementById(name +'-remove');
    audioRemove.addEventListener('click', handleAudioRemove);

    audioMoveUp = document.getElementById(name + '-move-up');
    audioMoveUp.addEventListener('click', handleAudioMoveUp);

    audioMoveDown = document.getElementById(name + '-move-down');
    audioMoveDown.addEventListener('click', handleAudioMoveDown);

    return document.getElementById(name + '-files');
}

function initializeImageFileChooser(name) {
    // image file chooser
    imageAdd = document.getElementById(name + '-add');
    imageAdd.addEventListener('click', handleImageAdd);

    imageRemove = document.getElementById(name +'-remove');
    imageRemove.addEventListener('click', handleImageRemove);

    imageMoveUp = document.getElementById(name + '-move-up');
    imageMoveUp.addEventListener('click', handleImageMoveUp);

    imageMoveDown = document.getElementById(name + '-move-down');
    imageMoveDown.addEventListener('click', handleImageMoveDown);

    return document.getElementById(name + '-files');
}

function get_files(file_list) {
    let files = Array();
    for (const option of file_list.options) {
        console.log(option);
        files.push(option.value);
    }
    console.log(files);
    return files;
}

function get_video_output_name() {
    return dialog.showSaveDialog(
        {
            title: "Select video file location",
            filters: [
                {
                    name: "Video files",
                    extensions: ["mp4"]
                }
            ],
            defaultPath: config.readSetting('video_output_folder')
        }
    );
}

const flatten = arr => arr.reduce(
  (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
);

function build_command_args(audios, images, video_out) {
    console.log("-- build_command: " + audios);
    return flatten(
        [
            '-y',
            '-loop', '1',
            images.map((x) => {return ["-i", x];}),
            audios.map((x) => {return ["-i", x];}),
            '-c:v', 'libx264',
            '-c:a', 'libvo_aacenc',
            '-b:a', '192k',
            '-shortest',
            video_out
        ]
    );
}

const spawn = require('child_process').spawn;

function run_command(cmd, args, output) {
    console.log(cmd + ' ' + args);

    const child = spawn(cmd, args);

    console.log('-- started child process --');

    child.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    })

    child.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
        showStatus("there was an error creating the video.");
    })

    child.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        showStatus("Successfully created video at: " + output);
    })
}

function handleCreateVideo() {
    clearStatus();

    // gather audio files
    const audios = get_files(audioFiles);
    const images = get_files(imageFiles);

    if (audios.length == 0 || images.length == 0) {
        alert('Choose one audio file and one image file.');
        return;
    }
    const video_output = get_video_output_name();

    var command_args = build_command_args(audios, images, video_output);

    showStatus("Creating video ...");
    load_config();
    run_command(ffmpeg_path, command_args, video_output);
}

function initializeCreateVideo(name) {
    const create_button = document.getElementById(name);
    create_button.addEventListener('click', handleCreateVideo);
}

function handleEditSettings() {
    console.log('sending: open-settings-window event...');
    ipcRenderer.send('open-settings-window');
}

function initializeEditSettings(name) {
    const edit_settings_button = document.getElementById(name);
    edit_settings_button.addEventListener('click', handleEditSettings);
}

onload = function() {
    console.log("ui.onload -- begin");

    // set configuration
    load_config();

    // audio file chooser
    audioFiles = initializeAudioFileChooser('audio');

    // image file chooser
    imageFiles = initializeImageFileChooser('image');

    // create video button
    create_video = initializeCreateVideo('create-video');

    // edit settings button
    edit_settings = initializeEditSettings('edit-settings');

    console.log("ui.onload -- end");
};
