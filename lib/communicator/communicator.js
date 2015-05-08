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

//var BlueBirdQueue = require('bluebird-queue');
var PromiseQueue = require('promiseq/index');
var Promise = require('bluebird');

class Communicator{
    get peripheral(){return this._peripheral}
    set peripheral(value){this._peripheral = value}

    constructor(peripheral) {
        this._peripheral = peripheral;
        this.deserialise = new Deserialise();
        this.serialise = new Serialise();
        this.protocol = new MyoProtocol();

        var workerCount = 1;
        this.queue = new PromiseQueue(workerCount);
    }

    /**
     * initStart
     * Because of a limitation in Noble, being notified of two characteristics only works if you discover the Services
     * concurrently. Thus, upon connection the Communicator should write the ControlService to enable IMU & Classifier events
     * and notify the ClassifierEvent Characteristic and IMUDatacharacteristic to send events.
     */
    initStart(callback){
        // payload to set IMU/Classifier events
        let commandPayload = this.serialise.command_set_mode();
        // payload to set the Myo unlocked
        let unlockPayload = this.serialise.set_unlock_mode(0);
        // payload to set the Myo to never sleep
        let sleepModepayload = this.serialise.set_sleep_mode_t(true);

        this.peripheral.discoverServices([this.protocol.services.control.id,this.protocol.services.classifier.id, this.protocol.services.imuData.id, this.protocol.services.emgData.id], function(error, services) {

            // TODO: Check for UUID's
            var commandService = services[0];
            var imuService = services[1];
            var classifierService = services[2];
            var emgService = services[3];


            /* Write CommandService to enable IMU/Classifier events */
            commandService.discoverCharacteristics([this.protocol.services.control.COMMAND], function (error, characteristics) {
                if(characteristics.length > 0){
                    let commandChar = characteristics[0];
                    commandChar.write(commandPayload, true, function (error) {
                            if(!error){
                                console.log('commandChar set');

                                commandChar.write(unlockPayload,true, function(error) {
                                    if(!error){
                                        console.log('unlock mode set');
                                        callback('unlcok mode  set');
                                        commandChar.write(sleepModepayload,true, function(error){
                                            if(!error){
                                                console.log('sleep mode set');
                                                callback('sleep mode set');
                                            } else {
                                                console.log('sleepModePayLoad error', error);
                                                // TODO: Handle error
                                            }
                                        })
                                    }  else {
                                        console.log('unlockPayload error', error);
                                        // TODO: Handle error
                                    }
                                });
                                callback('commandChar set');
                            } else {
                                console.log('commandChar not set', error);
                                //callback('commandChar not set');
                                // TODO handle error
                            }
                    });
                } else {
                    // TODO handle error
                }

            }.bind(this));

            /* Get notified of IMU events */
            setTimeout(function () {
                imuService.discoverCharacteristics([this.protocol.services.imuData.IMU_DATA], function (error, characteristics) {
                    if(characteristics.length > 0) {

                        let imuChar = characteristics[0];

                        // Notifiy Characteristic to send events
                        imuChar.notify(true, function (error) {
                            if(error){
                                console.log('error happend ', error);
                                // TODO handle error
                            }
                        });

                        imuChar.on('read', function (data, isNotification) {
                            let imuData = this.deserialise.imu_data_t(data);
                            //console.log('IMUCHAR DATA', imuData);
                            callback(imuData);

                            // TODO: Send it back to be emitted by the Armband

                        }.bind(this));

                    } else {
                        // TODO handle error
                    }
                }.bind(this));
            }.bind(this), 2000);

            /* Get notified of Classifier events */

            setTimeout(function () {
                classifierService.discoverCharacteristics([this.protocol.services.classifier.classifierEvent], function (error, characteristics) {
                    if(characteristics.length > 0) {
                        let classifierChar = characteristics[0];

                        // Notifiy Characteristic to send events
                        classifierChar.notify(true, function (error) {
                            if(error){
                                console.log('error happend ', error);
                                // TODO handle error
                            }
                        });
                        classifierChar.on('read', function (data, isNotification) {
                            let eventData = this.deserialise.classifier_event_t(data);
                            console.log('eventData received');
                            callback(eventData);
                        }.bind(this));

                    } else {
                        // TODO handle error
                    }
                }.bind(this));
            }.bind(this), 3000);

            setTimeout(function () {
                emgService.discoverCharacteristics([], function (error, characteristics) {
                    if(characteristics.length  == 4) {
                        // TODO check UUID's
                        for(let index in characteristics){
                            let char = characteristics[index];
                            char.notify(true, function (error) {
                                if(error){
                                    console.log('error happend ', error);
                                    // TODO handle error
                                }
                            });
                            char.on('read', function (data, isNotification) {
                                let emgData = this.deserialise.emg_data_t(data);
                                callback({id: index, emgData: emgData});
                            }.bind(this));

                        }
                    } else {
                        // TODO handle error
                    }
                }.bind(this));
            }.bind(this), 4000);

        }.bind(this));
    }

    readInfo(callback){
        let readInfoPromise = function(){
            return new Promise(function(resolve, reject) {
                //resolve('hello info');
                this.peripheral.discoverServices([this.protocol.services.control.id], function(error, services) {
                    console.log('discovered service readInfo', services);
                    this.service = services[0];
                    this.service.discoverCharacteristics([this.protocol.services.control.MYO_INFO], function(error, characteristics) {
                        console.log('discovered characteristic readInfo', characteristics);
                        var batteryLevelCharacteristic = characteristics[0];

                        batteryLevelCharacteristic.read(function(error, data) {
                            console.log('read!', data);
                        });

                        batteryLevelCharacteristic.on('read', function(data, isNotification) {
                            console.log('data found readInfo', data);
                            data = this.deserialise.info_t(data);
                            resolve(data);
                        }.bind(this));
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        };

        this.queue.push(readInfoPromise.bind(this)).then(function(results){
            console.log('Job complete', results);
            callback(results)
        }.bind(this));
    }

    readVersion(callback){
        let readVersionPromise = function() {
            return new Promise(function (resolve, reject) {
                this.peripheral.discoverServices([this.protocol.services.control.id], function (error, services) {
                    var service = services[0];
                    console.log('discovered service readVersion', services);

                    service.discoverCharacteristics([this.protocol.services.control.FIRMWARE_VERSION], function (error, characteristics) {
                        console.log('discovered characteristic readVersion', characteristics);
                        var characteristic = characteristics[0];

                        characteristic.read(function (error, data) {
                        });

                        characteristic.once('read', function (data, isNotification) {
                            console.log('data found readVersion', data);
                            data = this.deserialise.version_t(data);
                            resolve(data);
                        }.bind(this));
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        };

        this.queue.push(readVersionPromise.bind(this)).then(function(results){
            console.log('Job complete', results);
            callback(results)
        });
    };

    /**
     *
     */
    readClassifier(callback){
        this.peripheral.discoverServices([this.protocol.services.classifier.id], function(error, services) {
            var service = services[0];
            console.log('discovered service Classifier', services);

            service.discoverCharacteristics([this.protocol.services.classifier.classifierEvent], function(error, characteristics) {
                console.log('discovered characteristic classifier', characteristics);
                var classifierChar = characteristics[0];

                //batteryLevelCharacteristic.notify(function(error, data) {
                //
                // console.log('notify!', data);
                //});
                classifierChar.notify(true, function(error){
                    console.log('error happend classifier', error);
                });

                classifierChar.on('notify', function(data, isNotification) {
                    //data = this.deserialise.version_t(data);
                    console.log('notify classifier',data);
                    console.log('is notification',isNotification);
                    //callback(data);
                }.bind(this));

                classifierChar.on('read', function(data, isNotification){
                    let eventData = this.deserialise.classifier_event_t(data);
                    console.log('eventData', eventData);
                    if(eventData.type == 3){
                        if(eventData.pose == 0){
                            console.log('rest!');
                            callback('rest');
                        }
                        if(eventData.pose == 1){
                            console.log('fist!');
                            callback('fist');
                        }
                        if(eventData.pose == 2){
                            console.log('waveIn!');
                            callback('waveIn');
                        }
                        if(eventData.pose == 3){
                            console.log('waveOut!');
                            callback('waveOut');
                        }
                        if(eventData.pose == 4){
                            console.log('fingersspread!');
                            callback('spread');
                        }
                        if(eventData.pose == 5){
                            console.log('doubleTap!');
                            callback('tap');
                        }
                        if(eventData.pose == 255){
                            console.log('unkown!');
                            callback('unkown');
                        }
                    }
                    else if(eventData.type == 1){
                        console.log('arm synced!');
                        callback('synced');
                    }
                    // arm unsynced
                    else if(eventData.type == 2){
                        console.log('arm unsynced');
                        callback('unsynced');
                    }


                    console.log('isNotification', isNotification);
                }.bind(this)); //
            }.bind(this));
        }.bind(this));
    }

    /**
     *
     * @param callback
     */
    readIMU(callback){
        this.peripheral.discoverServices([this.protocol.services.imuData.id], function(error, services) {
            var service = services[0];
            console.log('discovered service readIMU', services);

            service.discoverCharacteristics([this.protocol.services.imuData.IMU_DATA], function(error, characteristics) {
                console.log('discovered characteristic readIMU', characteristics);
                var batteryLevelCharacteristic = characteristics[0];

                batteryLevelCharacteristic.notify(true, function(error){
                    console.log('error happend', error);
                });

                batteryLevelCharacteristic.on('notify', function(data, isNotification) {
                    //console.log('notify',data);
                    callback(data);
                }.bind(this));

                batteryLevelCharacteristic.on('read', function(data, isNotification){
                    console.log('p')
                    //console.log('got data', this.deserialise.imu_data_t(data));
                    //console.log('isNotification', isNotification);
                }.bind(this)); //
            }.bind(this));
        }.bind(this));
    }

    /**
     *
     */
    vibrate(time, callback){
        let payload = this.serialise.vibrate_t(time);

        let writeVibratePromise = function(payload) {
            return new Promise(function (resolve, reject) {
                this._peripheral.discoverServices([this.protocol.services.control.id], function(error, services) {
                    var commandService = services[0];
                    console.log('discovered commandService');
                    commandService.discoverCharacteristics([this.protocol.services.control.COMMAND], function(error, characteristics) {
                        console.log('discovered Battery Level characteristic', characteristics);
                        var batteryLevelCharacteristic = characteristics[0];

                        batteryLevelCharacteristic.write(payload, false, function(error) {
                            if(!error){
                                // TODO
                                resolve('succes');
                            }  else {
                                reject();
                            }
                        }.bind(this));
                    });
                }.bind(this));
            }.bind(this));
        }.bind(this);

        this.queue.push(writeVibratePromise.bind(this, payload)).then(function(results){
            console.log('Job complete', results);
            callback(results)
        });
    }

    /**
     *
     */
    command_set_mode(callback){
        let payload = this.serialise.command_set_mode();

        let writeCommandPromise = function(payload) {
            return new Promise(function (resolve, reject) {
                this._peripheral.discoverServices([this.protocol.services.control.id], function(error, services) {
                    var commandService = services[0];
                    console.log('discovered commandService');
                    commandService.discoverCharacteristics([this.protocol.services.control.COMMAND], function(error, characteristics) {
                        console.log('discovered Battery Level characteristic', characteristics);
                        var batteryLevelCharacteristic = characteristics[0];

                        batteryLevelCharacteristic.write(payload, true, function(error) {
                            console.log('set command_set_mode');
                            console.log('error == ',error);
                            if(!error){
                                // TODO
                                resolve('success');
                            }  else {
                                reject();
                            }
                        });
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }.bind(this);

        this.queue.push(writeCommandPromise.bind(this, payload)).then(function(results){
            console.log('Job complete', results);
            callback(results)
        });
    }

    /**
     *
     * @param neverSleep
     * @param callback
     */

    sleep_mode_t(neverSleep,callback){
        let payload = this.serialise.set_sleep_mode_t(neverSleep);

        let writeSleepModePromise = function(payload) {
            return new Promise(function (resolve, reject) {

                this._peripheral.discoverServices([this.protocol.services.control.id], function (error, services) {
                    var commandService = services[0];
                    console.log('discovered commandService');
                    commandService.discoverCharacteristics([this.protocol.services.control.COMMAND], function (error, characteristics) {
                        console.log('discovered SleepMode Char', characteristics);
                        var batteryLevelCharacteristic = characteristics[0];

                        batteryLevelCharacteristic.write(payload, true, function (error) {
                            console.log('set set_sleep_mode');
                            console.log('error == ', error);
                            if(!error){
                                // TODO
                                resolve('success');
                            }  else {
                                reject();
                            }
                        });
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }.bind(this);

        this.queue.push(writeSleepModePromise.bind(this, payload)).then(function(results){
            console.log('Job complete', results);
            callback(results)
        });
    }

    unlock_mode_t(mode,callback){
        let payload = this.serialise.set_unlock_mode(mode);

        let writeUnlockModePromise = function(payload) {
            return new Promise(function (resolve, reject) {
                this._peripheral.discoverServices([this.protocol.services.control.id], function(error, services) {
                    var commandService = services[0];
                    console.log('discovered commandService');
                    commandService.discoverCharacteristics([this.protocol.services.control.COMMAND], function(error, characteristics) {
                        console.log('discovered unlock_mode_t', characteristics);
                        var batteryLevelCharacteristic = characteristics[0];

                        batteryLevelCharacteristic.write(payload, true, function(error) {
                            console.log('set unlock_mode_t');
                            console.log('error == ',error);
                            if(!error){
                                // TODO
                                resolve('success');
                            }
                            else {
                                reject();
                            }
                        });
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }.bind(this);

        this.queue.push(writeUnlockModePromise.bind(this, payload)).then(function(results){
            console.log('Job complete', results);
            callback(results)
        });
    }

    user_action(callback){
        let payload = this.serialise.user_action();

        let writeUserActionPromise = function(payload) {
            return new Promise(function (resolve, reject) {
                this._peripheral.discoverServices([this.protocol.services.control.id], function(error, services) {
                    var commandService = services[0];
                    console.log('discovered commandService');
                    commandService.discoverCharacteristics([this.protocol.services.control.COMMAND], function(error, characteristics) {
                        console.log('discovered Battery Level characteristic', characteristics);
                        var batteryLevelCharacteristic = characteristics[0];

                        batteryLevelCharacteristic.write(payload, true, function(error) {
                            console.log('set unlock_mode_t');
                            console.log('error == ',error);
                            if(!error){
                                // TODO
                                resolve('succes');
                            } else {
                                reject();
                            }
                        });
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }.bind(this);

        this.queue.push(writeUserActionPromise.bind(this, payload)).then(function(results){
            console.log('Job complete', results);
            callback(results)
        });
    }

    battery_info(callback){
        let writeUserActionPromise = function(payload) {
            return new Promise(function (resolve, reject) {
                this.peripheral.discoverServices(['180f'], function(error, services) {
                    var batteryService = services[0];
                    console.log('discoveredBatter service', services);

                    batteryService.discoverCharacteristics(['2a19'], function(error, characteristics) {
                        console.log('discovered Battery Level characteristic', characteristics);
                        var batteryLevelCharacteristic = characteristics[0];

                        batteryLevelCharacteristic.read(function(error, data) {
                            if(error){
                                reject();
                            }
                        });
                        batteryLevelCharacteristic.on('read', function(data, isNotification) {
                            resolve(data.readUInt8());
                        });
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }.bind(this);
    }

}

module.exports = Communicator;