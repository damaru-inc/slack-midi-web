/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * Solace Systems Node.js API
 * Publish/Subscribe tutorial - Topic Publisher
 * Demonstrates publishing direct messages to a topic
 */

/*jslint es6 node:true devel:true*/

module.exports = function (solaceModule, config) {
    'use strict';
    var solace = solaceModule;
    var publisher = {};
    publisher.session = null;

    // Logger
    publisher.log = function (line) {
        var now = new Date();
        var time = [('0' + now.getHours()).slice(-2), ('0' + now.getMinutes()).slice(-2),
            ('0' + now.getSeconds()).slice(-2)];
        var timestamp = '[' + time.join(':') + '] ';
        console.log(timestamp + line);
    };

    publisher.log('\n*** Publisher is ready to connect ***');

    // main function
    publisher.run = function () {
        publisher.connect();
    };

    // Establishes connection to Solace message router
    publisher.connect = function () {
        if (publisher.session !== null) {
            publisher.log('Already connected and ready to publish.');
            return;
        }
        // extract params
        var hosturl = config.host
        publisher.log('Connecting to Solace message router using url: ' + hosturl);
        var username = config.username
        publisher.log('Client username: ' + username);
        var vpn = config.vpn
        publisher.log('Solace message router VPN name: ' + vpn);
        var pass = config.password
        // create session
        try {
            publisher.session = solace.SolclientFactory.createSession({
                // solace.SessionProperties
                url:      hosturl,
                vpnName:  vpn,
                userName: username,
                password: pass,
            });
        } catch (error) {
            publisher.log(error.toString());
        }
        // define session event listeners
        // publisher.session.on(solace.SessionEventCode.UP_NOTICE, function (sessionEvent) {
        //     publisher.log('=== Successfully connected and ready to publish messages. ===');
        // });

        publisher.session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, function (sessionEvent) {
            publisher.log('Connection failed to the message router: ' + sessionEvent.infoStr +
                ' - check correct parameter values and connectivity!');
                process.exit(1)
        });
        publisher.session.on(solace.SessionEventCode.DISCONNECTED, function (sessionEvent) {
            publisher.log('Disconnected.');
            if (publisher.session !== null) {
                publisher.session.dispose();
                publisher.session = null;
            }
        });
        // connect the session
        try {
            publisher.session.connect();
        } catch (error) {
            publisher.log(error.toString());
        }
    };

    publisher.message = solace.SolclientFactory.createMessage();
    publisher.message.setDeliveryMode(solace.MessageDeliveryModeType.DIRECT);
    publisher.topicMap = {}

    publisher.getTopic = function(topic) {
        var ret = publisher.topicMap[topic]

        if (undefined === ret) {
            //console.log("topic was undefined.")
            ret = solace.SolclientFactory.createTopicDestination(topic)
            publisher.topicMap[topic] = ret
        } else {
            //console.log("Found topic " + topic + " " + ret)
        }

        return ret
    }

    // Publishes one message
    publisher.publish = function (messageText, topic) {
        if (publisher.session !== null) {
            var solaceTopic = publisher.getTopic(topic)
            this.message.setDestination(solaceTopic);
            this.message.setBinaryAttachment(messageText);
            //publisher.log('Publishing message "' + messageText + '" to topic "' + topic + '"...');
            try {
                publisher.session.send(this.message);
                //publisher.log('Message published.');
            } catch (error) {
                publisher.log(error.toString());
            }
        } else {
            publisher.log('Cannot publish because not connected to Solace message router.');
        }
    };

    publisher.exit = function () {
        publisher.disconnect();
        setTimeout(function () {
            process.exit();
        }, 1000); // wait for 1 second to finish
    };

    // Gracefully disconnects from Solace message router
    publisher.disconnect = function () {
        publisher.log('Disconnecting from Solace message router...');
        if (publisher.session !== null) {
            try {
                publisher.session.disconnect();
            } catch (error) {
                publisher.log(error.toString());
            }
        } else {
            publisher.log('Not connected to Solace message router.');
        }
    };

    return publisher;
};

