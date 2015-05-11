/**
 This Source Code is licensed under the MIT license. If a copy of the
 MIT-license was not distributed with this file, You can obtain one at:
 http://opensource.org/licenses/mit-license.html.
 @author: Manuel Overdijk (manueloverdijk)
 @license MIT
 @copyright Manuel Overdijk, 2015
 */

class Deserialise {
    constructor() {

        this.scaling = {
            'ORIENTATION_SCALE':            16384.0,   ///< See myohw_imu_data_t::orientation
            'ACCELEROMETER_SCALE':          2048.0,         ///< See myohw_imu_data_t::accelerometer
            'GYROSCOPE_SCALE':              16.0    ///< See myohw_imu_data_t::gyroscope
        };

        this.poses = {
                'pose_rest':           0x0000,
                'pose_fist':           0x0001,
                'pose_wave_in':        0x0002,
                'pose_wave_out':       0x0003,
                'pose_fingers_spread': 0x0004,
                'pose_double_tap':     0x0005,
                'pose_unknown':        0xffff
        };


        // identifying the myo armband on the right or left hand
        this.arm = {
            'arm_right':   0x01,
            'arm_left':    0x02,
            'arm_unknown': 0xff
        };


        // direction of the Myo armband on the forarm
        this.arm_direction = {
            'x_direction_toward_wrist':     0x01,
            'x_direction_toward_elbow':     0x02,
            'x_direction_unknown':          0xff
        };

        // result of a sync gesture
        this.sync_result = {
            'sync_failed_too_hard':  0x01 ///< Sync gesture was performed too hard.
        }



    }

    /**
     * Info data
     * @param Buffer
     * @returns {{serial_number: Buffer, unlock_pose: Number, active_classifier_type: *, active_classifier_index: *, has_custom_classifier: *, stream_indicating: *, sku: *, reserved: Buffer}}
     */

    info_t(Buffer) {
        console.log('got Buffer', Buffer);
        if (Buffer.length < 20) {
            console.log('error!');
            return null;
        }
        return {
            serial_number: Buffer.slice(0, 6),
            unlock_pose: Buffer.readUInt16LE(6),
            active_classifier_type: Buffer.readUInt8(8),
            active_classifier_index: Buffer.readUInt8(9),
            has_custom_classifier: Buffer.readUInt8(10),
            stream_indicating: Buffer.readUInt8(11),
            sku: Buffer.readUInt8(12),
            reserved: Buffer.slice(13, 7)
        }

    }

    /**
     * Version data
     * @param Buffer
     * @returns {{major: Number, minor: Number, patch: Number, hardware_rev: Number}}
     */
    version_t(Buffer) {
        if (Buffer.length < 8) {
            //error
            return null;
        }
        return {
            major: Buffer.readUInt16LE(0),
            minor: Buffer.readUInt16LE(2),
            patch: Buffer.readUInt16LE(4),
            hardware_rev: Buffer.readUInt16LE(6)
        }
    }

    /**
     * IMU data
     * @param Buffer
     * @returns {{orientation: {w: *, x: *, y: *, z: *}, accelerometer: Array, gyroscope: Array}}
     */
    imu_data_t(Buffer) {
        if (Buffer.length < 20) {
            //error
            return null;
        }
        return {
            orientation: {
                w: Buffer.readInt16LE(0)/this.scaling.ORIENTATION_SCALE,
                x: Buffer.readInt16LE(2)/this.scaling.ORIENTATION_SCALE,
                y: Buffer.readInt16LE(4)/this.scaling.ORIENTATION_SCALE,
                z: Buffer.readInt16LE(6)/this.scaling.ORIENTATION_SCALE
            },
            accelerometer: new Array([
                Buffer.readInt16LE(8)/this.scaling.ACCELEROMETER_SCALE,
                Buffer.readInt16LE(10)/this.scaling.ACCELEROMETER_SCALE,
                Buffer.readInt16LE(12)/this.scaling.ACCELEROMETER_SCALE
            ]),
            gyroscope: new Array([
                Buffer.readInt16LE(14)/this.scaling.GYROSCOPE_SCALE,
                Buffer.readInt16LE(16)/this.scaling.GYROSCOPE_SCALE,
                Buffer.readInt16LE(18)/this.scaling.GYROSCOPE_SCALE
            ])
        }

    }

    /**
     * Not yet tested
     * @param Buffer
     * @returns {*}
     */
    motion_event_t(Buffer){
        if(Buffer.length <3){
            //error
            return null;
        }
        return {
            type: Buffer.readUInt8(0), // type should be 0x00
            tap_direction: Buffer.readUInt8(1),
            tap_count: Buffer.readUInt8(2)
        }
    }

    /**
     * Classifier event
     * @param Buffer
     * @returns {*}
     */
    classifier_event_t(Buffer){
        console.log(Buffer);
        if(Buffer.length < 6){
            //error
            return null;
        }
        //event pose recieved
        if(Buffer.readUInt8(0) == 3){
            return {
                type: Buffer.readUInt8(0),
                pose: Buffer.readUInt16LE(1)
            }
        }
        return {
            type: Buffer.readUInt8(0),
            pose: Buffer.readUInt8(1),
            x_direction: Buffer.readUInt8(2), // not sure if correct position
            arm: Buffer.readUInt16LE(3),
            sync_result: Buffer.readUInt8(5)

        };

    }


    /**
     * Emg data, 4 streams
     * @param Buffer
     * @returns {*}
     */
    emg_data_t(Buffer){
        if(Buffer.length < 16){
            //error
            return null;
        }
        return {
            sample1: [
                Buffer.readInt8(0),
                Buffer.readInt8(1),
                Buffer.readInt8(2),
                Buffer.readInt8(3),
                Buffer.readInt8(4),
                Buffer.readInt8(5),
                Buffer.readInt8(6),
                Buffer.readInt8(7)
           ],
            sample2: [
                Buffer.readInt8(8),
                Buffer.readInt8(9),
                Buffer.readInt8(10),
                Buffer.readInt8(11),
                Buffer.readInt8(12),
                Buffer.readInt8(13),
                Buffer.readInt8(14),
                Buffer.readInt8(15)
            ]
        }
    }

    /**
     * Battery info
     * @param Buffer
     * @returns {{batteryLevel: Number}}
     */

    battery_t(Buffer){
        return {
            batteryLevel: Buffer.readUInt8()
        }
    }

}

module.exports = Deserialise;