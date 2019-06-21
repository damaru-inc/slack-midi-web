# slack-midi-web

This is a node.js application that functions as a Slack web hook, converting text messages to streams of Midi notes and sending them to a Solace router.

To set it up, you need a Slack account with authorization to create applications and bot users.

1. Deploy this somewhere where it can be seen publicly.
1. Create an application in Slack.
1. Add a Bot User using the Bot Users link in the left menu.
1. Select Event Subscriptions in the left menu of your application config web page.
1. Enter the Request URL. Slack will validate the node app by sending a special message and expecting the correct reply, this is already handled by the app.
1. In the section "Subscribe to Bot Events" add the Bot User event "message.im". This will cause direct messages sent to the bot, to be sent to this app.

The src subdirectory contains the Javascript code.

The scripts subdirectory contains Kubernetes deployment manifests along with scripts to do various things like create a cluster and deploy the application.

The docker build script in the root directory, as well a scripts/push, read the value of the version file. However the deployment manifest must be manually edited with the corresponding version.

This app expects to find Solace connectivity information in a file called solace.json. This can be provided using the Kubernetes Secrets feature - see the deployment manifest in the scripts directory. A sample called edit-me.config.json is provided in the src directory.


