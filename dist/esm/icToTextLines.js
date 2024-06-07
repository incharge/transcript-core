var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// import * as fs from 'fs';
import fs from 'node:fs/promises';
import { secondsToHms } from "./utilities";
// Given an ic transcript, return an aray of TranscriptTextLine
export function icTranscriptToTextLines(transcript, isFiller = true) {
    const textLines = [];
    const icLines = transcript.lines;
    for (let icLineNo = 0; icLineNo < icLines.length; icLineNo++) {
        const icLine = icLines[icLineNo];
        const icWords = icLine.words;
        let textWords = "";
        for (let icWordNo = 0; icWordNo < icWords.length; icWordNo++) {
            const icWord = icWords[icWordNo];
            if (isFiller || icWord.filler === undefined) {
                textWords += (textWords.length > 0 && icWord.start_time ? " " : '')
                    + (icWord.capitalize === undefined ? icWord.content : icWord.content.toUpperCase());
            }
        }
        ;
        textLines.push({
            start_time: secondsToHms(icWords[0].start_time),
            speaker: transcript.speakers[icLine.speaker],
            words: textWords
        });
    }
    return textLines;
}
export function icStringToTextLines(transcript) {
    let icTranscript;
    let icTextLines;
    try {
        icTranscript = JSON.parse(transcript);
        icTextLines = icTranscriptToTextLines(icTranscript);
    }
    catch (e) {
        icTextLines = Error(e.message);
    }
    return icTextLines;
}
// : Array<TranscriptTextLine> | Error
export function icFileToTextLines(inFile) {
    return __awaiter(this, void 0, void 0, function* () {
        let icTextLines;
        try {
            icTextLines = icStringToTextLines(yield fs.readFile(inFile, 'utf-8'));
        }
        catch (e) {
            icTextLines = Error(e.message);
        }
        return icTextLines;
    });
}
//# sourceMappingURL=icToTextLines.js.map