module.exports = function () {

  this.charMap = new Map([
    ['e', 60], // C4
    ['a', 48], // C3
    ['t', 72], // C5
    ['a', 67], // G4
    ['o', 55], // G3
    ['i', 64], // E4
    ['n', 52], // E3
    ['s', 65], // F4
    ['r', 53], // F3
    ['h', 69], // A4
    ['d', 57], // A3
    ['l', 62], // D4
    ['u', 50], // D3
    ['c', 71], // B4
    ['m', 59], // B3
    ['f', 74], // D5
    ['y', 47], // B2
    ['w', 76], // E5
    ['g', 45], // A2
    ['p', 77], // F5
    ['b', 43], // G2
    ['v', 79], // G5
    ['k', 41], // F2
    ['x', 81], // A5
    ['q', 40], // E2
    ['j', 38], // D2
    ['z', 81], // B6
  ]);

  this.NOTE_ON = 144  // 0x90
  this.NOTE_OFF = 128 // 0x80

  this.noteForChar = function (char) {
    var l = char.toLowerCase()
    return this.charMap.get(l);
  };

  this.isUpper = function (char) {
    return (char === char.toUpperCase()) && (char !== char.toLowerCase());
  }

  this.midiMessage = function(channel, command, note, velocity) {
    var ret = {}
    ret.channel = channel
    ret.command = command
    ret.velocity = velocity
    ret.note = note
    return JSON.stringify(ret)
  }

  this.shortMessage = function(channel, command, note, velocity) {
    var status = command + channel
    //console.log("status " + status)
    var ret = String.fromCharCode(status)
    ret += String.fromCharCode(note)
    ret += String.fromCharCode(velocity)
    return ret;
  }
}
