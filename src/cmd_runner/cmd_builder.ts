'use strict';

const CscopeCmdGenerator = require('./CscopeCmdGenerator');

function _build() {
    return new CscopeCmdGenerator;
}

module.exports = {
    build : _build
}