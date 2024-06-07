var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { expect, test, vi } from 'vitest';
import { awsFileToIcLines } from './awsToIcLines';
// Valid aws input file
test('awsFileToIcLines OK', () => __awaiter(void 0, void 0, void 0, function* () {
    const result = [
        {
            speaker: 1,
            words: [
                {
                    content: "Hello",
                    start_time: 1.23,
                    end_time: 3.45,
                    confidence: 0.999
                }
            ]
        }
    ];
    expect(yield awsFileToIcLines('test/aws-item-1-OK.json')).toStrictEqual(result);
}));
// aws files pass but generate a warning
// Confidence defaults to 0.99, but logs a warning
test('awsFileToIcLines missing-confidence-property.json', () => __awaiter(void 0, void 0, void 0, function* () {
    const expectedResult = [
        {
            "speaker": 1,
            "words": [
                {
                    "confidence": 0.999,
                    "content": "most",
                    "end_time": 5062.379,
                    "start_time": 5062.06,
                },
            ],
        },
    ];
    const consoleSpy = vi.spyOn(console, 'log');
    expect(yield awsFileToIcLines('test/missing-confidence-property.json')).toStrictEqual(expectedResult);
    expect(consoleSpy).toHaveBeenLastCalledWith('WARNING: Pronunciation has no confidence property');
}));
test('awsFileToIcLines punctuation-consecutively.json', () => __awaiter(void 0, void 0, void 0, function* () {
    const expectedResult = [
        {
            "speaker": 0,
            "words": [
                {
                    "confidence": 0.999,
                    "content": "Hello",
                    "start_time": 0.75,
                    "end_time": 1.139,
                },
                {
                    "content": ",",
                },
                {
                    "content": ",",
                },
                {
                    "confidence": 0.998,
                    "content": "everybody",
                    "start_time": 1.149,
                    "end_time": 1.809,
                }
            ]
        }
    ];
    const consoleSpy = vi.spyOn(console, 'log');
    expect(yield awsFileToIcLines('test/punctuation-consecutively.json')).toStrictEqual(expectedResult);
    expect(consoleSpy).toHaveBeenLastCalledWith('WARNING: Two punctuations in a row.');
}));
// Invalid aws input files
test('awsFileToIcLines empty', () => __awaiter(void 0, void 0, void 0, function* () {
    const result = new Error('Invalid schema: Missing properties: results');
    expect(yield awsFileToIcLines('test/empty.json')).toStrictEqual(result);
}));
test('awsFileToIcLines empty-items.json', () => __awaiter(void 0, void 0, void 0, function* () {
    const result = new Error('Transcript contains no words');
    expect(yield awsFileToIcLines('test/empty-items.json')).toStrictEqual(result);
}));
test('awsFileToIcLines missing-alternatives.json', () => __awaiter(void 0, void 0, void 0, function* () {
    const result = new Error('Invalid AwsTranscriptItem: Missing properties: alternatives');
    expect(yield awsFileToIcLines('test/missing-alternatives.json')).toStrictEqual(result);
}));
test('awsFileToIcLines missing-content.json', () => __awaiter(void 0, void 0, void 0, function* () {
    const result = new Error('Content property is missing');
    expect(yield awsFileToIcLines('test/missing-content.json')).toStrictEqual(result);
}));
test('awsFileToIcLines missing-end_time.json', () => __awaiter(void 0, void 0, void 0, function* () {
    const result = new Error('Pronunciation has no end time');
    expect(yield awsFileToIcLines('test/missing-end_time.json')).toStrictEqual(result);
}));
test('awsFileToIcLines missing-items.json', () => __awaiter(void 0, void 0, void 0, function* () {
    const result = new Error('Invalid schema of \'result\': Missing properties: items');
    expect(yield awsFileToIcLines('test/missing-items.json')).toStrictEqual(result);
}));
test('awsFileToIcLines missing-item-type-property.json', () => __awaiter(void 0, void 0, void 0, function* () {
    const result = new Error('Invalid AwsTranscriptItem: Missing properties: type');
    expect(yield awsFileToIcLines('test/missing-item-type-property.json')).toStrictEqual(result);
}));
test('awsFileToIcLines missing-speaker.json', () => __awaiter(void 0, void 0, void 0, function* () {
    const result = new Error('Invalid AwsTranscriptItem: Missing properties: speaker_label');
    expect(yield awsFileToIcLines('test/missing-speaker.json')).toStrictEqual(result);
}));
test('awsFileToIcLines missing-start_time.json', () => __awaiter(void 0, void 0, void 0, function* () {
    const result = new Error('Pronunciation has no start time');
    expect(yield awsFileToIcLines('test/missing-start_time.json')).toStrictEqual(result);
}));
test('awsFileToIcLines punctuation-at-start.json', () => __awaiter(void 0, void 0, void 0, function* () {
    const result = new Error('Punctuation at the start of a sentence');
    expect(yield awsFileToIcLines('test/punctuation-at-start.json')).toStrictEqual(result);
}));
test('awsFileToIcLines test-not-json.txt', () => __awaiter(void 0, void 0, void 0, function* () {
    const result = new Error('Unexpected token \'T\', "This is not json" is not valid JSON');
    expect(yield awsFileToIcLines('test/test-not-json.txt')).toStrictEqual(result);
}));
test('awsFileToIcLines test-not-json.txt', () => __awaiter(void 0, void 0, void 0, function* () {
    const result = new Error('Unexpected token \'T\', "This is not json" is not valid JSON');
    expect(yield awsFileToIcLines('test/test-not-json.txt')).toStrictEqual(result);
}));
//# sourceMappingURL=awsToIcLines.test.js.map