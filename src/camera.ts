import ray from "./ray";
import vec3 from "./vec3";

const lowerLeftCorner: vec3 = new vec3([-2, -1, -1]);
const horizontal: vec3 = new vec3([4, 0, 0]);
const vertical: vec3 = new vec3([0, 2, 0]);
const origin: vec3 = new vec3([0, 0, 0]); // camera origin is at 0, 0, 0

export default class camera {
    /**
     * Returns a ray pointing to a screen pixel
     * 
     * @param u - vector moving camera ray horizontally
     * @param v - vector moving camera ray vertically
     */
    static getRay(u: number, v: number): ray {
        return new ray(origin, lowerLeftCorner.copy().add(horizontal.copy().multiply(u)).add(vertical.copy().multiply(v)).subtract(origin));
    }
}