/*
 * Author(s)  : Chen Song
 * Description: This file contains the our email settings (mailbox, password, template...)
 * Last Update: July 24, 2017
*/

////////////////////////////////////////////////////////
// External dependencies
// 1. pug -- to render body
var pug = require('pug');
// 2. path
var path = require('path');

var ourAddress = '8888 University Dr, Burnaby, BC V5A 1S6';
var ourName = 'SFU CSIL Room Service (Group 19)';

function generateBody(receiverName, text) {
    var fn = pug.compileFile(path.join(__dirname, 'template.pug'));
    return fn({
        receiverName: receiverName,
        text: text,
        ourName: ourName,
        ourAddress
    });
}

function generateSubject(subject) {
    return '[CSIL] ' + subject;
}

module.exports = {
    service: 'Gmail',
    address: 'csilroombooking@gmail.com',
    password: 'csilcsilcsil123',
    name: ourName,
    generateSubject: generateSubject,
    generateBody: generateBody
};
