export async function initMIDI() {
  if (!('requestMIDIAccess' in navigator)) throw new Error('Web MIDI not supported');
  const access = await navigator.requestMIDIAccess({ sysex: true });
  return access;
}

export function findGp200Output(access) {
  const outs = Array.from(access.outputs.values());
  return (
    outs.find(o => o.name === 'GP-200:GP-200 MIDI 1 24:0') ||
    outs.find(o => /GP-200/i.test(o.name)) ||
    null
  );
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
export function sendCC(output, cc, value, ch = 1) {
  if (!output) return;
  output.send([0xB0 | clamp(ch - 1, 0, 15), cc & 0x7F, clamp(value, 0, 127)]);
}

export const CC = {
  BANK_MSB: 0,
  PATCH_VOL: 7,
  EXP1: 11,
  EXP1_AB: 13,
  QA1: 16,
  QA2: 18,
  QA3: 20,
  BANK_DEC: 22,
  BANK_INC: 23,
  PATCH_DEC: 24,
  PATCH_INC: 25,
  MOD_PRE: 48,
  MOD_DST: 49,
  MOD_AMP: 50,
  MOD_NR: 51,
  MOD_CAB: 52,
  MOD_EQ: 53,
  MOD_MOD: 54,
  MOD_DLY: 55,
  MOD_RVB: 56,
  MOD_WAH: 57,
  TUNER: 58,
  LOOPER: 59,
  LOOPER_RECORD: 60,
  LOOPER_AUTO_REC: 61,
  LOOPER_PLAY: 62,
  LOOPER_TEMPO: 63,
  LOOPER_PLAYBACK: 64,
  DELETE_LOOP: 65,
  LOOPER_REC_VOL: 66,
  LOOPER_PLAY_VOL: 67,
  LOOPER_PLACEMENT: 68,
  CTRL1: 69,
  CTRL2: 70,
  CTRL3: 71,
  CTRL4: 72,
  TEMPO_MSB: 73,
  TEMPO_LSB: 74,
  TAP_TEMPO: 75,
  CTRL5: 76,
  CTRL6: 77,
  CTRL7: 78,
  CTRL8: 79,
  DRUM_ONOFF: 92,
  DRUM_PLAY: 93,
  DRUM_TYPE: 94,
  DRUM_VOL: 95,
};

export function requestPatchName(output, patchNum) {
  if (!output) return;
  const msg = [
    0xF0, 0x21, 0x25, 0x7E, 0x47, 0x50, 0x2D, 0x32, 0x11, 0x20,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, patchNum, 0x00, 0x00, 0x00,
    0x07, 0x00, 0x00, 0x01, 0x04, 0x00, 0x00, 0x00, patchNum, 0x00,
    0x00, 0x00, patchNum, 0x00, 0x00, 0xF7
  ];
  output.send(msg);
}

requestPatchName.parseName = (data) => {
  if (data.length < 40 || data[0] !== 0xF0 || data[7] !== 0x32 || data[8] !== 0x12) return null;

  if (data.length === 62 && data[9] === 0x18 && data[14] === 0x07) {
    const startPos = 29;
    const chars = [];

    for (let i = startPos; i < data.length - 1; i += 2) {
      if (data[i] === 0xF7 || data[i] === 0x00) break;
      if (i + 1 >= data.length - 1) break;

      const byte = (data[i] << 4) | data[i + 1];
      if (byte === 0x00) break;
      if (byte >= 0x20 && byte <= 0x7E) {
        chars.push(String.fromCharCode(byte));
      } else {
        break;
      }
    }

    return chars.join('').trim() || null;
  }

  return null;
};

export function queryPatchVolume(output) {
  if (!output) return;
  const msg = [
    0xF0, 0x21, 0x25, 0x7E, 0x47, 0x50, 0x2D, 0x32, 0x11, 0x08,
    0x00, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x04, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF7
  ];
  output.send(msg);
}

export function queryModuleState(output, moduleId) {
  if (!output) return;
  const msg = [
    0xF0, 0x21, 0x25, 0x7E, 0x47, 0x50, 0x2D, 0x32, 0x11, 0x10,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
    0x05, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, moduleId, 0x00,
    0x00, 0x0C, 0x0F, 0x00, 0x02, 0xF7
  ];
  output.send(msg);
}

export const MODULE_IDS = {
  WAH: 0x01,
  PRE: 0x00,
  AMP: 0x03,
  NR: 0x04,
  CAB: 0x05,
  EQ: 0x06,
  MOD: 0x07,
  DLY: 0x08,
  RVB: 0x09,
};
