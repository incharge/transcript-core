/**
 * name: @incharge/transcript-core
 * description: Work in progress - Core types and classes for transcripts
 * author: Julian Price, inCharge Ltd, UK
 * repository: git+https://github.com/incharge/transcript-core
 */
"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
function htmlEncode(input) {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function wordBackgroundColor(word, isCurrent = false) {
  let confidence = word.confidence || 0.99;
  if (isCurrent) {
    return "#FFFF33";
  } else if (word.filler === true) {
    return "#cccccc";
  } else if (word.start_time === void 0 || confidence > 0.99) {
    return "";
  } else {
    const minimumColor = 99;
    confidence = Math.floor(confidence * (256 - minimumColor)) + minimumColor;
    const color = (confidence < 16 ? "0" : "") + confidence.toString(16);
    return "#FF" + color + color;
  }
}
function secondsToHms(time) {
  let from;
  if (time == void 0) {
    return "";
  }
  if (time < 60 * 60) {
    from = 14;
  } else if (time < 60 * 60 * 10) {
    from = 12;
  } else {
    from = 11;
  }
  return new Date(Math.floor(time) * 1e3).toISOString().substring(from, 19);
}
const fs = {};
function isAwsTranscript(arg) {
  return "accountId" in arg;
}
function validateProperties(o, properties) {
  let message = "";
  if (typeof o != "object") {
    message = "Not an object";
  } else {
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
  return void 0;
}
function validateAwsTranscriptItem(awsTranscriptItem, isFirst = false) {
  let validationResult = validateProperties(awsTranscriptItem, ["type", "alternatives", "speaker_label"]);
  if (validationResult) {
    validationResult.message = "Invalid AwsTranscriptItem: " + validationResult.message;
  } else {
    let message = "";
    if (awsTranscriptItem.alternatives.length == 0) {
      message = "Alternatives list is empty";
    } else if (!awsTranscriptItem.alternatives[0].content) {
      message = "Content property is missing";
    } else if (awsTranscriptItem.alternatives[0].content.length == 0) {
      message = "Content property is empty";
    } else if (awsTranscriptItem.type == "punctuation") {
      if (isFirst) {
        message = "Punctuation at the start of a sentence";
      } else {
        if (awsTranscriptItem.start_time != void 0) {
          console.log(`WARNING: Punctuation has a start time: ${awsTranscriptItem.start_time}`);
        }
        if (awsTranscriptItem.end_time != void 0) {
          console.log(`WARNING: Punctuation has an end_time time: ${awsTranscriptItem.end_time}`);
        }
        if (!awsTranscriptItem.alternatives[0].confidence) {
          console.log(`UNEXPECTED: Punctuation has no confidence property`);
        } else if (parseFloat(awsTranscriptItem.alternatives[0].confidence) != 0) {
          console.log(`UNEXPECTED: Punctuation has non-zero confidence: ${awsTranscriptItem.alternatives[0].confidence}`);
        }
      }
    } else if (awsTranscriptItem.type == "pronunciation") {
      if (awsTranscriptItem.start_time == void 0) {
        message = "Pronunciation has no start time";
      } else if (awsTranscriptItem.end_time == void 0) {
        message = "Pronunciation has no end time";
      }
      if (!awsTranscriptItem.alternatives[0].confidence) {
        console.log(`WARNING: Pronunciation has no confidence property`);
      } else if (parseFloat(awsTranscriptItem.alternatives[0].confidence) == 0) {
        console.log(`WARNING: Pronunciation has zero confidence: `);
      }
    } else {
      message = `Unexpected item type: ${awsTranscriptItem.type}`;
    }
    if (message.length != 0) {
      validationResult = new Error(message);
    }
  }
  return validationResult;
}
function validateAwsTranscript(awsTranscript) {
  let validationResult;
  validationResult = validateProperties(awsTranscript, ["results"]);
  if (validationResult) {
    validationResult.message = "Invalid schema: " + validationResult.message;
    return validationResult;
  }
  validationResult = validateProperties(awsTranscript.results, ["items"]);
  if (validationResult) {
    validationResult.message = "Invalid schema of 'result': " + validationResult.message;
    return validationResult;
  }
  if (awsTranscript.results.items.length == 0) {
    return Error("Transcript contains no words");
  }
  return void 0;
}
function isLowerCase(word) {
  const letter = word.charAt(0);
  return letter == letter.toLowerCase() && letter != letter.toUpperCase();
}
function awsToIcLines(awsTranscript) {
  const fillerWords = ["um", "uh", "mhm"];
  let validationResult;
  validationResult = validateAwsTranscript(awsTranscript);
  if (validationResult) {
    return validationResult;
  }
  const awsItems = awsTranscript.results.items;
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
    } else {
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
    icCurrentWord.content = awsCurrentItem.alternatives[0].content;
    if (awsCurrentItem.type == "pronunciation") {
      icCurrentWord.confidence = awsCurrentItem.alternatives[0].confidence ? parseFloat(awsCurrentItem.alternatives[0].confidence) : 0.999;
      icCurrentWord.start_time = parseFloat(awsCurrentItem.start_time);
      icCurrentWord.end_time = parseFloat(awsCurrentItem.end_time);
      if (fillerWords.includes(icCurrentWord.content.toLowerCase())) {
        icCurrentWord.filler = true;
      } else {
        if (isSentenceStart && isLowerCase(icCurrentWord.content)) {
          icCurrentWord.content = icCurrentWord.content;
          icCurrentWord.capitalize = true;
        }
        isSentenceStart = false;
        isAfterPunctuation = false;
      }
    } else {
      delete icCurrentWord["start_time"];
      delete icCurrentWord["end_time"];
      if (isAfterPunctuation) {
        icCurrentWord.filler = true;
      }
      isAfterPunctuation = true;
      if ([".", "?", "!"].includes(icCurrentWord.content)) {
        isSentenceStart = true;
      }
    }
    icWords.push(icCurrentWord);
    if (currentSpeakerIndex != nextSpeakerIndex) {
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
function icTranscriptToTextLines(transcript, isFiller = true) {
  const textLines = [];
  const icLines = transcript.lines;
  for (let icLineNo = 0; icLineNo < icLines.length; icLineNo++) {
    const icLine = icLines[icLineNo];
    const icWords = icLine.words;
    let textWords = "";
    for (let icWordNo = 0; icWordNo < icWords.length; icWordNo++) {
      const icWord = icWords[icWordNo];
      if (isFiller || icWord.filler === void 0) {
        textWords += (textWords.length > 0 && icWord.start_time ? " " : "") + (icWord.capitalize === void 0 ? icWord.content : icWord.content.toUpperCase());
      }
    }
    textLines.push({
      start_time: secondsToHms(icWords[0].start_time),
      speaker: transcript.speakers[icLine.speaker],
      words: textWords
    });
  }
  return textLines;
}
function icStringToTextLines(transcript) {
  let icTranscript;
  let icTextLines;
  try {
    icTranscript = JSON.parse(transcript);
    icTextLines = icTranscriptToTextLines(icTranscript);
  } catch (e) {
    icTextLines = Error(e.message);
  }
  return icTextLines;
}
async function icFileToTextLines(inFile) {
  let icTextLines;
  try {
    icTextLines = icStringToTextLines(await fs.readFile(inFile, "utf-8"));
  } catch (e) {
    icTextLines = Error(e.message);
  }
  return icTextLines;
}
function secondsToVttTime(time) {
  return new Date(time * 1e3).toISOString().substring(11, 23);
}
function icToVtt(transcript, isFiller = true) {
  let vtt = "WEBVTT\n\n";
  const wordLimit = 5;
  const icLines = transcript.lines;
  let lineCount = 1;
  let start_time = 0;
  let end_time = 0;
  for (let icLineNo = 0; icLineNo < icLines.length; icLineNo++) {
    const icLine = icLines[icLineNo];
    const icWords = icLine.words;
    let textWords = "";
    let wordCount = 0;
    for (let icWordNo = 0; icWordNo < icWords.length; icWordNo++) {
      const icWord = icWords[icWordNo];
      if (isFiller || icWord.filler === void 0) {
        textWords += (textWords.length > 0 && icWord.start_time ? " " : "") + (icWord.capitalize === void 0 ? icWord.content : icWord.content.toUpperCase());
        if (icWord.start_time) {
          if (wordCount == 0) {
            start_time = icWord.start_time;
          }
          end_time = icWord.end_time;
          wordCount++;
        }
      }
      if (icWordNo == icWords.length - 1 || wordCount >= wordLimit && icWordNo < icWords.length - 1 && icWords[icWordNo + 1].start_time) {
        vtt += String(lineCount) + "\n" + secondsToVttTime(start_time) + " --> " + secondsToVttTime(end_time) + "\n" + textWords + "\n\n";
        textWords = "";
        wordCount = 0;
        lineCount++;
      }
    }
  }
  return vtt;
}
exports.awsToIcLines = awsToIcLines;
exports.htmlEncode = htmlEncode;
exports.icFileToTextLines = icFileToTextLines;
exports.icStringToTextLines = icStringToTextLines;
exports.icToVtt = icToVtt;
exports.icTranscriptToTextLines = icTranscriptToTextLines;
exports.isAwsTranscript = isAwsTranscript;
exports.secondsToHms = secondsToHms;
exports.wordBackgroundColor = wordBackgroundColor;
