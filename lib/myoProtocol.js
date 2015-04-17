/**
 * Created by manuel on 15-04-15.
 */
class MyoProtocol {

    get services(){ return this._services}
    set serivices(services){this._services = services};

    constructor(){

        this._services = {
            control: {
                id: "D5060001A904DEB947482C7F4A124842",
                MYO_INFO: "d5060101a904deb947482c7f4a124842",
                FIRMWARE_VERSION: "d5060201a904deb947482c7f4a124842",
                COMMAND: "d5060401a904deb947482c7f4a124842"
            },
            imuData: {
                id: "1",
                IMU_DATA : "1"
            },
            battery: {
                id: "180f",
                BATTERY_LEVEL: "2a1"
            },
            genericAccess: {
                id: "1800",
                DEVICE_NAME: "2a00"
            }
        }

    }
}

module.exports = MyoProtocol;