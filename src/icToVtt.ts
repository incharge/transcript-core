import { type TranscriptSchema, type TranscriptLine, type TranscriptWord } from "@incharge/transcript-core"

export function secondsToVttTime(time: number): string {
    //return new Date(Math.floor(time) * 1000).toISOString().substring(14, 19);
    return new Date(time * 1000).toISOString().substring(11, 23);
}

// Given an ic transcript, return a vtt
export function icToVtt(transcript: TranscriptSchema, isFiller: boolean = true): string {
    let vtt: string = 'WEBVTT\n\n';
    const wordLimit: number = 5;
    const icLines = transcript.lines;
    let lineCount: number = 1;
    let start_time: number = 0;
    let end_time: number = 0;
    for (let icLineNo = 0; icLineNo < icLines.length; icLineNo++) {
        const icLine: TranscriptLine = icLines[icLineNo];
        const icWords = icLine.words;
        let textWords: string = "";
        let wordCount: number = 0;
        for (let icWordNo = 0; icWordNo < icWords.length; icWordNo++) {
            const icWord: TranscriptWord = icWords[icWordNo];
            if (isFiller || icWord.filler === undefined) {
                textWords += (textWords.length > 0 && icWord.start_time ? ' ' : '')
                    + (icWord.capitalize === undefined ? icWord.content: icWord.content.toUpperCase() );
                if (icWord.start_time) {
                    if (wordCount == 0) {
                        start_time = icWord.start_time;
                    }
                    end_time = icWord.end_time;
                    wordCount++;
                }
            }
            if (icWordNo == icWords.length-1
                || (wordCount >= wordLimit && icWordNo < icWords.length-1 && icWords[icWordNo+1].start_time ) ) {
                vtt += String(lineCount) + '\n'
                    + secondsToVttTime(start_time) + ' --> ' + secondsToVttTime(end_time) + '\n'
                    + textWords + '\n\n';
                textWords = '';
                wordCount = 0;
                lineCount++;
            }
        };
        // We also have:
        // speaker: transcript.speakers[icLine.speaker],
    }
    return vtt;
}
