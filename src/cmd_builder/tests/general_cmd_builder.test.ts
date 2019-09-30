'use strict';

import CmdGenInterface from '../CmdGenInterface';

describe('general cmd_builder test', () => {

    const utilities = require('../../util/utilities');
    jest.mock("../../util/utilities");
    jest.mock("../CscopeCmdGenerator");
    const cmd_builder = require('../cmd_builder');

    test('return cscope command builder if there is no config', async () => {
        let builder = cmd_builder.build();
    });
});