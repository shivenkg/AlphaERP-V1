/**
 * Audio Conversion and Playback Utilities for Gemini 3.1 Flash Live API (gemini-3.1-flash-live-preview)
 *
 * Input format: 16,000 Hz, 16-bit Linear PCM, 1 channel (mono)
 * Output format: 24,000 Hz, 16-bit Linear PCM, 1 channel (mono)
 */

/**
 * Converts Float32Array from Web Audio API microphone stream to base64-encoded 16-bit Linear PCM
 */
export function floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  let offset = 0;
  for (let i = 0; i < float32Array.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function pcmToBase64(float32Array: Float32Array): string {
  const pcmBuffer = floatTo16BitPCM(float32Array);
  return arrayBufferToBase64(pcmBuffer);
}

/**
 * Decodes base64 string containing 16-bit Linear PCM at 24,000 Hz into an AudioBuffer
 */
export function base64ToAudioBuffer(
  base64String: string,
  audioContext: AudioContext,
  sampleRate: number = 24000
): AudioBuffer {
  const binaryString = window.atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const int16Array = new Int16Array(bytes.buffer);
  const audioBuffer = audioContext.createBuffer(1, int16Array.length, sampleRate);
  const channelData = audioBuffer.getChannelData(0);

  for (let i = 0; i < int16Array.length; i++) {
    channelData[i] = int16Array[i] / 32768.0;
  }

  return audioBuffer;
}

/**
 * Audio Queue Manager for continuous seamless playback with interruption support
 */
export class LiveAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private nextPlayTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private isMuted: boolean = false;

  constructor(private sampleRate: number = 24000) {}

  public init() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass({ sampleRate: this.sampleRate });
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  public playChunk(base64Data: string) {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const audioBuffer = base64ToAudioBuffer(base64Data, this.audioCtx, this.sampleRate);
      const source = this.audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioCtx.destination);

      const currentTime = this.audioCtx.currentTime;
      if (this.nextPlayTime < currentTime) {
        this.nextPlayTime = currentTime;
      }

      source.start(this.nextPlayTime);
      this.nextPlayTime += audioBuffer.duration;

      this.activeSources.push(source);
      source.onended = () => {
        const index = this.activeSources.indexOf(source);
        if (index > -1) {
          this.activeSources.splice(index, 1);
        }
      };
    } catch (e) {
      console.error('Error playing Live audio chunk:', e);
    }
  }

  public stop() {
    this.activeSources.forEach((source) => {
      try {
        source.stop();
        source.disconnect();
      } catch {}
    });
    this.activeSources = [];
    if (this.audioCtx) {
      this.nextPlayTime = this.audioCtx.currentTime;
    }
  }

  public close() {
    this.stop();
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
