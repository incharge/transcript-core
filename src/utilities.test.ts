import { expect, test } from 'vitest';
import { secondsToHms } from './utilities';

test('secondsToHms _', async () => {
  expect(secondsToHms(undefined)).toBe('');
})

test('secondsToHms 0', async () => {
  expect(secondsToHms(0)).toBe('00:00');
})

test('secondsToHms 00:04', async () => {
    expect(secondsToHms(4)).toBe('00:04');
  })

test('secondsToHms 00:34', async () => {
    expect(secondsToHms(34)).toBe('00:34');
})

test('secondsToHms 02:34', async () => {
  expect(secondsToHms(154)).toBe('02:34');
})

test('secondsToHms 12:34', async () => {
  expect(secondsToHms(754)).toBe('12:34');
})

test('secondsToHms 00:59', async () => {
  expect(secondsToHms(60-1)).toBe('00:59');
})

test('secondsToHms 01:00', async () => {
  expect(secondsToHms(60)).toBe('01:00');
})

test('secondsToHms 59:59', async () => {
  expect(secondsToHms(60*60-1)).toBe('59:59');
})

test('secondsToHms 1:00:00', async () => {
  expect(secondsToHms(60*60)).toBe('1:00:00');
})

test('secondsToHms 9:59:59', async () => {
  expect(secondsToHms(60*60*10-1)).toBe('9:59:59');
})

test('secondsToHms 10:00:00', async () => {
  expect(secondsToHms(60*60*10)).toBe('10:00:00');
})

test('secondsToHms 23:59:59', async () => {
  expect(secondsToHms(60*60*24-1)).toBe('23:59:59');
})

test('secondsToHms 00:00:00', async () => {
  expect(secondsToHms(60*60*24)).toBe('00:00:00');
})
