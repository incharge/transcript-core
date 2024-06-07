import { TranscriptWord } from "./types";
export declare function htmlEncode(input: string): string;
export declare function wordBackgroundColor(word: TranscriptWord, isCurrent?: boolean): string;
export declare function secondsToHms(time: number | undefined): string;
