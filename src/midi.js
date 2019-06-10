module.exports = function () {

  this.charMap = new Map([
    ['e', 60], // C4
    ['t', 48], // C3
    ['a', 72], // C5
    ['o', 67], // G4
    ['i', 55], // G3
    ['n', 64], // E4
    ['s', 52], // E3
    ['r', 65], // F4
    ['h', 53], // F3
    ['d', 69], // A4
    ['l', 57], // A3
    ['u', 62], // D4
    ['c', 50], // D3
    ['m', 71], // B4
    ['f', 59], // B3
    ['y', 74], // D5
    ['w', 47], // B2
    ['g', 76], // E5
    ['p', 45], // A2
    ['b', 77], // F5
    ['v', 43], // G2
    ['k', 79], // G5
    ['x', 41], // F2
    ['q', 81], // A5
    ['j', 40], // E2
    ['z', 38], // D2
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
