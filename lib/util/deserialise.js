
/**
 * Created by manuel on 15-04-15.
 */

class Deserialise {
    constructor() {

    }

    /**
     *
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
            active_classifier_type: Buffer.readUInt8[8],
            active_classifier_index: Buffer.readUInt8[9],
            has_custom_classifier: Buffer.readUInt8[10],
            stream_indicating: Buffer.readUInt8[11],
            sku: Buffer.readUInt8[12],
            reserved: Buffer.slice(13, 7)
        }

    }

    /**
     *
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
     *
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
                w: Buffer.readInt16LE[0],
                x: Buffer.readInt16LE[2],
                y: Buffer.readInt16LE[4],
                z: Buffer.readInt16LE[6]
            },
            accelerometer: new Array([Buffer.readInt16LE[8], Buffer.readInt16LE[10], Buffer.readInt16LE[12]]),
            gyroscope: new Array([Buffer.readInt16LE[14], Buffer.readInt16LE[16], Buffer.readInt16LE[18]])
        }

    }
}

module.exports = Deserialise;