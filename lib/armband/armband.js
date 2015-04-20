var Communicator = require('../communicator/communicator');

class Armband {

    get peripheral(){return this._peripheral}
    set peripheral(value){this._peripheral = value}

    get UUID(){return this.uuid;}
    set UUID(value){this.uuid = UUID}

    get communicator(){return this._communicator}
    set communicator(value){this._communicator = value}

    constructor(peripheral){
        this._peripheral = peripheral;
        this._communicator = new Communicator(peripheral);

        // automatically connect the armband on creation;
        this.connect();

    }

    connect(){
        if (this.peripheral.state === 'connected') {
            console.log('WARN: Device already connected');
            this.setConnected(true);
        }
        else {
            this.peripheral.connect();
            this.setConnected(false);

            this.peripheral.on('connect', function(){

                console.log('connected!');
                this.uuid = this.peripheral.uuid;

                console.log('advertisement', this.peripheral.advertisement);

                this.setConnected(true);
                this.setMode();

                setTimeout(function(){
                    this.readIMU(true);
                }.bind(this),4000);

            }.bind(this));
        }

    }

    readInfo(){
        if(this.isConnected()){
            this.communicator.readInfo(function(data){
                console.log('in the function callback', data);
                this.info = data;
                return this.info;
            }.bind(this));
        }
    }

    readAdvertisement(){
        if(this.isConnected()){
            return this.peripheral.advertisement;
        }
    }

    readVersion(){
        if(this.isConnected()){
            this.communicator.readVersion(function(data){
                console.log('in the function callback', data);
                this.version = data;
                return this.version;
            }.bind(this));
        }
    }

    readPose(){
        if(this.isConnected()){
            this.communicator.readClassifier(function(data){
                console.log('in the function callback', data);
            }.bind(this));
        }
    }

    readIMU(){
        if(this.isConnected()){
            this.communicator.readIMU(function(data){
                console.log('in the function callback', data);
            }.bind(this));
        }
    }

    vibrate(){
        if(this.isConnected()){
            this.communicator.vibrate(2,function(data){
                console.log('wrote command', data);
            });
        }
    }

    setSleepMode(neverSleep){
        if(this.isConnected()){
            this.communicator.sleep_mode_t(neverSleep,function(data){
                console.log('setSleepMode', data);
            });
        }
    }

    setUnlockMode(mode){
        if(this.isConnected()){
            this.communicator.unlock_mode_t(mode,function(data){
                console.log('setUnlockMOde', data);
            });
        }
    }

    setUserAction(){
        if(this.isConnected()){
            this.communicator.user_action(function(data){
                console.log('setUserAction', data);
            });
        }
    }

    setMode(){
        if(this.isConnected()){
            this.communicator.command_set_mode(function(data){
                console.log('wrote command', data);
            });
        }
    }

    readBatteryInfo(){
        if(this.isConnected()){
            this.communicator.battery_info(function(data){
                console.log('battery info', data);
            });
        }
    }

    isConnected(){
        return this.connected;
    }

    setConnected(boolean){
        this.connected = boolean;
    }

}

module.exports = Armband;
