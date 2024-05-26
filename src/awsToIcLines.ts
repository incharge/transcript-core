import fs from 'node:fs/promises';
import { TranscriptLine, TranscriptWord } from "./types"

interface AwsTranscriptAlternative {
    confidence: string;
    content: string;
  }
  interface AwsTranscriptItem {
      type: string;
      alternatives: Array<AwsTranscriptAlternative>
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
  
  // Check that the object has all the required properties.
  // Note: Any additional properties are quietly ignored, so there's no reason to check for them.
  // Optional parametera must be checked in the code, so there's no reason to check them either.
  function validateProperties(o: object, properties: Array<string>): Error | undefined {
      let message: string = "";
      if (typeof o != "object") {
          message = "Not an object";
      }
      else {
          properties.forEach( (property) => {
              if ( !(property in o) ) {
                  message += (message.length ? ", " : "") + property;
              }
          });
          if ( message.length ) {
              message = "Missing properties: " + message;
          }
      }
  
      if ( message.length ) {
          return new Error(message);
      }
      return undefined;
  }
  
  function validateAwsTranscriptItem(awsTranscriptItem: AwsTranscriptItem, isFirst: boolean = false): Error | undefined {
      let validationResult: Error | undefined = validateProperties(awsTranscriptItem, ['type', 'alternatives', 'speaker_label']);
      if (validationResult) {
          validationResult.message = "Invalid AwsTranscriptItem: " + validationResult.message;
      }
      else {
          let message: string = "";
  
          if ( awsTranscriptItem.alternatives.length == 0) {
              message = "Alternatives list is empty";
          }
          else if ( !awsTranscriptItem.alternatives[0].content ) {
              message = "Content property is missing";
          }
          else if (awsTranscriptItem.alternatives[0].content.length == 0) {
              message = "Content property is empty";
          }
          //let content = awsTranscriptItem.alternatives[0].content;
          else if (awsTranscriptItem.type == "punctuation") {
              if (isFirst) {
                  message = "Punctuation at the start of a sentence";
              } else {
                  if (awsTranscriptItem.start_time != undefined) {
                      console.log(`WARNING: Punctuation has a start time: ${awsTranscriptItem.start_time}`);
                  }
                  if (awsTranscriptItem.end_time != undefined) {
                      console.log(`WARNING: Punctuation has an end_time time: ${awsTranscriptItem.end_time}`);
                  }
                  if (!awsTranscriptItem.alternatives[0].confidence) {
                      console.log(`UNEXPECTED: Punctuation has no confidence property`);
                  }
                  else if (parseFloat(awsTranscriptItem.alternatives[0].confidence) != 0 ) {
                      console.log(`UNEXPECTED: Punctuation has non-zero confidence: ${awsTranscriptItem.alternatives[0].confidence}`);
                  }
              }
          }
          else if (awsTranscriptItem.type == "pronunciation") {
              if (awsTranscriptItem.start_time == undefined) {
                  message = "Pronunciation has no start time";
              } else if (awsTranscriptItem.end_time == undefined) {
                  message = "Pronunciation has no end time";
              }
  
              if ( !awsTranscriptItem.alternatives[0].confidence ) {
                  console.log(`WARNING: Pronunciation has no confidence property`);
              }
              else if (parseFloat(awsTranscriptItem.alternatives[0].confidence) == 0 ) {
                  console.log(`WARNING: Pronunciation has zero confidence: `);
              }
          } else {
              message = `Unexpected item type: ${awsTranscriptItem.type}`;
          }
  
          if ( message.length != 0) {
              validationResult = new Error(message)
          }
      }
  
      return validationResult;
  }
  
  // ToDo: Check property types. e.g. that the expected arrays are in fact arrays etc
  // Currently they are checked for presence, but not type
  function validateAwsTranscript(awsTranscript: AwsTranscript): Error | undefined {
      let validationResult: Error | undefined;
      
      validationResult = validateProperties(awsTranscript, ['results']);
      if (validationResult) {
          validationResult.message = "Invalid schema: " + validationResult.message;
          return validationResult;
      }
  
  
      validationResult = validateProperties(awsTranscript.results, ['items']);
      if (validationResult) {
          validationResult.message = "Invalid schema of 'result': " + validationResult.message;
          return validationResult;
      }
  
      if (awsTranscript.results.items.length == 0) {
          return Error("Transcript contains no words");
      }
  
      return undefined;
  }
  
  export function awsToIcLines(awsTranscript: AwsTranscript): Array<TranscriptLine> | Error {
      let validationResult: Error | undefined;
  
      validationResult = validateAwsTranscript(awsTranscript);
      if (validationResult) {
          return validationResult;
      }
  
      const awsItems = awsTranscript.results.items;
  
      // Loop through the words, converting them from aws to ic schema
      // When the speaker changes, add the words to the output as a line
      const iclines: Array<TranscriptLine> = [];
      let icWords: Array<TranscriptWord> = [];
      let currentSpeakerIndex: number;
      let awsCurrentItem: AwsTranscriptItem;
      let icCurrentWord: TranscriptWord;
  
      let awsNextItem: AwsTranscriptItem = awsItems[0];
      validationResult = validateAwsTranscriptItem(awsNextItem, true);
      if (validationResult) {
          return validationResult;
      }
  
      let nextSpeakerIndex: number = parseInt(awsNextItem.speaker_label.substring(4));
      let awsItemIndex: number = 0;
      do {
          awsCurrentItem = awsNextItem;
          icCurrentWord = { content: "", end_time: 0, start_time: 0};
          currentSpeakerIndex = nextSpeakerIndex;
          if ( awsItemIndex == awsItems.length-1 ) {
              nextSpeakerIndex = -1;
          }
          else {
              awsNextItem = awsItems[awsItemIndex + 1];
              validationResult = validateAwsTranscriptItem(awsNextItem);
              if (validationResult) {
                  return validationResult;
              }
              nextSpeakerIndex = parseInt(awsNextItem.speaker_label.substring(4));
  
              if (awsCurrentItem.type == "punctuation" && awsNextItem.type == "punctuation") {
                  console.log("WARNING: Two punctuations in a row.")
              }
          }
          
          // Copy the required properties from awsCurrentItem to icCurrentWord
          icCurrentWord.content = awsCurrentItem.alternatives[0].content;
          if (awsCurrentItem.type == "pronunciation") {
              icCurrentWord.confidence = awsCurrentItem.alternatives[0].confidence ? parseFloat(awsCurrentItem.alternatives[0].confidence) : 0.999;
              icCurrentWord.start_time = parseFloat(awsCurrentItem.start_time);
              icCurrentWord.end_time = parseFloat(awsCurrentItem.end_time);
          }
          else {
            // TODO start_time and end_time are optional
            // @ts-ignore
            delete icCurrentWord['start_time'];
            // @ts-ignore
            delete icCurrentWord['end_time'];
          }
  
          // Add the word to the array
          icWords.push(icCurrentWord);
  
          if ( currentSpeakerIndex != nextSpeakerIndex ) {
              // Add the accumulated words to the output
              iclines.push( {
                  speaker: currentSpeakerIndex,
                  words:  icWords
              });
              icWords = [];
          }
          awsItemIndex++;
      } while (nextSpeakerIndex != -1);
      return iclines;
  }
  
  export function awsStringToIcLines(transcript: string): Array<TranscriptLine> | Error {
    let icTextLines: Array<TranscriptLine> | Error;
    try {
        const awsTranscript: AwsTranscript = JSON.parse(transcript);
        icTextLines = awsToIcLines(awsTranscript);
    }
    catch (e: any) {
        icTextLines = Error(e.message);
    }
    return icTextLines;
}

// : Array<TranscriptTextLine> | Error
export async function awsFileToIcLines(inFile: string) {
    let icTextLines: Array<TranscriptLine> | Error;
    try {
        icTextLines = awsStringToIcLines(await fs.readFile(inFile, 'utf-8'));
    }
    catch (e: any) {
        icTextLines = Error(e.message);
    }
    return icTextLines;
}