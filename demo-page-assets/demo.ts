// When developing this demo alongside transcript-core, import directly to avoid needing to build
// import { TranscriptSchema, TranscriptLine, TranscriptWord, TranscriptTextLine } from "../src/types";
// import { secondsToHms, wordBackgroundColor, htmlEncode } from "../src/utilities";
// import { isAwsTranscript, awsToIcLines } from "../src/awsToIcLines";
// import { icTranscriptToTextLines } from "../src/icToTextLines";

// When adapting this demo outside transcript-core, import from the package
import { TranscriptSchema, TranscriptLine, TranscriptWord ,
     secondsToHms, wordBackgroundColor, htmlEncode,
     isAwsTranscript, awsToIcLines, icTranscriptToTextLines, TranscriptTextLine } from "../src/index";

import './style.pcss';

let icTranscript: TranscriptSchema;

type EventHandler = (event: Event) => void;
const prefix = "ic";
function attachButton(id: string, eventHandler: EventHandler) : void {
    // Setup the load button handler
    let element: HTMLElement | null = document.getElementById(prefix + id);
    if (element) {
      element.addEventListener("click", eventHandler);
    }    
}

function attachChange(id: string, eventHandler: EventHandler) {
    let element = document.getElementById(prefix + id);
    if (element) {
      element.addEventListener("change", eventHandler);
    }
}

function renderWords(words: Array<TranscriptWord>, isFiller: boolean = true, isColor: boolean = true) {
    let html: string = '';
    for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
        let icWord: TranscriptWord = words[wordIndex];
        //console.log(`${this.currentLine}-${wordIndex} '${word.content}' colour=${this.getBackgroundColor(this.currentLine, wordIndex)}`)
        if (isFiller == true || icWord.filler === undefined) {
            html += ( icWord.start_time !== undefined ? ' ' : '');
            let content = icWord.content;
            if (!isFiller && icWord.capitalize === true ) {
                content = content.charAt(0).toUpperCase() + content.slice(1);
            }
            content = htmlEncode(content);
            let backgroundColor = '';
            if (isColor) {
                 backgroundColor = wordBackgroundColor(icWord);
            }
            if (isColor && backgroundColor != "") {
                // id="${prefix}-word-${wordIndex}" 
                html += `<span style='background-color: ${backgroundColor}'>${content}</span>`
            }
            else {
                html += content;
            }
        }
    }
    return html;
}

function renderTranscript(icTranscript, isFiller: boolean = true, isColor: boolean = true) {
    const container = document.getElementById(prefix + '-line');
    if (container) {
        let html: string = '';

        for (let lineIndex = 0; lineIndex < icTranscript.lines.length; lineIndex++) {
            const icLine: TranscriptLine = icTranscript.lines[lineIndex];
            html += '<p>'
                + htmlEncode(
                    secondsToHms(icLine.words[0].start_time)
                    + ' '
                    + icTranscript.speakers[icLine.speaker]
                )
                + ': '
                + renderWords(icLine.words, isFiller, isColor) + '</p>';
        }

        container.innerHTML = html;
    }
}

function renderLines(textLines: Array<TranscriptTextLine>) {
    const container = document.getElementById(prefix + '-line');
    if (container) {
        let html: string = '';
        for (let lineIndex = 0; lineIndex < textLines.length; lineIndex++) {
            let icLine = textLines[lineIndex];
            html += '<p>' + htmlEncode(icLine.start_time + ' ' + icLine.speaker + ': ' + icLine.words) + '</p>';
        }
        container.innerHTML = html;
    }
}

function render() {
    let el = document.getElementById(prefix + "-filler") as HTMLInputElement;
    const isFiller: boolean = el.checked;
    el = document.getElementById(prefix + "-color") as HTMLInputElement;
    const isColor: boolean = el.checked;
    console.log(`isFiller=${isFiller} isColor=${isColor}`);

    // Use icTranscriptToTextLines to bake the transcript data structure into text that's easy to render
    renderLines(icTranscriptToTextLines(icTranscript, isFiller));

    // Render the transcript data structure directly
    renderTranscript(icTranscript, isFiller, isColor);
}


async function loadObject(object: object) {
    if ( isAwsTranscript(object) ) {
        // Looks like an AWS transcript
        icTranscript = { url: "", speakers: [], lines: [] };
        const result = awsToIcLines(object);
        if (result instanceof Error) {
            console.log(result.message);
            return;
        }
        icTranscript.lines = result;
        icTranscript.speakers = [ "Speaker 1", "Speaker 2"]
    }
    else {
        icTranscript = object as TranscriptSchema;
    }

    render();
}


async function loadUrl(url: string) {
    // Get the HTTP response
    const response = await window.fetch(url);
    // Convert the response to an object
    const object = await response.json();
    loadObject(object);
}

async function loadString(transcript: string) {
    loadObject(JSON.parse(transcript));
}

const handleLoadButtonClick = async (event: Event) => {
    if (event.type === "click") {
      const el = document.getElementById(prefix + "-transcript-url") as HTMLInputElement;
      if (el) {
        loadUrl(el.value);
      }
    }
}

const handleChangeSettings = (event: Event) : void => {
    render();
}

const handleChangeFile = (event: Event) : void => {
    console.log("ha");
    const el = event.target as HTMLInputElement;
    const files = el.files as FileList;
    const file = files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      const contents = e.target?.result as string;
      loadString(contents);
    };
    reader.readAsText(file);
}

function attach() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let url = urlParams.get("url");
    const el = document.getElementById(prefix + "-transcript-url") as HTMLInputElement;
    if (el) {
        // There's a url field, so get/set the URL.
        if (url) {
            // Overwrite the default value with the parameter
            el.value = url;
        }
        else if (el.value) {
            // Use the default value
            url = el.value;
        }
    }
    if (url) {
        loadUrl(url);
    }

    attachButton("-load", handleLoadButtonClick);
    attachChange("-filler", handleChangeSettings);
    attachChange("-color", handleChangeSettings);
    attachChange("-file", handleChangeFile);
}

attach();
