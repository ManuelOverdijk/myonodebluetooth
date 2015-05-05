/**
 This Source Code is licensed under the MIT license. If a copy of the
 MIT-license was not distributed with this file, You can obtain one at:
 http://opensource.org/licenses/mit-license.html.
 @author: Manuel Overdijk (manueloverdijk)
 @license MIT
 @copyright Manuel Overdijk, 2015
 */

var Deserialise = require('../util/deserialise');
var Serialise =   require('../util/serialise');
var MyoProtocol = require('../myoProtocol');

class ConcurrencyTest {
    get peripheral() {
        return this._peripheral
    }

    set peripheral(value) {
        this._peripheral = value
    }

    constructor(peripheral) {
        this._peripheral = peripheral;
        this.deserialise = new Deserialise();
        this.serialise = new Serialise();
        this.protocol = new MyoProtocol();

    }


    /* Test Concurrency of notifying characteristics when connected */
    testConcurrency(){

        let commandPayload = this.serialise.command_set_mode();

        this.peripheral.discoverServices([this.protocol.services.control.id,this.protocol.services.classifier.id, this.protocol.services.imuData.id], function(error, services) {
            console.log('Services discovered: ', services);
            var commandService = services[0];
            var classifierService = services[2];
            var imuService = services[1];


            /* Write CommandService to enable IMU/Classifier events */
            commandService.discoverCharacteristics([this.protocol.services.control.COMMAND], function(error, characteristics) {
                console.log('discovered Command characteristic', characteristics);
                var commandChar = characteristics[0];

                commandChar.write(commandPayload, true, function(error) {
                    console.log('set command_set_mode');
                    console.log('error == ',error);
                });
            }.bind(this));

            /* Get notified of IMU events */

            setTimeout(function(){
                imuService.discoverCharacteristics([], function(error, characteristics) {
                    console.log('discovered characteristic readIMU', characteristics);
                    var imuChar = characteristics[0];

                    imuChar.notify(true, function(error){
                        console.log('error happend', error);
                    });

                    imuChar.on('notify', function(data, isNotification) {
                        //console.log('notify',data);
                    }.bind(this));

                    imuChar.on('read', function(data, isNotification){
                        console.log('got data', this.deserialise.imu_data_t(data));
                        //console.log('isNotification', isNotification);
                    }.bind(this)); //
                }.bind(this));
            }.bind(this),2000);

            /* Get notified of Classifier events */

            setTimeout(function(){
                classifierService.discoverCharacteristics([this.protocol.services.classifier.classifierEvent], function(error, characteristics) {
                    console.log('discovered characteristic classifier', characteristics);
                    var classifierChar = characteristics[0];

                    classifierChar.notify(true, function(error){
                        console.log('error happend classifier', error);
                    });

                    classifierChar.on('notify', function(data, isNotification) {
                        console.log('notify classifier',data);
                        console.log('is notification',isNotification);
                    }.bind(this));

                    classifierChar.on('read', function(data, isNotification){
                        let eventData = this.deserialise.classifier_event_t(data);
                        console.log('eventData', eventData);
                        if(eventData.type == 3){
                            if(eventData.pose == 0){
                                console.log('rest!');
                            }
                            if(eventData.pose == 1){
                                console.log('fist!');
                            }
                            if(eventData.pose == 2){
                                console.log('waveIn!');
                            }
                            if(eventData.pose == 3){
                                console.log('waveOut!');
                            }
                            if(eventData.pose == 4){
                                console.log('fingersspread!');
                            }
                            if(eventData.pose == 5){
                                console.log('doubleTap!');
                            }
                            if(eventData.pose == 255){
                                console.log('unkown!');
                            }
                        }
                        else if(eventData.type == 1){
                            console.log('arm synced!');
                        }
                        // arm unsynced
                        else if(eventData.type == 2){
                            console.log('arm unsynced');
                        }
                    }.bind(this));
                }.bind(this));

            }.bind(this),5000);


        }.bind(this));
    }
}

module.exports = ConcurrencyTest;