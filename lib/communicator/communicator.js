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

        //this.queue = new Queue(1, Infinity);
        //
        //this.queue.add(this.testPromise()).then(function(result){
        //    console.log(result);
        //}, function(err){
        //    console.log(err);
        //});
        //
        //console.log(this.queue.getPendingLength());

        //new Promise((resolve, reject)=>{
        //
        //        if(false){
        //            resolve('it worked!');
        //        } else {
        //            reject("it did not work");
        //        }
        //}).then((result)=>{
        //        console.log(result);
        //    },
        //    (err)=>{
        //        console.log(err);
        //    }
        //);


        //this.battery_info(function(result){
        //    console.log(result);
        //});


        return null;

    }

    testPromise(){
        return function(){
            if(true){
                resolve('it worked!');
            } else {
                reject("it did not work");
            }
        }
    }

    readInfo(callback){
        this.peripheral.discoverServices(['d5060001a904deb947482c7f4a124842'], function(error, services) {
            var service = services[0];
            console.log('discovered service', services);
            this.service.discoverCharacteristics(['d5060101a904deb947482c7f4a124842'], function (error, characteristics) {
                console.log('discovered characteristic', characteristics);
                var characteristic = characteristics[0];

                characteristic.read(function (error, data) {
                });

                characteristic.once('read', function (data, isNotification) {
                    console.log('data found', data);
                    data = this.deserialise.info_t(data);
                    callback(data);
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }

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
                var batteryLevelCharacteristic = characteristics[0];

                //batteryLevelCharacteristic.notify(function(error, data) {
                //    console.log('notify!', data);
                //});
                batteryLevelCharacteristic.notify(true, function(error){
                    console.log('error happend classifier', error);
                });

                batteryLevelCharacteristic.on('notify', function(data, isNotification) {
                    //data = this.deserialise.version_t(data);
                    console.log('notify classifier',data);
                    console.log('is notification',isNotification);
                    //callback(data);
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