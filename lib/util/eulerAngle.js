/**
 * Created by manuel on 18-05-15.
 * Based on https://github.com/logotype/MyoJS/blob/master/src/Vector3.js
 */


class eulerAngle {
    constructor(x, y, z, w){
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;

        this.pitch = this.setPitch();
        this.roll = this.setRoll();
        this.yaw = this.setYaw();
    }

    getAngles(){
        return {
            pitch: this.pitch,
            yaw: this.yaw,
            roll: this.roll
        }
    }

    /**
     * The pitch angle in radians.
     * Pitch is the angle between the negative z-axis and the projection
     * of the vector onto the y-z plane. In other words, pitch represents
     * rotation around the x-axis. If the vector points upward, the
     * returned angle is between 0 and pi radians (180 degrees); if it
     * points downward, the angle is between 0 and -pi radians.
     *
     * @return {number} The angle of this vector above or below the horizon (x-z plane).
     *
     */
    setPitch(){
        return Math.atan2(this.y, -this.z);
    }

    /**
     * The yaw angle in radians.
     * Yaw is the angle between the negative z-axis and the projection
     * of the vector onto the x-z plane. In other words, yaw represents
     * rotation around the y-axis. If the vector points to the right of
     * the negative z-axis, then the returned angle is between 0 and pi
     * radians (180 degrees); if it points to the left, the angle is
     * between 0 and -pi radians.
     *
     * @return {number} The angle of this vector to the right or left of the negative z-axis.
     *
     */
    setYaw(){
        return Math.atan2(this.x, -this.z);
    }

    /**
     * The roll angle in radians.
     * Roll is the angle between the y-axis and the projection of the vector
     * onto the x-y plane. In other words, roll represents rotation around
     * the z-axis. If the vector points to the left of the y-axis, then the
     * returned angle is between 0 and pi radians (180 degrees); if it
     * points to the right, the angle is between 0 and -pi radians.
     *
     * Use this function to get roll angle of the plane to which this vector
     * is a normal. For example, if this vector represents the normal to
     * the palm, then this function returns the tilt or roll of the palm
     * plane compared to the horizontal (x-z) plane.
     *
     * @return {number} The angle of this vector to the right or left of the y-axis.
     *
     */
     setRoll(){
        return Math.atan2(this.x, -this.y);
    }


}

module.exports = eulerAngle;