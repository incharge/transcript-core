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
import { secondsToHms } from './utilities';
test('secondsToHms _', () => __awaiter(void 0, void 0, void 0, function* () {
    expect(secondsToHms(undefined)).toBe('');
}));
test('secondsToHms 0', () => __awaiter(void 0, void 0, void 0, function* () {
    expect(secondsToHms(0)).toBe('00:00');
}));
test('secondsToHms 00:04', () => __awaiter(void 0, void 0, void 0, function* () {
    expect(secondsToHms(4)).toBe('00:04');
}));
test('secondsToHms 00:34', () => __awaiter(void 0, void 0, void 0, function* () {
    expect(secondsToHms(34)).toBe('00:34');
}));
test('secondsToHms 02:34', () => __awaiter(void 0, void 0, void 0, function* () {
    expect(secondsToHms(154)).toBe('02:34');
}));
test('secondsToHms 12:34', () => __awaiter(void 0, void 0, void 0, function* () {
    expect(secondsToHms(754)).toBe('12:34');
}));
test('secondsToHms 00:59', () => __awaiter(void 0, void 0, void 0, function* () {
    expect(secondsToHms(60 - 1)).toBe('00:59');
}));
test('secondsToHms 01:00', () => __awaiter(void 0, void 0, void 0, function* () {
    expect(secondsToHms(60)).toBe('01:00');
}));
test('secondsToHms 59:59', () => __awaiter(void 0, void 0, void 0, function* () {
    expect(secondsToHms(60 * 60 - 1)).toBe('59:59');
}));
test('secondsToHms 1:00:00', () => __awaiter(void 0, void 0, void 0, function* () {
    expect(secondsToHms(60 * 60)).toBe('1:00:00');
}));
test('secondsToHms 9:59:59', () => __awaiter(void 0, void 0, void 0, function* () {
    expect(secondsToHms(60 * 60 * 10 - 1)).toBe('9:59:59');
}));
test('secondsToHms 10:00:00', () => __awaiter(void 0, void 0, void 0, function* () {
    expect(secondsToHms(60 * 60 * 10)).toBe('10:00:00');
}));
test('secondsToHms 23:59:59', () => __awaiter(void 0, void 0, void 0, function* () {
    expect(secondsToHms(60 * 60 * 24 - 1)).toBe('23:59:59');
}));
test('secondsToHms 00:00:00', () => __awaiter(void 0, void 0, void 0, function* () {
    expect(secondsToHms(60 * 60 * 24)).toBe('00:00:00');
}));
//# sourceMappingURL=utilities.test.js.map