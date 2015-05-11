/**
 This Source Code is licensed under the MIT license. If a copy of the
 MIT-license was not distributed with this file, You can obtain one at:
 http://opensource.org/licenses/mit-license.html.
 @author: Manuel Overdijk (manueloverdijk)
 @license MIT
 @copyright Manuel Overdijk, 2015
 */

var Communicator = require('../communicator/communicator');
//var Communicator = require('../communicator/ConcurrencyTest');
var EventEmitter = require("events").EventEmitter;

class Armband extends EventEmitter {

    get peripheral(){return this._peripheral}
    set peripheral(value){this._peripheral = value}

    get UUID(){return this.uuid;}
    set UUID(value){this.uuid = UUID}

    get communicator(){return this._communicator}
    set communicator(value){this._communicator = value}

    constructor(peripheral){
        super();
        this._peripheral = peripheral;
        this._communicator = new Communicator(peripheral);

        // automatically connect the armband on creation;
        this.connect();

    }

    /**
     *
     */
    connect(){
        if (this.peripheral.state === 'connected') {
            this.setConnected(true);
        } else {
            this.peripheral.connect();
            this.setConnected(false);

            this.peripheral.on('connect', function(){

                this.uuid = this.peripheral.uuid;

                console.log('advertisement', this.peripheral.advertisement);
                this.setConnected(true);

                // start notifying Emg, IMU and Classifier characteristics
                this.initStart();

            }.bind(this));
        }

    }

    /**
     * Start the communication and handle EventData/IMUData
     */
    initStart(){
        if(this.isConnected()){
            this.communicator.initStart(function(eventData){

                if(eventData.emgData){
                    this.emit('emg', eventData);
                    console.log('eventData.emg');
                }

                // IMU data
                if(eventData.orientation){
                    // TODO: Sample EventData
                    this.emit('orientation',eventData.orientation)
                    console.log('eventData.imu');
                }
                if(eventData.accelerator){
                    // TODO: Sample EventData
                    this.emit('accelerator',eventData.accelerator)
                }
                if(eventData.gyroscope){
                    // TODO: Sample EventData
                    this.emit('gyroscope',eventData.gyroscope)
                }
                // Classifier data
                else if (eventData.type) {
                    if (eventData.type == 3) {
                        console.log('eventData.pose');
                        switch(eventData.pose){
                            case 0:
                                this.emit('pose',{type:'rest'});
                                break;
                            case 1:
                                this.emit('pose',{type:'fist'});
                                break;
                            case 2:
                                this.emit('pose', {type:'waveIn'});
                                break;
                            case 3:
                                this.emit('pose', {type:'waveOut'});
                                break;
                            case 4:
                                this.emit('pose', {type:'spread'});
                                break;
                            case 5:
                                this.emit('pose', {type:'tap'});
                                break;
                            case 255:
                                this.emit('pose',{type:'unkown'});
                        }
                    }
                    else if (eventData.type == 1) {
                        console.log('arm synced!');
                        this.emit('sync', true);
                    }
                    // arm unsynced
                    else if (eventData.type == 2) {
                        console.log('arm unsynced');
                        this.emit('sync', false);
                    }
                }
            }.bind(this));
        }
    }

    /**
     * readInfo
     */
    readInfo(){
        if(this.isConnected()){
            this.communicator.readInfo(function(data){
                console.log('in the function callback', data);
                this.emit('info',data);
            }.bind(this));
        }
    }

    /**
     * readAdvertisement
     * @returns {advertisement|*|{localName, txPowerLevel, serviceUuids, manufacturerData, serviceData}}
     */
    readAdvertisement(){
        if(this.isConnected()){
            return this.peripheral.advertisement;
        }
    }

    /**
     * readVerison
     */
    readVersion(){
        if(this.isConnected()){
            this.communicator.readVersion(function(data){
                this.emit('version', data);
            }.bind(this));
        }
    }

    /**
     * readPose
     */

    readPose(){
        if(this.isConnected()){
            this.communicator.readClassifier(function(data){
               this.emit('classifier', data);
            }.bind(this));
        }
    }

    /**
     * readIMU
     */

    readIMU(){
        if(this.isConnected()){
            this.communicator.readIMU(function(data){
                // needs to be split in different data sections here
                this.emit('imu', data);
            }.bind(this));
        }
    }

    /**
     * write vibrate command to Myo
     * @param mode
     */
    vibrate(mode){
        if(this.isConnected()){
            this.communicator.vibrate(mode,function(data){
                console.log('wrote command', data);
                this.emit('command', {type: 'vibrate', data: data});
            });
        }
    }

    /**
     * setSleepMode
     * @param neverSleep {Boolean}
     */

    setSleepMode(neverSleep){
        if(this.isConnected()){
            this.communicator.sleep_mode_t(neverSleep,function(data){
                this.emit('command', {type: 'sleepMode', data: data});
            });
        }
    }

    /**
     * setUnlockMode
     * @param mode
     */

    setUnlockMode(mode){
        if(this.isConnected()){
            this.communicator.unlock_mode_t(mode,function(data){
                console.log('setUnlockMOde', data);
                this.emit('command', {type: 'unlockMode', data: data});
            });
        }
    }

    /**
     * setUserAction
     */

    setUserAction(){
        if(this.isConnected()){
            this.communicator.user_action(function(data){
                console.log('setUserAction', data);
                this.emit('command', {type: 'userAction', data: data});
            });
        }
    }

    /**
     * setMode
     */
    // TODO: Implement modes
    setMode(){
        if(this.isConnected()){
            this.communicator.command_set_mode(function(data){
                console.log('wrote command', data);
                this.emit('command', {type: 'setMode', data: data});
            });
        }
    }

    /**
     * readBatteryInfo
     */

    readBatteryInfo(){
        if(this.isConnected()){
            this.communicator.battery_info(function(data){
                this.emit('batteryInfo', data);
            });
        }
    }

    isConnected(){
        return this.connected;
    }

    setConnected(boolean){
        this.connected = boolean;
        this.emit('connect',boolean);
    }

}

module.exports = Armband;
