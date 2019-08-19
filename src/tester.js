// This can be used to simulate a bunch of people sending messages to the Slack bot.
// It's set up to send messages to localhost:8000, but you can configure it to use a real Slack bot, see below.

var https = require ('http')

var numMessages = 200
const MAX_SLEEP = 100

// for local testing use this:
var path = '/in'
var host = 'localhost'

// For testing with a Slack bot, the path and host will look something like this:
//var path = '/services/TAB7D6WDF/TGH5TYUMO/acgelRSK9Foobar99bazslod'
//var host = 'hooks.slack.com'

function send(str) {
    var payload =  `{"text":"${str}"}`
    var len = Buffer.byteLength(payload)
    console.log('payload: ' + payload  + ' len: ' + len)

    var post_options = {
        host: host,
        port: 8000,
        path: path,
        method: 'POST',
        headers: { 
            'content-type': 'application/json',
            'content-length': len
            }
    }

    var post_req = https.request(post_options)

    post_req.write(payload)
    post_req.end()
}

var allowedChars=" 1234567890     abcdefghijklmnopqrstuvwxyz      ABCDEFGHIJKLMNOPQRSTUVWXYZ       "
var len = allowedChars.length

var lenLow = 5
var lenHigh = 40
var lenRange = lenHigh - lenLow + 1

test()

async function test() {
    for (i = 0; i < numMessages; i++) {
        var r = Math.random()
        var len = Math.trunc(r * lenRange + lenLow)
        //console.log(len)
        var str = ''
        for (j = 0; j < len; j++) {
            var r2 = Math.random()
            var index = Math.trunc(r2 * len)
            var char = allowedChars.charAt(index)
            str += char
        }
        //console.log(str)
        send(str)
        var ms = Math.trunc(Math.random() * MAX_SLEEP)
        await sleep(ms)
    }
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

