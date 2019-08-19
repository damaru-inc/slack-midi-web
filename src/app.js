const express = require('express')
const fs = require('fs')
const Pub = require("./pub.js")
const Midi = require("./midi.js")
const bodyParser = require('body-parser')
const util = require('util')

const midi = new Midi();

// Import the config, either from the local file system or a Kubernetes secret
// passed in as an environment variable.

var configPath = "./solace.json"

if (process.env.slack_midi_config_path) {
    configPath = process.env.slack_midi_config_path
}

var legato = 0.5

if (process.env.legato) {
    legato = Number(process.env.legato)
    console.log("override legato to " + legato)
}

var baseDuration = 250

if (process.env.duration) {
    baseDuration = Number(process.env.duration)
    console.log("override duration to " + baseDuration)
}

var durations = []
setupDurations()

var config = require(configPath)

// Setup Solace

var solace = require('solclientjs')
var factoryProps = new solace.SolclientFactoryProperties();
factoryProps.profile = solace.SolclientFactoryProfiles.version10;
solace.SolclientFactory.init(factoryProps);
solace.SolclientFactory.setLogLevel(solace.LogLevel.WARN);
var pub = new Pub(solace, config);
pub.connect()

// Setup Express
const app = express()
const port = 8000
const jsonParser = bodyParser.json()
const textParser = bodyParser.raw({ type: 'text/plain' })

app.get('/', (req, res) => res.send("slack-midi-web is up and running!\n"))

// Main entry point - Slack will post here.
app.post('/in', jsonParser, function (req, res)  {
    var payload = req.body

    // When setting up the Slack web hook, it sends a string in the 'challenge' field
    // and wants us to echo the same back.
    if (payload.challenge) {
        console.log('got challenge: ' + JSON.stringify(payload))
        res.send(payload.challenge + '\n')
    // Messages will get sent here in the event.text field.
    } else if (payload.text) {
        var text = payload.text
        console.log('got event.text: ' + text)
        processText(text)
        res.end()
    } else if (payload.event.text) {
        var text = payload.event.text
        //console.log('got text: ' + text)
        processText(text)
        res.end()
    } else {
        console.log('Unrecognized content:')
        console.log(JSON.stringify(payload))
        res.end()
    }
})

app.post('/raw', textParser, function(req, res) {
    var b = req.body
    b = String(b)
    processText(b)
    res.end()
})

app.get('/health', (req, res) => res.end())

// This will kill the process by trying to read a non-existent file.
app.get('/kill', function (req, res) {
    console.log('kill invoked.')
    fs.createReadStream("this-file-does-not-exist.txt");
    console.log('Somehow we survived.')
    res.end()
})

app.listen(port, () => console.log(`listening on port ${port}!`))

async function processText (text) {
    var channel = 0
    var topic = 'midi/0/' + channel
    //console.log('topic: ' + topic)
    var shortDur = getDuration()
    var longDur = shortDur * 2
    console.log(`processing dur ${shortDur} ${text}` )

    // Sleep until the next second starts.
    var d = new Date()
    var time = d.getTime()
    var ms = time % 1000
    await sleep(shortDur)

    try {
        for (const char of text) {
            //console.log('char ' + char + ' type ' + typeof char )
            if (char === '!') {
                shortDur = baseDuration
                longDur = shortDur * 2
            } else if (char >= '0' && char <= '9') {
                topic = 'midi/0/' + char
                //console.log('changed topic to ' + topic)
                channel = parseInt(char)
            } else {
                var note = midi.noteForChar(char)

                if (!note) {
                    await sleep(shortDur)
                } else {
                    var velocityBase = 40;
                    var velocityRange = 128 - velocityBase;
                    var velocity = Math.trunc(Math.random() * velocityRange) + velocityBase;
                    //console.log(`v: ${velocity}`)
                    var duration = midi.isUpper(char) ? longDur : shortDur
                    var midiString = midi.shortMessage(channel, midi.NOTE_ON, note, velocity)
                    pub.publish(midiString, topic)
                    var beforeNoteOff = Math.trunc(duration * legato)
                    var afterNoteOff = duration - beforeNoteOff
                    await sleep(beforeNoteOff)
                    midiString = midi.shortMessage(channel, midi.NOTE_OFF, note, velocity)
                    pub.publish(midiString, topic)
                    await sleep(afterNoteOff)
                }
            }
        }
    } catch (e) {
        console.log('Error in processText function: ' + e)
    }
}

function getDuration() {
    var index = Math.trunc(Math.random() * durations.length)
    var dur = durations[index]
    return dur
}

function setupDurations() {
    var scales = [[1, 4], [1.5, 1], [2, 4], [3, 2], [4, 3], [6, 1]];

    var i = 0
    var j = 0

    for (i = 0; i < scales.length; i++) {
        var arr = scales[i]
        var scale = arr[0]
        var repeat = arr[1]

        for (j = 0; j < repeat; j++) {
            var val = Math.trunc(scale * baseDuration)
            durations.push(val)
            console.log(`added ${val}`)
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

process.on('exit', function () {
    console.log('Shutting down...')
    pub.disconnect()
})

process.on('SIGTERM', () => {
    console.log('Caught a SIGTERM. Shutting down...')
    process.exit()
})

process.on('SIGINT', () => {
    console.log('Caught a SIGINT. Shutting down...')
    process.exit()
})


