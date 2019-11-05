'use strict';

import CscopeCmdGenerator from './CscopeCmdGenerator';
import CmdGenInterface from './CmdGenInterface';
import CmdParser from "./CmdParser";

function _build(cscop_config : object) : CmdGenInterface {
    const cmd_parser = new CmdParser(cscop_config);
    return new CscopeCmdGenerator(cmd_parser.getCurrentCmds());
}

module.exports = {
    build : _build
}