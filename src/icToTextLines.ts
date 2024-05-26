// import * as fs from 'fs';
import fs from 'node:fs/promises';
import { TranscriptSchema, TranscriptLine, TranscriptWord, TranscriptTextLine } from "./types"
import { secondsToHms } from "./utilities"

// Given an ic transcript, return an aray of TranscriptTextLine
export function icTranscriptToTextLines(transcript: TranscriptSchema, isFiller: boolean = true): Array<TranscriptTextLine> {
    const textLines: Array<TranscriptTextLine> = [];

    const icLines = transcript.lines;
    for (let icLineNo = 0; icLineNo < icLines.length; icLineNo++) {
        const icLine: TranscriptLine = icLines[icLineNo];
        const icWords = icLine.words;
        let textWords: string = "";
        for (let icWordNo = 0; icWordNo < icWords.length; icWordNo++) {
            const icWord: TranscriptWord = icWords[icWordNo];
            if (isFiller || icWord.filler === undefined) {
              textWords += (textWords.length > 0 && icWord.start_time ? " " : '')
                + (icWord.capitalize === undefined ? icWord.content: icWord.content.toUpperCase() );
            }
        };
        textLines.push({
            start_time: secondsToHms(icWords[0].start_time),
            speaker: transcript.speakers[icLine.speaker],
            words: textWords
        });
    }
    return textLines;
}

export function icStringToTextLines(transcript: string): Array<TranscriptTextLine> | Error {
    let icTranscript: TranscriptSchema;
    let icTextLines: Array<TranscriptTextLine> | Error;
    try {
        icTranscript = JSON.parse(transcript);
        icTextLines = icTranscriptToTextLines(icTranscript);
    }
    catch (e: any) {
        icTextLines = Error(e.message);
    }
    return icTextLines;
}

// : Array<TranscriptTextLine> | Error
export async function icFileToTextLines(inFile: string) {
    let icTextLines: Array<TranscriptTextLine> | Error;
    try {
        icTextLines = icStringToTextLines(await fs.readFile(inFile, 'utf-8'));
    }
    catch (e: any) {
        icTextLines = Error(e.message);
    }
    return icTextLines;
}
