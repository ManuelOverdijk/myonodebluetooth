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
                this._communicator = new Communicator(this.peripheral);

                console.log('advertisement', this.peripheral.advertisement);

                this.setConnected(true);
                //this.communicator.readInfo(function(data){
                //    console.log('in the function callback', data);
                //    this.info = data;
                //    return this.info;
                //}.bind(this));
                //setTimeout(function(){
                //    this.readInfo();
                //}.bind(this),10000);
                //this.readVersion();

                this.peripheral.once('disconnect', function(){
                    console.log('myo is disconnected');
                }.bind(this))

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

    isConnected(){
        return this.connected;
    }

    setConnected(boolean){
        this.connected = boolean;
    }

}

module.exports = Armband;
