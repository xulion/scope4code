'use strict';

export default interface OutputInterface {
    diagLog(diagInfo:string);
    errorToUser(errorMsg:string);
    notifyUser(msg:string);
    updateState(state:string);
};