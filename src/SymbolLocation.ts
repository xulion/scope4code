'use strict';

export default class SymbolLocation {
    fileName : string;
    lineNum  : number;
    colStart : number;
    colEnd   : number;

    constructor(fileName:string, lineNum:number, colStart:number, colEnd:number){
        this.fileName = fileName;
        this.lineNum  = lineNum;
        this.colStart = colStart;
        this.colEnd   = colEnd;
    }
}    