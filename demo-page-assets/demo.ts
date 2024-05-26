// Path: demo-page-assets/demo.ts
// This is the entry point for the demo page. It's a TypeScript file that
// loads in the module that we're buidling with this repo

// import { TranscriptSchema, TranscriptLine, TranscriptWord } from "../src/types";
// import { secondsToHms, wordBackgroundColor, htmlEncode } from "../src/utilities";
// import { awsToIcLines, icTranscriptToTextLines, TranscriptTextLine } from "../src/index";
import { TranscriptSchema, TranscriptLine, TranscriptWord ,
     secondsToHms, wordBackgroundColor, htmlEncode,
     awsToIcLines, icTranscriptToTextLines, TranscriptTextLine } from "../src/index";
import './style.pcss';

type EventHandler = (event: Event) => void;
const prefix = "ic";
function attachButton(id: string, eventHandler: EventHandler) : void {
    // Setup the load button handler
    let element: HTMLElement | null = document.getElementById(prefix + id);
    if (element) {
      element.addEventListener("click", eventHandler);
    }    
}

function renderWords(words: Array<TranscriptWord>) {
    let html: string = '';
    let backgroundColor: string;
    for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
        let word: TranscriptWord = words[wordIndex];
        //console.log(`${this.currentLine}-${wordIndex} '${word.content}' colour=${this.getBackgroundColor(this.currentLine, wordIndex)}`)
        html += ( word.start_time !== undefined ? ' ' : '');
        backgroundColor = wordBackgroundColor(word);
        if (backgroundColor != "") {
            // id="${prefix}-word-${wordIndex}" 
            html += `<span style='background-color: ${backgroundColor}'>${htmlEncode(word.content)}</span>`
        }
        else {
            html += htmlEncode(word.content);
        }
    }
    return html;
}

function renderTranscript(icTranscript) {
    console.log(icTranscript)
    const container = document.getElementById(prefix + '-line');
    if (container) {
        let html: string = '';

        for (let lineIndex = 0; lineIndex < icTranscript.lines.length; lineIndex++) {
            const icLine: TranscriptLine = icTranscript.lines[lineIndex];
            html += '<p>' + htmlEncode(secondsToHms(icLine.words[0].start_time) + ' ' + icTranscript.speakers[icLine.speaker] + ': ') + renderWords(icLine.words) + '</p>';
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

async function load(url: string) {
    // Get the HTTP response
    const response = await window.fetch(url);
    // Convert the response to an object
    const object = await response.json();
    let icTranscript: TranscriptSchema;
    if ( "accountId" in object ) {
        // Looks like an AWS transcript
        icTranscript = { url: url, speakers: [], lines: [] };
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

    // Use icTranscriptToTextLines to bake the transcript data structure into text that's easy to render
    renderLines(icTranscriptToTextLines(icTranscript));

    // Render the transcript data structure directly
    //renderTranscript(icTranscript);
}

const handleLoadButtonClick = async (event: Event) => {
    if (event.type === "click") {
      const el = document.getElementById(prefix + "-transcript-url") as HTMLInputElement;
      if (el) {
        load(el.value);
      }
    }
}

function attach() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const url = urlParams.get("url");
    const el = document.getElementById(prefix + "-transcript-url") as HTMLInputElement;
    if (el && url) {
        el.value = url;
        load(url);
    }

    attachButton("-load", handleLoadButtonClick);
}

attach();