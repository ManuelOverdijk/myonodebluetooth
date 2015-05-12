# MYO Bluetooth communication library

A bluetooth communication library for the myo armband, using Node and Noble and written in Javascript. **It doesn't require the Myo Connect software or the Myo SDK**, but communicates directly over bluetooth by using the released bluetooth spec. 

## Install
This library uses [Noble](https://github.com/sandeepmistry/noble) v0.3.8, which currently only supports Mac OS X and Linux. Checkout Noble to find out it's prerequisites and installation guidance. 

I have not yet published this repository on npm, but will do eventually. Install via npm:

``` npm install git://github.com/manueloverdijk/myonodebluetooth.git ```

As the project is written with some of the new javascript features of ES6, compile the project with traceur or use [io.js](https://github.com/iojs/io.js) with the following flags:

``` --use_strict --es_staging --harmony_classes  --harmony_arrow_functions```

## Usage
 
The following is an example which starts discovering myo armbands and connects to the first available armband. Wait for the ```ready event``` after calling ```initStart()``` before reading and writing to characteristics of the Myo.

``` javascript
var MyoBluetooth  = require('MyoNodeBluetooth');
var MyoAgent = new MyoBluetooth();


MyoAgent.on('discovered', function(armband){
    armband.on('connect', function(connected){
    
    	// armband connected succesfully
        if(connected){
            // discover all services/characteristics and enable emg/imu/classifier chars
        	this.armband.initStart();
    	} else {
    	  // armband disconnected
          ...
   		}

	});
    
    // Armband receives the ready event when all services/characteristics are discovered and emg/imu/classifier mode is enabled
    armband.on('ready', function(){
    
    	// register for events
        armband.on('batteryInfo',function(data){
        	console.log('BatteryInfo: ', data.batteryLevel);
        }
        
        // read or write data from/to the Myo
        armband.readBatteryInfo();
    }
    
   armband.connect();
});
```