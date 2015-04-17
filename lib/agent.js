var MyoProtocol = require('./myoProtocol.js');
var noble = require('noble');
var Armband = require('./armband/armband');

class Agent{

    get armbands(){return this._armbands}
    set armbands(value){this._armbands = value}

    constructor(){
        this.myoProtocol = new MyoProtocol();
        this._armbands = [];
        this.startDiscover();
    }

    startDiscover(){
        noble.on('stateChange', function(state){
            if (state === 'poweredOn') {
                this.discover(this.myoProtocol.services.control.id);
            } else {
                console.log('Adapter not found');
                for(let armband of this.armbands){
                    armband.setConnected(false);
                }
            }
        }.bind(this));
    }

    /**
     * Discovers peripheral's which advertise given UUID
     * @param UUID
     */
    discover(UUID){
        console.log('start scanning for MYO devices');
        noble.startScanning([UUID]);

        /**
         *
         */
        noble.on('discover', function (peripheral) {
            console.log(peripheral);

            this._armbands.push(new Armband(peripheral));
            noble.stopScanning();
            this.connect(this._armbands[0]);
        }.bind(this));
    }

    connect(armband){
        console.log('trying to connect the armband');
        armband.connect();

    }

}

new Agent();

module.exports = Agent;