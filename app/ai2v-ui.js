'use strict';

const {remote} = require('electron');
const {dialog} = remote;
const path = require('path');

var audioAdd, audioRemove, audioMoveUp, audioMoveDown;

var audioFiles;

function makeOption(filePath) {
    var option = document.createElement('option');
    option.text = path.basename(filePath);
    option.value = filePath.toString();
    return option;
}

function updateAudioListSummary() {
    var summary = document.getElementById("audio-summary");
    $(summary).text(audioFiles.options.length + " files selected");
}

function handleAudioAdd() {
    dialog.showOpenDialog(
        {
            filters: [
                {
                    name: 'Audio files',
                    extensions: ['mp3', 'wav']
                }
            ],
            properties: ['openFile', 'multiSelections']
        },
        function (filePaths) {
            console.log(filePaths);
            // add chosen files to the file-list
            for (let filePath of filePaths) {
                console.log("-- add: " + filePath.toString());
                audioFiles.appendChild(makeOption(filePath));
            }
            updateAudioListSummary();
        }
    )
}

function handleAudioRemove() {
    console.log("-- audio remove --");
    console.log("list size = " + audioFiles.options.length);
    if (audioFiles.options.length == 0) {
        alert("Nothing to remove");
        return;
    }

    var selectedFiles = audioFiles.selectedOptions;
    if (selectedFiles.length == 0) {
        alert("Select a file to remove");
        return;
    }
    for (const file of selectedFiles) {
        console.log("-- removing: " + file);
        audioFiles.remove(file);
    }
    updateAudioListSummary();
}

function handleAudioMoveUp() {
    if (audioFiles.options.length == 0) {
        alert("Nothing to move");
        return;
    }
    var selectedFiles = audioFiles.selectedOptions;
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
    var previousSibiling = $(selectedFile).prev();
    console.log("previous: " + previousSibiling + "; size = " + previousSibiling.length);
    if (previousSibiling.length > 0) {
        $(selectedFile).detach();
        $(previousSibiling).before(selectedFile);
    }
}

function handleAudioMoveDown() {
    if (audioFiles.options.length == 0) {
        alert("Nothing to move");
        return;
    }
    var selectedFiles = audioFiles.selectedOptions;
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
    var nextSibiling = $(selectedFile).next();
    console.log("next: " + nextSibiling + "; size = " + nextSibiling.length);
    if (nextSibiling.length > 0) {
        $(selectedFile).detach();
        $(nextSibiling).after(selectedFile);
    }
}

onload = function() {
    console.log("ui.onload -- begin");
    audioAdd = document.getElementById('audio-add');
    audioRemove = document.getElementById('audio-remove');
    audioMoveUp = document.getElementById('audio-move-up');
    audioMoveDown = document.getElementById('audio-move-down');

    audioAdd.addEventListener('click', handleAudioAdd);
    audioRemove.addEventListener('click', handleAudioRemove);
    audioMoveUp.addEventListener('click', handleAudioMoveUp);
    audioMoveDown.addEventListener('click', handleAudioMoveDown);

    audioFiles = document.getElementById('audio-files');

    // disable all buttons except add buttons to begin with
    // audioRemove.disable();
    // audioMoveUp.disable();
    // audioMoveDown.disable();

    console.log("ui.onload -- end");
};
