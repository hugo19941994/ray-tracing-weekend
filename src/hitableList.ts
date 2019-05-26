import ray from "./ray";
import { hitable } from "./hitable";
import { hitRecord } from "./hitable";
import vec3 from "./vec3";

/**
 * Class which holds a list of hitable instances
 */
export class hitableList extends hitable {
    public list : Array<hitable> = [];

    /**
     * @param r - ray instance to use
     * @param tMin - minimum distance needed for object to be seen
     * @param tMax - maximum distance of object to be seen
     * @param rec - object to store results 
     * @returns whether the ray has hit any object of the list
     */
    hit(r: ray, tMin: number, tMax: number, rec: hitRecord): boolean {
        let tempRec: hitRecord = {t: 0, p: new vec3(), normal: new vec3(), mat: <any>null};
        let hitAnything = false;
        let closestSoFar = tMax;

        for (let i = 0; i < this.list.length; i++) {
            if (this.list[i].hit(r, tMin, closestSoFar, tempRec)) {
                hitAnything = true;
                closestSoFar = tempRec.t;

                //rec = tempRec;
                rec.t = tempRec.t;
                rec.p = tempRec.p;
                rec.normal = tempRec.normal;
                rec.mat = tempRec.mat;
            }
        }
        return hitAnything;
    }
}