import { expect, test } from 'vitest';
import { TranscriptSchema, TranscriptTextLine } from './types';
import { icTranscriptToTextLines } from './icToTextLines';

const testTranscript: TranscriptSchema = {
  url: "",
  speakers: ["Robin", "Charlie"],
  lines: []
}

test('icTranscriptToTextLines', async () => {
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
  ]

  const result: Array<TranscriptTextLine> = [
    {
      speaker: 'Robin',
      words: 'Hello there.',
      start_time: "00:00"
    }
  ];
  
  expect(icTranscriptToTextLines(testTranscript)).toStrictEqual(result);
})
