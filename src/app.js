const express = require('express')
const app = express()
const port = 8000
app.use(express.json());

app.get('/', (req, res) => res.send('Hello World!\n'))

app.post('/incoming', function (req, res)  {
    var payload = req.body

    if (payload.challenge) {
        console.log('got challenge: ' + JSON.stringify(payload))
        res.send(payload.challenge + '\n')
    } else if (payload.event.text) {
        var text = payload.event.text
        console.log('got text: ' + text)
        res.end()
    } else {
        console.log('Unrecognized content:')
        console.log(JSON.stringify(payload))
        res.end()
    }
})

app.get('/health', (req, res) => res.end())

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
