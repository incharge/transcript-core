import { TranscriptLine } from './types';

interface AwsTranscriptAlternative {
    confidence: string;
    content: string;
}
interface AwsTranscriptItem {
    type: string;
    alternatives: Array<AwsTranscriptAlternative>;
    end_time: string;
    start_time: string;
    speaker_label: string;
}
interface AwsResults {
    items: Array<AwsTranscriptItem>;
}
export interface AwsTranscript {
    results: AwsResults;
}
export declare function isAwsTranscript(arg: any): arg is AwsTranscript;
export declare function awsToIcLines(awsTranscript: AwsTranscript): Array<TranscriptLine> | Error;
export declare function awsStringToIcLines(transcript: string): Array<TranscriptLine> | Error;
export declare function awsFileToIcLines(inFile: string): Promise<TranscriptLine[] | Error>;
export {};
