import {hitable, hitRecord} from './hitable';
import vec3 from './vec3';
import ray from './ray';
import material from './material';

/**
 * Class which represents a spherical object
 */
export class sphere extends hitable {
    public center: vec3;
    public radius: number;
    public mat: material;

    constructor(cen: vec3, r: number, mat: material) {
        super();
        this.center = cen;
        this.radius = r;
        this.mat = mat;
    }

    /**
     * @param r - ray instance to use
     * @param tMin - minimum distance needed for object to be seen
     * @param tMax - maximum distance of object to be seen
     * @param rec - object to store results 
     * @returns whether the ray has hit the sphere
     */
    hit(r: ray, tMin: number, tMax: number, rec: hitRecord): boolean {
        let oc = r.origin.copy().subtract(this.center);

        const a = vec3.dot(r.direction, r.direction);
        const b = vec3.dot(oc, r.direction);
        const c = vec3.dot(oc, oc) - this.radius * this.radius;
        let discriminant = b * b - a * c;
        if (discriminant > 0) {
            let temp = (-b - Math.sqrt(b * b - a * c)) / a;
            if (temp < tMax && temp > tMin) {
                rec.t = temp;
                rec.p = r.pointAtParameter(rec.t);
                rec.normal = (rec.p.copy().subtract(this.center)).divide(this.radius);
                rec.mat = this.mat;
                return true;
            }

            temp = (-b + Math.sqrt(b * b - a * c) / a);
            if (temp < tMax && temp > tMin) {
                rec.t = temp;
                rec.p = r.pointAtParameter(rec.t);
                rec.normal = (rec.p.copy().subtract(this.center)).divide(this.radius);
                rec.mat = this.mat;
                return true
            }
        }
        return false;
    }
}