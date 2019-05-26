import vec3 from './vec3';
import ray from './ray';
import { hitableList } from './hitableList';
import { hitRecord } from './hitable';
import camera from './camera';
import material, { lambertian, metal, dielectric } from './material';
import { sphere } from './sphere';

const ctx: Worker = self as any;

/**
 * Returns a random point inside a unit sphere
 */
export function randomInUnitSphere() {
    let p = new vec3([0, 0, 0]);
    // Random point until one is inside the unit sphere
    do {
        p = new vec3([Math.random(), Math.random(), Math.random()]).multiply(2).subtract(1);
    } while (p.squaredLength() >= 1);
    return p;
}

function color(r: ray, list: hitableList, depth: number): vec3 {
    let rec: hitRecord = {t: 0, p: new vec3(), normal: new vec3(), mat: <any>null};

    // 0.001 min distance to avoid shadow acne
    if (list.hit(r, 0.001, Number.MAX_SAFE_INTEGER, rec)) {
        // Normals of spheres
        // return new vec3(rec.normal.xyz).add(1).multiply(0.5);

        // Bounce light with 50% loss in a random direction
        //let target = rec.p.copy().add(rec.normal).add(randomInUnitSphere());
        //return color(new ray(rec.p, target.copy().subtract(rec.p)), list).multiply(0.5);

        let scattered: ray = new ray(new vec3([0, 0, 0]), new vec3([0, 0, 0]));
        let attenuation: vec3 = new vec3([0, 0, 0]);
        if (depth < 50 && rec.mat.scatter(r, rec, attenuation, scattered)) {
            return attenuation.copy().multiply(color(scattered, list, depth + 1));
        } else {
            return new vec3([0, 0, 0]);
        }
    } else {
        // Background
        const unitDirection = r.direction.copy().normalize();
        const t = 0.5 * (unitDirection.y + 1);
        return new vec3([1, 1, 1]).multiply(1 - t).add(new vec3([0.5, 0.7, 1.0]).multiply(t));
    }
}

ctx.addEventListener("message", oEvent => {

    //console.log('worker received:', oEvent.data);
    const { nyInit, nyFinish, t, nx, ny, ns } = oEvent.data;

    let l = new hitableList();
    l.list.push(new sphere(new vec3([0, 0, -1]), 0.5, new lambertian(new vec3([0.1, 0.2, 0.5]))));
    l.list.push(new sphere(new vec3([0, -100.5, -1]), 100, new metal(new vec3([0.8, 0.8, 0.0]), 0)));
    l.list.push(new sphere(new vec3([1, 0, -1]), 0.5, new metal(new vec3([0.8, 0.6, 0.2]), 0.3)));
    l.list.push(new sphere(new vec3([-1, 0, -1]), 0.5, new dielectric(1.5)));
    l.list.push(new sphere(new vec3([-1, 0, -1]), -0.45, new dielectric(1.5)));

    const cam = new camera(90, nx / ny);

    let jj = ny - nyFinish - 1;
    for (let j = nyFinish - 1; j >= nyInit; j--) {
        jj++;
        for (let i = 0; i < nx; i++) {
            let col = new vec3([0, 0, 0]);
            // number of rays per pixel
            for (let s = 0; s < ns; s++) {

                // jitter slightly in x and y
                const u = (i + Math.random()) / nx;
                const v = (j + Math.random()) / ny;

                // get ray pointing to a pixel
                const r: ray = cam.getRay(u, v);
                const p = r.pointAtParameter(2);

                col.add(color(r, l, 0));
            }

            col.divide(ns);

            // Gamma correction
            col = new vec3([Math.sqrt(col.x), Math.sqrt(col.y), Math.sqrt(col.z)]);
            const [ir, ig, ib] = col.multiply(255.99).xyz;

            ctx.postMessage({ i, jj, nx, ir, ig, ib, t });
        }
    }

    //ctx.terminate()
})
