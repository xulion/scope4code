'use strict';

import {os_constants} from "../scope4code_def";

module.exports = {
    constants : os_constants,
    run_command : jest.fn(),
    current_os : jest.fn()
}