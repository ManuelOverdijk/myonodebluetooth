# MYO Bluetooth communication library

A bluetooth communication library for the myo armband, using Node and Noble and written in Javascript. **It doesn't require the Myo Connect software or the Myo SDK**, but communicates directly over bluetooth by using the released bluetooth spec. 

For a demo build with this library, see https://www.youtube.com/watch?v=R19rKXpttjY The demo application will be published later.

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
        	this.initStart();
    	} else {
    	  // armband disconnected
   		}

	});
    
    // Armband receives the ready event when all services/characteristics are discovered and emg/imu/classifier mode is enabled
    armband.on('ready', function(){
    
    	// register for events
        armband.on('batteryInfo',function(data){
        	console.log('BatteryInfo: ', data.batteryLevel);
        });
        
        // read or write data from/to the Myo
        armband.readBatteryInfo();
    });
    
   armband.connect();
});
```

## Supported features
### Agent

Get notified of newly discovered Myo armbands.

``` javascript
Agent.on('discovered', function(armband){
 ...
});
```

Get notified of bluetooth adapter state changes, see Noble for more information.

``` javascript
Agent.on('stateChange', function(state){
 ...
});
```


### Armband

Discover all services/characteristics and enable the EMG, IMU and Classifier Characteristics to notify/indicate the communicator of new events. The Myo will also be set in no sleep mode and unlocked until disconnection.

``` javascript
Armband.initStart();
```

Wait for the ready event after calling initStart(), after which the Myo is ready to read/write and notify characteristics. 

```javascript
Armband.on('ready', function(){
...    
})
```
#### Reading characteristics
##### EMG data
Get notified of EMG data (which the Myo sends after calling ```initStart()```)

```javascript
/* 
data = {
	sample1: Array[8],
	sample2: Array[8]
} 
*/
Armband.on('emg', function(data){

 	...
});
```

##### Orientation data

Get notified of orientation data (which the Myo sends after calling ```initStart()```)

```javascript
/* 
data = {
	w, x, y, z
} 
*/
Armband.on('orientation', function(data){
 	...
});
```

##### Accelerometer data

Get notified of accelerometer data (which the Myo sends after calling ```initStart()```)

```javascript
//data = Array[3]
Armband.on('accelerometer', function(data){
 	...
});
```

##### Gyroscope data

Get notified of gyroscope data (which the Myo sends after calling ```initStart()```)

```javascript
//data = Array[3]
Armband.on('gyroscope', function(data){
 	...
});
```

##### Pose events

Get notified of pose events (which the Myo sends after calling ```initStart()```)

```javascript
/* data = {
	type: rest | fist | waveIn | waveOut | spread | tap | unkown
} */
Armband.on('pose', function(data){
 	...
});
```

##### Sync events

Get notified of sync events (which the Myo sends after calling ```initStart()```)

```javascript
// Synced true | false | failed
Armband.on('sync', function(Boolean){
 	...
});
```

##### Unlock events

Get notified of unlock events (which the Myo sends after calling ```initStart()```)

```javascript
// Unlocked true | false
Armband.on('unlocked', function(Boolean){
 	...
});
```

##### Read info

Read the Myo info characteristic

```javascript
Armband.on('info', function(data){
 	...
});
Armband.readInfo();
```

##### Read version

Read the Myo version characteristic

```javascript
Armband.on('version', function(data){
 	...
});
Armband.readVersion();
```

##### Read batteryInfo

Read the Myo batteryinfo characteristic

```javascript
// data: { batteryLevel }
Armband.on('batteryInfo', function(data){
 	...
});
Armband.readBatteryInfo();
```

#### Writing characteristics 

Listen for the command event after executing a write command to the Myo to be notified on results/success

```javascript
// data = {type, data} 
Armband.on('command', function(data){
 ...
});
```

Set the sleep mode

```javascript
Armband.setSleepMode(Boolean); // Never sleep: true | false
```

Set the unlock mode

```javascript

// mode:   0 -> unlock now and relock after lock command is recieved
//         1 -> re-lock immediatly
//         2 ->  unlock now and relock after a fixed timeout

Armband.setUnlockMode(mode);
```

Set the user action mode, to notify the user that an action has been recognized / confirmed.
```javascript
Armband.setUserAction();
```

Set the IMU/EMG/Classifier modes to notify/indicate the communicator for data events
```javascript
Armband.setMode();
```

Set the vibrate command
```javascript
// mode:   0 -> Do not vibrate.
//         1 -> Vibrate for a short amount of time
//         2 -> Vibrate for a medium amount of time
//		   3 -> Vibrate for a long amount of time

Armband.vibrate(mode)
```

## TODO
* Normalize the gyroscope/accelerometer data, calculate Euler Angles
* Implement extended vibrate command
* Refactor initStart service/characteristic discovery
* Refactor some functions of the deserialisation class
* Fix the unresponsive-classifier state which Myo enters after unsyncing while emitting Classifier events over Bluetooth

