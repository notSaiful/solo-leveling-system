import { afterEach, describe, expect, it } from 'vitest';
import { getSpeechRecognition, isSpeechSupported } from './voice';

afterEach(() => {
  delete globalThis.window;
});

describe('isSpeechSupported / getSpeechRecognition', () => {
  it('reports unsupported when no SpeechRecognition is present', () => {
    delete globalThis.window;
    expect(isSpeechSupported()).toBe(false);
    expect(getSpeechRecognition()).toBeNull();
  });

  it('reports supported when webkitSpeechRecognition is present', () => {
    globalThis.window = { webkitSpeechRecognition: function MockRec() {} };
    expect(isSpeechSupported()).toBe(true);
    expect(getSpeechRecognition()).toBe(globalThis.window.webkitSpeechRecognition);
  });
});
