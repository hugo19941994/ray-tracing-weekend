import ray from './ray';
import vec3 from './vec3';

/**
 * Object to store information about a ray which has hit an object
 */
export interface hitRecord {
    t: number; // distance to point hit
    p: vec3; // point where ray hits
    normal: vec3; // normal vector of object in hit point
}

/**
 * Abstract class which represents any hitable object
 */
export abstract class hitable {
    /**
     * Abstract method which all hitable objects must implement
     * 
     * @param r - ray instance to use
     * @param tMin - minimum distance of an object for it to be valid
     * @param tMax - maximum distance of an object for it to be valid
     * @param rec - object to store hit information
     * @returns whether a ray has hit the object or not
     */
    abstract hit(r: ray, tMin: number, tMax: number, rec: hitRecord): boolean
}