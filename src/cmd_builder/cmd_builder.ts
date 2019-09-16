'use strict';

import CscopeCmdGenerator from './CscopeCmdGenerator';
import CmdGenInterface from './CmdGenInterface';

function _build() : CmdGenInterface {
    return new CscopeCmdGenerator;
}

module.exports = {
    build : _build
}