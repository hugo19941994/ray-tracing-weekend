import ray from "./ray";
import { hitRecord } from "./hitable";
import vec3 from "./vec3";
import { randomInUnitSphere } from './task.worker';

export default abstract class material {
    abstract scatter(rIn: ray, rec: hitRecord, attenuation: vec3, scattered: ray) : boolean;
}

/**
 * Lambertian (diffuse material)
 * 
 * Scatters always and attenuates by it's reflectance R 
 * OR
 * Scatter with no attenuation but absorp the fraction 1-R of the rays
 * OR
 * Mixture of strategies
 */
export class lambertian extends material {
    private albedo: vec3;

    constructor(a: vec3) {
        super();
        this.albedo = a;
    }

    scatter(rIn: ray, rec: hitRecord, attenuation: vec3, scattered: ray) : boolean {
        let target: vec3 = rec.p.copy().add(rec.normal).add(randomInUnitSphere());

        //scattered = new ray(rec.p.copy(), target.copy().subtract(rec.p));
        scattered.update(new ray(rec.p.copy(), target.copy().subtract(rec.p)));

        //attenuation = this.albedo;
        attenuation.x = this.albedo.x;
        attenuation.y = this.albedo.y;
        attenuation.z = this.albedo.z;

        return true;

        // Could also scatter with some probability and attenuate albedo/p
    }
}

/**
 * Reflect a ray
 * 
 * @param v incoming ray
 * @param n normal of hit point
 * @returns reflected ray (bounce)
 */
function reflect(v: vec3, n: vec3) : vec3 {
    // v - 2 * dot(v, n) * n
    return v.copy().subtract(n.copy().multiply(2 * vec3.dot(v, n)));
}

/**
 * Metal material
 * 
 * Reflects light using the reflect function (not randomly, like in diffuse materials)
 */
export class metal extends material {
    private albedo: vec3;
    private fuzz: number;

    constructor(a: vec3, f: number) {
        super();
        this.albedo = a;
        if (f > 1) {
            f = 1;
        }
        this.fuzz = f;
    }

    scatter(rIn: ray, rec: hitRecord, attenuation: vec3, scattered: ray) : boolean {
        // normalized 
        let reflected: vec3 = reflect(rIn.direction.copy().normalize(), rec.normal);

        //let tempScattered = new ray(rec.p.copy(), reflected);

        // Without fuzz
        //scattered.update(new ray(rec.p.copy(), reflected))

        // Reflect with just a bit of randomness(fuzz)
        scattered.update(new ray(rec.p.copy(), reflected.copy().add(randomInUnitSphere().multiply(this.fuzz))))

        //scattered.direction = tempScattered.direction;
        //scattered.origin = tempScattered.origin;

        //attenuation = this.albedo;
        attenuation.x = this.albedo.x;
        attenuation.y = this.albedo.y;
        attenuation.z = this.albedo.z;

        return vec3.dot(scattered.direction, rec.normal) > 0;
    }
}

// Transparent materials refract light
function refract(v: vec3, n: vec3, niOverNt: number, refracted: vec3): boolean {
    const uv = v.copy().normalize();
    const dt = vec3.dot(uv, n);
    const discriminant = 1 - niOverNt * niOverNt * (1 - dt * dt);

    if (discriminant > 0) {
        let r = uv.copy().subtract(n.copy().multiply(dt)).multiply(niOverNt).subtract(n.copy().multiply(Math.sqrt(discriminant)));
        refracted.x = r.x;
        refracted.y = r.y;
        refracted.z = r.z;
        return true;
    } else return false;
}

// Probability of reflection depending on angle
function schlick(cosine: number, refIdx: number) {
    let r0 = (1 - refIdx) / (1 + refIdx);
    r0 = r0 * r0;
    return r0 + (1 - r0) * Math.pow((1 - cosine), 5);
}

export class dielectric extends material {
    private refIdx: number;

    constructor(ri: number) {
        super();
        // Typical refractive indices
        // air 1
        // glass 1.3-1.7
        // diamond 2.4
        this.refIdx = ri;
    }

    scatter(rIn: ray, rec: hitRecord, attenuation: vec3, scattered: ray) : boolean {
        let outwardNormal: vec3;
        let reflected = reflect(rIn.direction, rec.normal);
        let niOverNt: number;

        //attenuation = new vec3([1, 1, 0]);
        attenuation.x = 1;
        attenuation.y = 1;
        attenuation.z = 1;

        let refracted = new vec3([0, 0, 0]); // populated by refract function
        let reflectProb: Number;
        let cosine: number;

        // If refraction is possible (e.g. not perpendicular)
        if (vec3.dot(rIn.direction, rec.normal) > 0) {
            outwardNormal = new vec3([-rec.normal.x, -rec.normal.y, -rec.normal.z]);
            niOverNt = this.refIdx;
            cosine = this.refIdx * vec3.dot(rIn.direction, rec.normal) / rIn.direction.length();
        } else {
            outwardNormal = new vec3(rec.normal.xyz);
            niOverNt = 1 / this.refIdx;
            cosine = -vec3.dot(rIn.direction, rec.normal) / rIn.direction.length();
        }

        if (refract(rIn.direction, outwardNormal, niOverNt, refracted)) {
            // Refraction possibility depending on angle of incidence
            reflectProb = schlick(cosine, this.refIdx);
        } else {
            // Reflect
            scattered.update(new ray(rec.p, reflected));
            reflectProb = 1;
        }

        if (Math.random() < reflectProb) {
            // Reflect
            scattered.update(new ray(rec.p, reflected));
        } else {
            // Refract
            scattered.update(new ray(rec.p, refracted));
        }
        return true;
    }

}