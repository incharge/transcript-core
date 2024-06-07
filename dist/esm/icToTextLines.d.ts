import { TranscriptSchema, TranscriptTextLine } from "./types";
export declare function icTranscriptToTextLines(transcript: TranscriptSchema, isFiller?: boolean): Array<TranscriptTextLine>;
export declare function icStringToTextLines(transcript: string): Array<TranscriptTextLine> | Error;
export declare function icFileToTextLines(inFile: string): Promise<Error | TranscriptTextLine[]>;
