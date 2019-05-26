import ray from "./ray";
import vec3 from "./vec3";

//const lowerLeftCorner: vec3 = new vec3([-2, -1, -1]);
//const horizontal: vec3 = new vec3([4, 0, 0]);
//const vertical: vec3 = new vec3([0, 2, 0]);
//const origin: vec3 = new vec3([0, 0, 0]); // camera origin is at 0, 0, 0

export default class camera {

    private theta: number;
    private halfHeight: number;
    private halfWidth: number;
    private lowerLeftCorner: vec3;
    private horizontal: vec3;
    private vertical: vec3;
    private origin: vec3;

    constructor(vfov: number, aspect: number) {
        this.theta = vfov * Math.PI/180;
        this.halfHeight = Math.tan(this.theta/2);
        this.halfWidth = aspect * this.halfHeight;

        this.lowerLeftCorner = new vec3([-this.halfWidth, -this.halfHeight, -1]);
        this.horizontal = new vec3([2 * this.halfWidth, 0, 0]);
        this.vertical = new vec3([0, 2 * this.halfHeight, 0]);
        this.origin = new vec3([0, 0, 0]);
    }
    /**
     * Returns a ray pointing to a screen pixel
     * 
     * @param u - vector moving camera ray horizontally
     * @param v - vector moving camera ray vertically
     */
    getRay(u: number, v: number): ray {
        return new ray(this.origin, this.lowerLeftCorner.copy().add(this.horizontal.copy().multiply(u)).add(this.vertical.copy().multiply(v)).subtract(this.origin));
    }
}