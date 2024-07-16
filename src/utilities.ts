import { TranscriptWord } from "./types"

export function htmlEncode(input: string): string {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export function wordBackgroundColor(word: TranscriptWord, isCurrent: boolean = false) : string {
    let confidence: number = word.confidence || 0.99;
    if (isCurrent) {
      // Highlight the current word
      return "#FFFF33";
    }
    else if (word.filler === true) {
      // Filler word are gray
      return "#cccccc";
    }
    else if ( confidence == 1) {
      // Corrected words are green
      return '#00ff00';
    }
    else if ( word.start_time === undefined || confidence > 0.99) {
      // Punctuation has no start_time and no confidence property, so can't be color-coded
      // Normal confidence has the default background color
      return '';
    }
    else {
      // Calculate a color that represents the confidence level 
      const minimumColor = 99;
      // Convert confidence into a color number in the range 0 to 255
      confidence = Math.floor(confidence * (256-minimumColor)) + minimumColor;
      // Convert confidence into a 2 digit hex color value
      const color: string = (confidence < 16 ? "0" : "") + confidence.toString(16);
      return "#" + "FF" + color + color;
    }
}

export function secondsToHms(time: number | undefined): string {
    let from: number;
    if (time == undefined) {
        return '';
    }
    if (time < 60*60){
      from = 14;
    }
    else if (time < 60*60*10) {
      from = 12;
    }
    else {
      from = 11;
    }

    return new Date(Math.floor(time) * 1000).toISOString().substring(from, 19);
}

  // secondsToHms(time: number): string {
  //   let remainder: number = Math.floor(time);
  //   let timeHMS: string = "";
  //   while (remainder > 0 || timeHMS.length == 0) {
  //     let unit: number = remainder % 60;
  //     remainder = Math.floor(remainder / 60);
  //     timeHMS = (unit <= 9 ? "0" : "") + String(unit) + (timeHMS.length > 0 ? ":" + timeHMS : "");
  //   }
  //   return timeHMS;
  // }