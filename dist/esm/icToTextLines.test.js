var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { expect, test } from 'vitest';
import { icTranscriptToTextLines } from './icToTextLines';
const testTranscript = {
    url: "",
    speakers: ["Robin", "Charlie"],
    lines: []
};
test('icTranscriptToTextLines', () => __awaiter(void 0, void 0, void 0, function* () {
    testTranscript.lines = [
        //const lines: Array<TranscriptLine> = [
        {
            speaker: 0,
            words: [
                {
                    confidence: 99,
                    content: "Hello",
                    start_time: 0.5,
                    end_time: 1
                },
                {
                    confidence: 99,
                    content: "um",
                    start_time: 0.9,
                    end_time: 1
                },
                {
                    confidence: 99,
                    content: "there",
                    start_time: 1.5,
                    end_time: 2
                },
                {
                    confidence: 99,
                    content: ".",
                    start_time: 0,
                    end_time: 0
                }
            ]
        }
    ];
    const result = [
        {
            speaker: 'Robin',
            words: 'Hello there.',
            start_time: "00:00"
        }
    ];
    expect(icTranscriptToTextLines(testTranscript)).toStrictEqual(result);
}));
//# sourceMappingURL=icToTextLines.test.js.map