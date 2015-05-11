/**
 This Source Code is licensed under the MIT license. If a copy of the
 MIT-license was not distributed with this file, You can obtain one at:
 http://opensource.org/licenses/mit-license.html.
 @author: Manuel Overdijk (manueloverdijk)
 @license MIT
 @copyright Manuel Overdijk, 2015
 */
"use strict"

var MyoProtocol = require('./myoProtocol');
var noble = require('noble');
var Armband = require('./armband/armband');
var EventEmitter = require("events").EventEmitter;

class Agent extends EventEmitter{

    get armbands(){return this._armbands}
    set armbands(value){this._armbands = value}

    constructor(){
        this.myoProtocol = new MyoProtocol();
        this._armbands = [];
        this.startDiscover();
    }

    /**
     * startDiscover
     * Start discovering MYO peripherals
     */

    startDiscover(){
        noble.on('stateChange', function(state){
            this.emit('stateChange', state);

            /* Start discovering Myo peripherals */
            if (state === 'poweredOn') {
                this.discover(this.myoProtocol.services.control.id);
            } else {

                /* Set all armbands to not connected */
                for(let armband of this.armbands){
                    armband.setConnected(false);
                }
                throw new Error('Bluetooth Adapter not found');

            }
        }.bind(this));
    }

    /**
     * Discovers peripherals which advertise given UUID
     * @param UUID
     */
    discover(UUID){
        console.log('start scanning for MYO devices');

        noble.startScanning([UUID],false);

        noble.on('discover', function (peripheral) {
            let armband = new Armband(peripheral);
            this._armbands.push(armband);
            this.emit('discovered', armband);
        }.bind(this));
    }

    /**
     * stopScanning
     */
    stopScanning(){
        noble.stopScanning();
    }
}

module.exports = Agent;