# slack-midi-web

This is a node.js application that functions as a Slack web hook, converting text messages to streams of Midi notes and sending them to a Solace router.

It is meant to be used with [midi-mercury](https://github.com/damaru-inc/midi-mercury), which will get the Midi messages from the router and send them to a Midi device.

To set it up, you need a Slack account with authorization to create applications and bot users. Or you can run it locally, see below.

1. Deploy this somewhere where it can be seen publicly.
1. Create an application in Slack.
1. Add a Bot User using the Bot Users link in the left menu.
1. Select Event Subscriptions in the left menu of your application config web page.
1. Enter the Request URL. Slack will validate the node app by sending a special message and expecting the correct reply, this is already handled by the app.
1. In the section "Subscribe to Bot Events" add the Bot User event "message.im". This will cause direct messages sent to the bot, to be sent to this app.

This app expects to find Solace connectivity information in a file called solace.json. This can be provided using the Kubernetes Secrets feature - see the deployment manifest in the scripts directory.

## Local Testing
For local testing, copy edit-me.config.json, rename it to solace.json, and edit it as required.

Then run
```node app.js```

To test, run 
node tester.js

