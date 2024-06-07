var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from 'node:fs/promises';
// User Defined Type Guard for AwsTranscript
// See https://medium.com/@djoepramono/how-to-validate-javascript-object-better-with-typescript-e43314d97f9c
export function isAwsTranscript(arg) {
    return "accountId" in arg;
}
// Check that the object has all the required properties.
// Note: Any additional properties are quietly ignored, so there's no reason to check for them.
// Optional parametera must be checked in the code, so there's no reason to check them either.
function validateProperties(o, properties) {
    let message = "";
    if (typeof o != "object") {
        message = "Not an object";
    }
    else {
        properties.forEach((property) => {
            if (!(property in o)) {
                message += (message.length ? ", " : "") + property;
            }
        });
        if (message.length) {
            message = "Missing properties: " + message;
        }
    }
    if (message.length) {
        return new Error(message);
    }
    return undefined;
}
function validateAwsTranscriptItem(awsTranscriptItem, isFirst = false) {
    let validationResult = validateProperties(awsTranscriptItem, ['type', 'alternatives', 'speaker_label']);
    if (validationResult) {
        validationResult.message = "Invalid AwsTranscriptItem: " + validationResult.message;
    }
    else {
        let message = "";
        if (awsTranscriptItem.alternatives.length == 0) {
            message = "Alternatives list is empty";
        }
        else if (!awsTranscriptItem.alternatives[0].content) {
            message = "Content property is missing";
        }
        else if (awsTranscriptItem.alternatives[0].content.length == 0) {
            message = "Content property is empty";
        }
        //let content = awsTranscriptItem.alternatives[0].content;
        else if (awsTranscriptItem.type == "punctuation") {
            if (isFirst) {
                message = "Punctuation at the start of a sentence";
            }
            else {
                if (awsTranscriptItem.start_time != undefined) {
                    console.log(`WARNING: Punctuation has a start time: ${awsTranscriptItem.start_time}`);
                }
                if (awsTranscriptItem.end_time != undefined) {
                    console.log(`WARNING: Punctuation has an end_time time: ${awsTranscriptItem.end_time}`);
                }
                if (!awsTranscriptItem.alternatives[0].confidence) {
                    console.log(`UNEXPECTED: Punctuation has no confidence property`);
                }
                else if (parseFloat(awsTranscriptItem.alternatives[0].confidence) != 0) {
                    console.log(`UNEXPECTED: Punctuation has non-zero confidence: ${awsTranscriptItem.alternatives[0].confidence}`);
                }
            }
        }
        else if (awsTranscriptItem.type == "pronunciation") {
            if (awsTranscriptItem.start_time == undefined) {
                message = "Pronunciation has no start time";
            }
            else if (awsTranscriptItem.end_time == undefined) {
                message = "Pronunciation has no end time";
            }
            if (!awsTranscriptItem.alternatives[0].confidence) {
                console.log(`WARNING: Pronunciation has no confidence property`);
            }
            else if (parseFloat(awsTranscriptItem.alternatives[0].confidence) == 0) {
                console.log(`WARNING: Pronunciation has zero confidence: `);
            }
        }
        else {
            message = `Unexpected item type: ${awsTranscriptItem.type}`;
        }
        if (message.length != 0) {
            validationResult = new Error(message);
        }
    }
    return validationResult;
}
// ToDo: Check property types. e.g. that the expected arrays are in fact arrays etc
// Currently they are checked for presence, but not type
function validateAwsTranscript(awsTranscript) {
    let validationResult;
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
function isLowerCase(word) {
    const letter = word.charAt(0);
    return letter == letter.toLowerCase() && letter != letter.toUpperCase();
}
export function awsToIcLines(awsTranscript) {
    const fillerWords = ["um", "uh", "mhm"];
    let validationResult;
    validationResult = validateAwsTranscript(awsTranscript);
    if (validationResult) {
        return validationResult;
    }
    const awsItems = awsTranscript.results.items;
    // Loop through the words, converting them from aws to ic schema
    // When the speaker changes, add the words to the output as a line
    const iclines = [];
    let icWords = [];
    let currentSpeakerIndex;
    let awsCurrentItem;
    let icCurrentWord;
    let awsNextItem = awsItems[0];
    validationResult = validateAwsTranscriptItem(awsNextItem, true);
    if (validationResult) {
        return validationResult;
    }
    let nextSpeakerIndex = parseInt(awsNextItem.speaker_label.substring(4));
    let awsItemIndex = 0;
    let isAfterPunctuation = true;
    let isSentenceStart = true;
    do {
        awsCurrentItem = awsNextItem;
        icCurrentWord = { content: "", end_time: 0, start_time: 0 };
        currentSpeakerIndex = nextSpeakerIndex;
        if (awsItemIndex == awsItems.length - 1) {
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
                console.log("WARNING: Two punctuations in a row.");
            }
        }
        // Copy the required properties from awsCurrentItem to icCurrentWord
        icCurrentWord.content = awsCurrentItem.alternatives[0].content;
        if (awsCurrentItem.type == "pronunciation") {
            icCurrentWord.confidence = awsCurrentItem.alternatives[0].confidence ? parseFloat(awsCurrentItem.alternatives[0].confidence) : 0.999;
            icCurrentWord.start_time = parseFloat(awsCurrentItem.start_time);
            icCurrentWord.end_time = parseFloat(awsCurrentItem.end_time);
            if (fillerWords.includes(icCurrentWord.content.toLowerCase())) {
                // Mark this as a filler word
                icCurrentWord.filler = true;
            }
            else {
                if (isSentenceStart && isLowerCase(icCurrentWord.content)) {
                    icCurrentWord.content = icCurrentWord.content;
                    icCurrentWord.capitalize = true;
                }
                isSentenceStart = false;
                isAfterPunctuation = false;
            }
        }
        else {
            // TODO start_time and end_time are optional
            // @ts-ignore
            delete icCurrentWord['start_time'];
            // @ts-ignore
            delete icCurrentWord['end_time'];
            if (isAfterPunctuation) {
                // If filler words are being removed, then so should this punctuation
                // because there have been no non-filler words since the last punctuation,
                icCurrentWord.filler = true;
            }
            isAfterPunctuation = true;
            if (['.', '?', '!'].includes(icCurrentWord.content)) {
                isSentenceStart = true;
            }
        }
        // Add the word to the array
        icWords.push(icCurrentWord);
        if (currentSpeakerIndex != nextSpeakerIndex) {
            // Add the accumulated words to the output
            iclines.push({
                speaker: currentSpeakerIndex,
                words: icWords
            });
            icWords = [];
        }
        awsItemIndex++;
    } while (nextSpeakerIndex != -1);
    return iclines;
}
export function awsStringToIcLines(transcript) {
    let icTextLines;
    try {
        const awsTranscript = JSON.parse(transcript);
        icTextLines = awsToIcLines(awsTranscript);
    }
    catch (e) {
        icTextLines = Error(e.message);
    }
    return icTextLines;
}
// : Array<TranscriptTextLine> | Error
export function awsFileToIcLines(inFile) {
    return __awaiter(this, void 0, void 0, function* () {
        let icTextLines;
        try {
            icTextLines = awsStringToIcLines(yield fs.readFile(inFile, 'utf-8'));
        }
        catch (e) {
            icTextLines = Error(e.message);
        }
        return icTextLines;
    });
}
//# sourceMappingURL=awsToIcLines.js.map