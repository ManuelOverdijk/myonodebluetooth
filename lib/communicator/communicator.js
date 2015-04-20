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

    readInfo(callback){

        if(!this.service){
            this.peripheral.discoverServices(['D5060001A904DEB947482C7F4A124842'], function(error, services) {
                console.log('discovered service readInfo', services);
                this.service = services[0];
            }.bind(this));
        }


        setTimeout(function(){
            this.service.discoverCharacteristics(['d5060101a904deb947482c7f4a124842'], function(error, characteristics) {
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
        }.bind(this),4000);

        setTimeout(function(){
            this.service.discoverCharacteristics(['d5060201a904deb947482c7f4a124842'], function(error, characteristics) {
                console.log('discovered characteristic readVersion', characteristics);
                var batteryLevelCharacteristic = characteristics[0];

                batteryLevelCharacteristic.read(function(error, data) {
                    console.log('read!', data);
                });

                batteryLevelCharacteristic.on('read', function(data, isNotification) {
                    console.log('data found readVersion');
                    data = this.deserialise.version_t(data);
                    callback(data);
                }.bind(this));
            }.bind(this));
        }.bind(this), 4020);


    }

    readVersion(callback){
        this.peripheral.discoverServices(['d5060001a904deb947482c7f4a124842'], function(error, services) {
            var service = services[0];
            console.log('discovered service readVersion', services);

            service.discoverCharacteristics(['d5060201a904deb947482c7f4a124842'], function(error, characteristics) {
                console.log('discovered characteristic readVersion', characteristics);
                var batteryLevelCharacteristic = characteristics[0];

                batteryLevelCharacteristic.read(function(error, data) {
                    console.log('read!', data);
                });

                batteryLevelCharacteristic.on('read', function(data, isNotification) {
                    data = this.deserialise.version_t(data);
                    callback(data);
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }

    /**
     *
     */
    readClassifier(callback){
        this.peripheral.discoverServices(['D5060003A904DEB947482C7F4A124842'], function(error, services) {
            var service = services[0];
            console.log('discovered service readIMU', services);

            service.discoverCharacteristics(['D5060103A904DEB947482C7F4A124842'], function(error, characteristics) {
                console.log('discovered characteristic readIMU', characteristics);
                var batteryLevelCharacteristic = characteristics[0];

                //batteryLevelCharacteristic.notify(function(error, data) {
                //    console.log('notify!', data);
                //});
                batteryLevelCharacteristic.notify(true, function(error){
                    console.log('error happend', error);
                });

                batteryLevelCharacteristic.on('notify', function(data, isNotification) {
                    //data = this.deserialise.version_t(data);
                    console.log('notify',data);
                    callback(data);
                }.bind(this));

                batteryLevelCharacteristic.on('read', function(data, isNotification){
                    console.log('got data', data);
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
        this.peripheral.discoverServices(['D5060002A904DEB947482C7F4A124842'], function(error, services) {
            var service = services[0];
            console.log('discovered service readIMU', services);

            service.discoverCharacteristics(['D5060402A904DEB947482C7F4A124842'], function(error, characteristics) {
                console.log('discovered characteristic readIMU', characteristics);
                var batteryLevelCharacteristic = characteristics[0];

                //batteryLevelCharacteristic.notify(function(error, data) {
                //    console.log('notify!', data);
                //});
                batteryLevelCharacteristic.notify(true, function(error){
                    console.log('error happend', error);
                });

                batteryLevelCharacteristic.on('notify', function(data, isNotification) {
                    //data = this.deserialise.version_t(data);
                    console.log('notify',data);
                    callback(data);
                }.bind(this));

                batteryLevelCharacteristic.on('read', function(data, isNotification){
                    console.log('got data', this.deserialise.imu_data_t(data));
                    console.log('isNotification', isNotification);
                }.bind(this)); //
            }.bind(this));
        }.bind(this));
    }

    /**
     *
     */
    vibrate(time, callback){
        let payload = this.serialise.vibrate_t(time);

        this._peripheral.discoverServices(['d5060001a904deb947482c7f4a124842'], function(error, services) {
        	var commandService = services[0];
            console.log('discovered commandService');
            commandService.discoverCharacteristics(['d5060401a904deb947482c7f4a124842'], function(error, characteristics) {
        		console.log('discovered Battery Level characteristic', characteristics);
        		var batteryLevelCharacteristic = characteristics[0];

        		batteryLevelCharacteristic.write(payload, false, function(error) {
                    callback(error);
        		});
        	});
        });
    }

    /**
     *
     */
    command_set_mode(callback){
        let payload = this.serialise.command_set_mode();

        this._peripheral.discoverServices(['d5060001a904deb947482c7f4a124842'], function(error, services) {
            var commandService = services[0];
            console.log('discovered commandService');
            commandService.discoverCharacteristics(['d5060401a904deb947482c7f4a124842'], function(error, characteristics) {
                console.log('discovered Battery Level characteristic', characteristics);
                var batteryLevelCharacteristic = characteristics[0];

                batteryLevelCharacteristic.write(payload, true, function(error) {
                    console.log('set command_set_mode');
                    console.log('error == ',error);
                    callback(error);
                });
            });
        });
    }

    /**
     *
     * @param neverSleep
     * @param callback
     */

    sleep_mode_t(neverSleep,callback){
        let payload = this.serialise.set_sleep_mode_t(neverSleep);

        this._peripheral.discoverServices(['d5060001a904deb947482c7f4a124842'], function(error, services) {
            var commandService = services[0];
            console.log('discovered commandService');
            commandService.discoverCharacteristics(['d5060401a904deb947482c7f4a124842'], function(error, characteristics) {
                console.log('discovered Battery Level characteristic', characteristics);
                var batteryLevelCharacteristic = characteristics[0];

                batteryLevelCharacteristic.write(payload, true, function(error) {
                    console.log('set command_set_mode');
                    console.log('error == ',error);
                    callback(error);
                });
            });
        });
    }

    unlock_mode_t(mode,callback){
        let payload = this.serialise.set_unlock_mode(mode);

        this._peripheral.discoverServices(['d5060001a904deb947482c7f4a124842'], function(error, services) {
            var commandService = services[0];
            console.log('discovered commandService');
            commandService.discoverCharacteristics(['d5060401a904deb947482c7f4a124842'], function(error, characteristics) {
                console.log('discovered Battery Level characteristic', characteristics);
                var batteryLevelCharacteristic = characteristics[0];

                batteryLevelCharacteristic.write(payload, true, function(error) {
                    console.log('set unlock_mode_t');
                    console.log('error == ',error);
                    callback(error);
                });
            });
        });
    }

    user_action(callback){
        let payload = this.serialise.user_action();

        this._peripheral.discoverServices(['d5060001a904deb947482c7f4a124842'], function(error, services) {
            var commandService = services[0];
            console.log('discovered commandService');
            commandService.discoverCharacteristics(['d5060401a904deb947482c7f4a124842'], function(error, characteristics) {
                console.log('discovered Battery Level characteristic', characteristics);
                var batteryLevelCharacteristic = characteristics[0];

                batteryLevelCharacteristic.write(payload, true, function(error) {
                    console.log('set unlock_mode_t');
                    console.log('error == ',error);
                    callback(error);
                });
            });
        });
    }



}

module.exports = Communicator;