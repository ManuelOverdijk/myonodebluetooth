/**
 * Created by manuel on 15-04-15.
 */


class Serialise {
    constructor() {

        this.emg_mode_t = {
            'emg_mode_none' :           0x00, ///< Do not send EMG data.
            'emg_mode_send_emg' :       0x02, ///< Send filtered EMG data.
            'emg_mode_send_emg_raw':    0x03 ///< Send raw (unfiltered) EMG data.
        };

        this.imu_mode_t = {
            'imu_mode_none':        0x00, ///< Do not send IMU data or events.
            'imu_mode_send_data':   0x01, ///< Send IMU data streams (accelerometer, gyroscope, and orientation).
            'imu_mode_send_events': 0x02, ///< Send motion events detected by the IMU (e.g. taps).
            'imu_mode_send_all':    0x03, ///< Send both IMU data streams and motion events.
            'imu_mode_send_raw':    0x04 ///< Send raw IMU data streams.
        };

        this.classifier_mode_t = {
            'classifier_mode_disabled': 0x00, ///< Disable and reset the internal state of the onboard classifier.
            'classifier_mode_enabled':  0x01 ///< Send classifier events (poses and arm events).
        };

        this.unlock_type_t = {
            'unlock_lock':      0x00, ///< Re-lock immediately.
            'unlock_timed':     0x01, ///< Unlock now and re-lock after a fixed timeout.
            'unlock_hold':      0x02 ///< Unlock now and remain unlocked until a lock command is received.

        };

    }

    command_set_mode(){

        let emg_mode = this.emg_mode_t.emg_mode_send_emg;
        let imu_mode = this.imu_mode_t.imu_mode_send_all;
        let classifier_mode = this.classifier_mode_t.classifier_mode_enabled;

        return new Buffer([0x01,3,emg_mode,imu_mode,classifier_mode]);
    }

    vibrate_t(time){
        if(time == 1) return new Buffer([0x03,1,0x01]);
        if(time == 2) return new Buffer([0x03,1,0x02]);
        if(time == 3) return new Buffer([0x03,1,0x03]);
        return new Buffer([0x03,1,0x00]);

    }

    set_sleep_mode_t(never_sleep) {
        if (never_sleep) return new Buffer([0x09, 1, 0x01]);
        return new Buffer([0x09, 1, 0x00]);

    }

    set_unlock_mode(mode){
        if(mode == 1)  return new Buffer([0x0a,1,this.unlock_type_t.unlock_lock]);
        if(mode == 2)  return new Buffer([0x0a,1,this.unlock_type_t.unlock_timed]);
        return new Buffer([0x0a,1,this.unlock_type_t.unlock_hold]);
    }

    user_action(){
        return new Buffer([0x0b, 1, 0x00]);
    }

    command_header_t(){

    }

}
module.exports = Serialise;