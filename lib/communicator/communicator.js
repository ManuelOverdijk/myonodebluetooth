/**
 * Created by manuel on 17-04-15.
 */
var Deserialise = require('../util/deserialise.js');
var Serialise =   require('../util/serialise.js');
var MyoProtocol = require('../myoProtocol');

class Communicator{
    get peripheral(){return this._peripheral}
    set peripheral(value){this._peripheral = value}

    constructor(peripheral){
        this._peripheral = peripheral;
        this.deserialise = new Deserialise();
        this.serialise = new Serialise();
        this.protocol = new MyoProtocol();

    }

    /**
     * initStart
     * Because of a limitation in Noble, being notified of two characteristics only works if you discover the Services
     * concurrently. Thus, upon connection the Communicator should write the ControlService to enable IMU & Classifier events
     * and notify the ClassifierEvent Characteristic and IMUdatacharacteristic to send events.
     */
    initStart(callback){
        // payload to set IMU/Classifier events
        let commandPayload = this.serialise.command_set_mode();
        // payload to set the Myo unlocked
        let unlockPayload = this.serialise.set_unlock_mode(0);
        // payload to set the Myo to never sleep
        let sleepModepayload = this.serialise.set_sleep_mode_t(true);

        this.peripheral.discoverServices([this.protocol.services.control.id,this.protocol.services.classifier.id, this.protocol.services.imuData.id], function(error, services) {

            // TODO: Check for UUID's
            var commandService = services[0];
            var classifierService = services[2];
            var imuService = services[1];


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
                                                // TODO: Handle error
                                            }
                                        })
                                    }  else {
                                        // TODO: Handle error
                                    }
                                });
                                callback('commandChar set');
                            } else {
                                console.log('commandChar not set');
                                callback('commandChar not set');
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

                        /*
                        imuChar.on('notify', function (data, isNotification) {});
                        */

                        imuChar.on('read', function (data, isNotification) {
                            let imuData = this.deserialise.imu_data_t(data)
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

                        //classifierChar.on('notify', function (data, isNotification) {
                        //    console.log('notify classifier', data);
                        //    console.log('is notification', isNotification);
                        //}.bind(this));

                        classifierChar.on('read', function (data, isNotification) {
                            let eventData = this.deserialise.classifier_event_t(data);
                            console.log('eventData received');
                            callback(eventData);
                        }.bind(this));

                    } else {
                        // TODO handle error
                    }
                }.bind(this));
            }.bind(this), 5000);
        }.bind(this));
    }

    //readInfo(callback){
    //    this.peripheral.discoverServices(['d5060001a904deb947482c7f4a124842'], function(error, services) {
    //        var service = services[0];
    //        console.log('discovered service', services);
    //        this.service.discoverCharacteristics(['d5060101a904deb947482c7f4a124842'], function (error, characteristics) {
    //            console.log('discovered characteristic', characteristics);
    //            var characteristic = characteristics[0];
    //
    //            characteristic.read(function (error, data) {
    //            });
    //
    //            characteristic.once('read', function (data, isNotification) {
    //                console.log('data found', data);
    //                data = this.deserialise.info_t(data);
    //                callback(data);
    //            }.bind(this));
    //        }.bind(this));
    //    }.bind(this));
    //}

    readInfo(callback){

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
                        callback(data);
                    }.bind(this));
                }.bind(this));
        }.bind(this));
    }

    readVersion(callback){
        this.peripheral.discoverServices([this.protocol.services.control.id], function(error, services) {
            var service = services[0];
            console.log('discovered service readVersion', services);

            service.discoverCharacteristics([this.protocol.services.control.FIRMWARE_VERSION], function(error, characteristics) {
                console.log('discovered characteristic readVersion', characteristics);
                var characteristic = characteristics[0];


                characteristic.read(function(error, data) {});

                characteristic.once('read', function(data, isNotification) {
                    console.log('data found');
                    data = this.deserialise.version_t(data);
                    callback(data);
                }.bind(this));
            }.bind(this));
        }.bind(this));
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

        this._peripheral.discoverServices([this.protocol.services.control.id], function(error, services) {
        	var commandService = services[0];
            console.log('discovered commandService');
            commandService.discoverCharacteristics([this.protocol.services.control.COMMAND], function(error, characteristics) {
        		console.log('discovered Battery Level characteristic', characteristics);
        		var batteryLevelCharacteristic = characteristics[0];

        		batteryLevelCharacteristic.write(payload, false, function(error) {
                    callback(error);
        		}.bind(this));
        	});
        }.bind(this));
    }

    /**
     *
     */
    command_set_mode(callback){
        let payload = this.serialise.command_set_mode();

        this._peripheral.discoverServices([this.protocol.services.control.id], function(error, services) {
            var commandService = services[0];
            console.log('discovered commandService');
            commandService.discoverCharacteristics([this.protocol.services.control.COMMAND], function(error, characteristics) {
                console.log('discovered Battery Level characteristic', characteristics);
                var batteryLevelCharacteristic = characteristics[0];

                batteryLevelCharacteristic.write(payload, true, function(error) {
                    console.log('set command_set_mode');
                    console.log('error == ',error);
                    callback(error);
                });
            }.bind(this));
        }.bind(this));
    }

    /**
     *
     * @param neverSleep
     * @param callback
     */

    sleep_mode_t(neverSleep,callback){
        let payload = this.serialise.set_sleep_mode_t(neverSleep);

        this._peripheral.discoverServices([this.protocol.services.control.id], function(error, services) {
            var commandService = services[0];
            console.log('discovered commandService');
            commandService.discoverCharacteristics([this.protocol.services.control.COMMAND], function(error, characteristics) {
                console.log('discovered SleepMode Char', characteristics);
                var batteryLevelCharacteristic = characteristics[0];

                batteryLevelCharacteristic.write(payload, true, function(error) {
                    console.log('set set_sleep_mode');
                    console.log('error == ',error);
                    callback(error);
                });
            }.bind(this));
        }.bind(this));
    }

    unlock_mode_t(mode,callback){
        let payload = this.serialise.set_unlock_mode(mode);

        this._peripheral.discoverServices([this.protocol.services.control.id], function(error, services) {
            var commandService = services[0];
            console.log('discovered commandService');
            commandService.discoverCharacteristics([this.protocol.services.control.COMMAND], function(error, characteristics) {
                console.log('discovered unlock_mode_t', characteristics);
                var batteryLevelCharacteristic = characteristics[0];

                batteryLevelCharacteristic.write(payload, true, function(error) {
                    console.log('set unlock_mode_t');
                    console.log('error == ',error);
                    callback(error);
                });
            }.bind(this));
        }.bind(this));
    }

    user_action(callback){
        let payload = this.serialise.user_action();

        this._peripheral.discoverServices([this.protocol.services.control.id], function(error, services) {
            var commandService = services[0];
            console.log('discovered commandService');
            commandService.discoverCharacteristics([this.protocol.services.control.COMMAND], function(error, characteristics) {
                console.log('discovered Battery Level characteristic', characteristics);
                var batteryLevelCharacteristic = characteristics[0];

                batteryLevelCharacteristic.write(payload, true, function(error) {
                    console.log('set unlock_mode_t');
                    console.log('error == ',error);
                    callback(error);
                });
            }.bind(this));
        }.bind(this));
    }

    battery_info(callback){
        this.peripheral.discoverServices(['180f'], function(error, services) {
        	var batteryService = services[0];
        	console.log('discoveredBatter service', services);

        	batteryService.discoverCharacteristics(['2a19'], function(error, characteristics) {
        		console.log('discovered Battery Level characteristic', characteristics);
        		var batteryLevelCharacteristic = characteristics[0];

        		batteryLevelCharacteristic.read(function(error, data) {
        		});

        		batteryLevelCharacteristic.on('read', function(data, isNotification) {
                    callback(data.readUInt8());
        		});


        	}.bind(this));
        }.bind(this));
    }

}

module.exports = Communicator;