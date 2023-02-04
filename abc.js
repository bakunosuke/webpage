/** 島メロ(あつ森)で使用可能な音階の配列 */
const usableNote = ['G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'];
/** usableNote に半音を含む音階の配列 */
const noteRange = ['G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5', 'C#5', 'D5', 'D#5', 'E5'];
/** ソート済み音階 */
let sortedNote = [];
/** 出力結果の音階 */
let outputNote = [];

/**
 * 音階の大小比較専用内部関数
 * @param {string} a 音階1. "C4", "C#4" など.
 * @param {string} b 音階2. "C4", "C#4" など.
 * @returns {number} 音階1が音階2より 1:高い, -1:低い, 0:等しい, 2:noteRangeに存在しない音階が含まれている
 */
function myCompare(a, b) {
  const idxA = noteRange.indexOf(a);
  const idxB = noteRange.indexOf(b);
  if (idxA >= 0 && idxB >= 0) {
    if (idxA > idxB) {
      return 1;
    }
    if (idxA < idxB) {
      return -1;
    }
    return 0;
  }
  return 2; // a,bいずれかが noteRange を外れている場合
}

/**
 * @typedef {Object} objToneData
 * @property {string} time
 * @property {string} note
 * @property {number} dur
 */
/**
 * 島メロ利用可能な音階までいくつシフトすればいいかを返す関数
 * @param {objToneData[]} inData シフトするメロディ
 * @returns {number} 0:シフト不要, 999:シフト不可能, それ以外:シフトする音階
 */
function countScale(inData) {
  /* console.log("countScale inData : " + inData); */
  /** 音階チェックの開始数:inDataの最小値とnoteRangeの最小値の差分 */
  // const startCount = 0 - noteRange.indexOf(inData[0]) - 1;
  const startCount = 0 - noteRange.indexOf(inData[0]);
  /** 音階チェックの最大値:inDataの最大値とnoteRangeの最大値の差分 */
  const endCount = (noteRange.length - noteRange.indexOf(inData[inData.length - 1]));

  const tmpNote = [];
  let returnScaleCount = 999;
  /*
  console.log("countScale endCount : " + endCount);
  console.log("countScale noteRange.length : " + noteRange.length);
*/
  let checkNote = inData.filter((note) => usableNote.indexOf(note) < 0);
  /*
  console.log("contScale checkNote : " + checkNote);
*/
  if (checkNote.length === 0) {
    returnScaleCount = 0;
    return returnScaleCount;
  }

  for (let j = startCount; j < endCount; j += 1) { /* シフト必要な場合探索 */
    /* for (const i in inData) { */
    for (let i = 0; i < inData.length; i += 1) {
      tmpNote[i] = noteRange[noteRange.indexOf(inData[i]) + j];
    }
    /*
    console.log("test : " + j + " : " + tmpNote);
*/
    checkNote = tmpNote.filter((note) => usableNote.indexOf(note) < 0);
    if (checkNote.length === 0) {
      /* console.log("shifted:" + j + ":" + tmpNote); */
      /* shifted:-10:A3,B3,C4,D4,E4,F4 */
      // 複数適合する場合は、最も差分が小さいシフト数を返す
      if (Math.abs(j) < Math.abs(returnScaleCount)) {
        returnScaleCount = j;
      }
    }
  }
  /*
  console.log("countScale countScale : " + returnScaleCount);
*/
  return returnScaleCount;
}

/**
 * @typedef {object} musicToneData
 * @property {string} time - timing
 * @property {string} note - note
 * @property {number} dur - duration
 */

/**
 * json形式のinDataをscale分シフトさせる関数
 * @param {musicToneData[]} inData シフトさせる音階
 * @param {number} scale シフト数
 * @returns {musicToneData[]} シフトさせた音階
 */
function shiftScale(inData, scale) {
  /* console.log("shiftScale inData : " + inData); */
  /* console.log("shiftScale scale : " + scale); */
  const returnData = JSON.parse(JSON.stringify(inData));
  /* for (const i in inData) { */
  for (let i = 0; i < inData.length; i += 1) {
    returnData[i].note = noteRange[noteRange.indexOf(inData[i].note) + scale];
  }
  /* console.log("shiftScale returnData : " + returnData); */
  return returnData;
}

function convertScale(inputData) { /* 定数定義（全音階） 22個 + 無音 + 伸ばす + ランダム の25個？ */
  const usedNote = []; /* 使用している音階 */
  /* console.log("\nin:\n" + JSON.stringify(inputData)); */
  /* for (const i in inputData) { */
  for (let i = 0; i < inputData.length; i += 1) {
    if (usedNote.indexOf(inputData[i].note) === -1) {
      usedNote.push(inputData[i].note);
    }
  }
  /* console.log("\nuserd:" + usedNote); */
  /* userd:C5,D5,D#5,G4,A4,A#4 /*
  /* 使用している音階をソート */
  sortedNote = usedNote.sort((a, b) => myCompare(a, b));
  /*  console.log("sorted:" + sortedNote); */
  /* sorted:G4,A4,A#4,C5,D5,D#5 */
  /* スケール数を取得 */
  const scaleCount = countScale(sortedNote); /* スケールを実施 */
  if (scaleCount !== 999) {
    outputNote = shiftScale(inputData, scaleCount);
    /* console.log("\nout:\n" + JSON.stringify(outputNote)); */
    return outputNote;
  }
  /* console.log("do not shift"); */
  return inputData;
}

function myCompare1(a, b) {
  const aString = a.match(/([A-Z+?])(#?)([0-9]+?)/);
  const bString = b.match(/([A-Z+?])(#?)([0-9]+?)/);
  const noteOrder = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  /* console.log("myCompare2 : a,b : " + a + "," + b); */

  if (aString[3] === bString[3]) {
    if (aString[1] === bString[1]) {
      if (aString[2] === bString[2]) {
        return 0;
      } if (bString[2] === '#') {
        return -1;
      }
      return 1;
    } if (noteOrder.indexOf(aString[1]) < noteOrder.indexOf(bString[1])) {
      return -1;
    }
    return 1;
  } if (aString[3] < bString[3]) {
    return -1;
  }
  return 1;
}

module.exports = {
  convertScale, shiftScale, countScale, myCompare, myCompare1,
};
