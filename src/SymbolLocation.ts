'use strict';

export default class SymbolLocation {
    fileName  : string;
    lineNum   : number;
    colStart  : number;
    colEnd    : number;
    otherText : string;

    constructor(fileName:string, lineNum:number, colStart:number, colEnd:number, otherText:string){
        this.fileName = fileName;
        this.lineNum  = lineNum;
        this.colStart = colStart;
        this.colEnd   = colEnd;
        this.otherText   = otherText;
    }
}    