/**
 * Created by manuel on 17-04-15.
 */
var Deserialise = require('../util/deserialise.js');

class Communicator{
    get peripheral(){return this._peripheral}
    set peripheral(value){this._peripheral = value}

    constructor(peripheral){
        this._peripheral = peripheral;
        this.deserialise = new Deserialise();

    }

    readInfo(callback){
        this.peripheral.discoverServices(['D5060001A904DEB947482C7F4A124842'], function(error, services) {
        	var service = services[0];
        	console.log('discovered service', services);

        	service.discoverCharacteristics(['d5060101a904deb947482c7f4a124842'], function(error, characteristics) {
        		console.log('discovered characteristic', characteristics);
        		var batteryLevelCharacteristic = characteristics[0];

        		batteryLevelCharacteristic.read(function(error, data) {
                    console.log('read!', data);
                });

        		batteryLevelCharacteristic.on('read', function(data, isNotification) {
                    console.log('data found', data);
                    data = this.deserialise.info_t(data);
                    callback(data);
        		}.bind(this));
        	}.bind(this));
        }.bind(this));
    }

    readVersion(callback){
        this.peripheral.discoverServices(['d5060001a904deb947482c7f4a124842'], function(error, services) {
            var service = services[0];
            console.log('discovered service', services);

            service.discoverCharacteristics(['d5060201a904deb947482c7f4a124842'], function(error, characteristics) {
                console.log('discovered characteristic', characteristics);
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



}

module.exports = Communicator;