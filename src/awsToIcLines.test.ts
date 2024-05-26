import { expect, test, vi } from 'vitest';


import { TranscriptLine } from './types';
import { awsFileToIcLines } from './awsToIcLines';

// Valid aws input file
test('awsFileToIcLines OK', async () => {
    const result: Array<TranscriptLine> = [
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
    expect(await awsFileToIcLines('test/aws-item-1-OK.json')).toStrictEqual(result);
})

// aws files pass but generate a warning

// Confidence defaults to 0.99, but logs a warning
test('awsFileToIcLines missing-confidence-property.json', async () => {
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
    const consoleSpy = vi.spyOn(console, 'log')
    expect(await awsFileToIcLines('test/missing-confidence-property.json')).toStrictEqual(expectedResult);
    expect(consoleSpy).toHaveBeenLastCalledWith('WARNING: Pronunciation has no confidence property');
})

test('awsFileToIcLines punctuation-consecutively.json', async () => {
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
    const consoleSpy = vi.spyOn(console, 'log')
    expect(await awsFileToIcLines('test/punctuation-consecutively.json')).toStrictEqual(expectedResult);
    expect(consoleSpy).toHaveBeenLastCalledWith('WARNING: Two punctuations in a row.');
})

// Invalid aws input files
test('awsFileToIcLines empty', async () => {
    const result = new Error('Invalid schema: Missing properties: results')
    expect(await awsFileToIcLines('test/empty.json')).toStrictEqual(result);
})

test('awsFileToIcLines empty-items.json', async () => {
    const result = new Error('Transcript contains no words')
    expect(await awsFileToIcLines('test/empty-items.json')).toStrictEqual(result);
})

test('awsFileToIcLines missing-alternatives.json', async () => {
    const result = new Error('Invalid AwsTranscriptItem: Missing properties: alternatives')
    expect(await awsFileToIcLines('test/missing-alternatives.json')).toStrictEqual(result);
})

test('awsFileToIcLines missing-content.json', async () => {
    const result = new Error('Content property is missing')
    expect(await awsFileToIcLines('test/missing-content.json')).toStrictEqual(result);
})

test('awsFileToIcLines missing-end_time.json', async () => {
    const result = new Error('Pronunciation has no end time')
    expect(await awsFileToIcLines('test/missing-end_time.json')).toStrictEqual(result);
})

test('awsFileToIcLines missing-items.json', async () => {
    const result = new Error('Invalid schema of \'result\': Missing properties: items');
    expect(await awsFileToIcLines('test/missing-items.json')).toStrictEqual(result);
})

test('awsFileToIcLines missing-item-type-property.json', async () => {
    const result = new Error('Invalid AwsTranscriptItem: Missing properties: type')
    expect(await awsFileToIcLines('test/missing-item-type-property.json')).toStrictEqual(result);
})

test('awsFileToIcLines missing-speaker.json', async () => {
    const result = new Error('Invalid AwsTranscriptItem: Missing properties: speaker_label')
    expect(await awsFileToIcLines('test/missing-speaker.json')).toStrictEqual(result);
})

test('awsFileToIcLines missing-start_time.json', async () => {
    const result = new Error('Pronunciation has no start time')
    expect(await awsFileToIcLines('test/missing-start_time.json')).toStrictEqual(result);
})

test('awsFileToIcLines punctuation-at-start.json', async () => {
    const result = new Error('Punctuation at the start of a sentence')
    expect(await awsFileToIcLines('test/punctuation-at-start.json')).toStrictEqual(result);
})

test('awsFileToIcLines test-not-json.txt', async () => {
    const result = new Error('Unexpected token \'T\', "This is not json" is not valid JSON')
    expect(await awsFileToIcLines('test/test-not-json.txt')).toStrictEqual(result);
})

test('awsFileToIcLines test-not-json.txt', async () => {
    const result = new Error('Unexpected token \'T\', "This is not json" is not valid JSON')
    expect(await awsFileToIcLines('test/test-not-json.txt')).toStrictEqual(result);
})

