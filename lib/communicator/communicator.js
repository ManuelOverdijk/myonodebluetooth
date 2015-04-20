/**
 * Created by manuel on 17-04-15.
 */
var Deserialise = require('../util/deserialise.js');
var Queue = require('promise-queue');

class Communicator{
    get peripheral(){return this._peripheral}
    set peripheral(value){this._peripheral = value}

    constructor(peripheral){
        this._peripheral = peripheral;
        this.deserialise = new Deserialise();

        this.queue = new Queue(1, Infinity);

        this.queue.add(this.testPromise()).then(function(result){
            console.log(result);
        }, function(err){
            console.log(err);
        });

        console.log(this.queue.getPendingLength());

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

        /*
         readVersion()
         .then((result)=>{
         return readInfo();
         })
         .then((result)=>{
         // ik heb nu de info
         return readWhatever();
         }).then();*/
        //
        //this.peripheral.discoverServices(['d5060001a904deb947482c7f4a124842'], function(error, services) {
        //    this.service = services[0];
        //    console.log('discovered service', services);
        //    console.log('error!! ', error);
        //
        //
        //}.bind(this));

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

    readVersion(callback){
        this.peripheral.discoverServices(['d5060001a904deb947482c7f4a124842'], function(error, services) {
            var service = services[0];
            console.log('discovered service', services);

            service.discoverCharacteristics(['d5060201a904deb947482c7f4a124842'], function(error, characteristics) {
                console.log('discovered characteristic', characteristics);
                var characteristic = characteristics[0];

                characteristic.read(function(error, data) {});

                characteristic.once('read', function(data, isNotification) {
                    console.log('data found');
                    data = this.deserialise.version_t(data);
                    callback(data);
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }



}

module.exports = Communicator;