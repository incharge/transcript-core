import { TranscriptSchema } from '@incharge/transcript-core';

export declare function secondsToVttTime(time: number): string;
export declare function icToVtt(transcript: TranscriptSchema, isFiller?: boolean): string;
