//var Communicator = require('../communicator/communicator');
var Communicator = require('../communicator/ConcurrencyTest');
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
                //this.setMode();

                this.communicator.testConcurrency();

                //setTimeout(function(){
                //    this.readInfo(true);
                //}.bind(this),100);

                //setTimeout(function(){
                //    this.setMode()
                //}.bind(this),500);
                //
                //setTimeout(function(){
                //    this.setUnlockMode(0);
                //}.bind(this),4000);
                //
                //setTimeout(function(){
                //    this.setSleepMode(true);
                //}.bind(this),5000);
                //
                //setTimeout(function(){
                //    this.readPose(true);
                //}.bind(this),7000);
                //
                //setTimeout(function(){
                //    this.readIMU();
                //}.bind(this),6000);

                //setTimeout(function(){
                //    this.readInfo(true);
                //}.bind(this),12000);

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
                this.info = data;
                return this.info;
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
     * vibrate
     */

    vibrate(){
        if(this.isConnected()){
            this.communicator.vibrate(2,function(data){
                console.log('wrote command', data);
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
                console.log('setSleepMode', data);
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
            });
        }
    }

    /**
     * setMode
     */

    setMode(){
        if(this.isConnected()){
            this.communicator.command_set_mode(function(data){
                console.log('wrote command', data);
            });
        }
    }

    /**
     * readBatteryInfo
     */

    readBatteryInfo(){
        if(this.isConnected()){
            this.communicator.battery_info(function(data){
                this.emit('batteryInfo',data);
            });
        }
    }

    isConnected(){
        return this.connected;
    }

    setConnected(boolean){
        this.connected = boolean;
        this.emit('connected',boolean);
    }

}

module.exports = Armband;
