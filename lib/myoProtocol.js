/**
 This Source Code is licensed under the MIT license. If a copy of the
 MIT-license was not distributed with this file, You can obtain one at:
 http://opensource.org/licenses/mit-license.html.
 @author: Manuel Overdijk (manueloverdijk)
 @license MIT
 @copyright Manuel Overdijk, 2015
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
                id: "D5060002A904DEB947482C7F4A124842",
                IMU_DATA : "D5060402A904DEB947482C7F4A124842"
            },
            classifier: {
                id: "D5060003A904DEB947482C7F4A124842",
                classifierEvent: "D5060103A904DEB947482C7F4A124842"
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