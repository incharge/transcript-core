// interface TranscriptAlternative {
//   confidence: number;
//   content: string;
// }

export interface TranscriptWord {
    //alternatives: Array<TranscriptAlternative>
    confidence?: number;
    content: string;
    end_time: number; // ?
    start_time: number; // ?
  }
  
  export interface TranscriptLine {
    speaker: number;
    words: Array<TranscriptWord>;
  }
  
  export interface TranscriptSchema {
    url: string;
    speakers: Array<string>;
    lines: Array<TranscriptLine>;
  }

  export interface TranscriptTextLine {
    start_time: string | undefined;
    speaker: string;
    words: string;
}