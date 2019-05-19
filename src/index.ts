import vec3 from './vec3';
import ray from './ray';
import { hitableList } from './hitableList';
import { hitRecord } from './hitable';
import { sphere } from './sphere';
import camera from './camera';

/**
 * Returns a random point inside a unit sphere
 */
function randomInUnitSphere() {
    let p = new vec3([0, 0, 0]);
    // Random point until one is inside the unit sphere
    do {
        p = new vec3([Math.random(), Math.random(), Math.random()]).multiply(2).subtract(1);
    } while (p.squaredLength() >= 1);
    return p;
}

function color(r: ray, list: hitableList): vec3 {
    let rec: hitRecord = {t: 0, p: new vec3(), normal: new vec3()};

    // 0.001 min distance to avoid shadow acne
    if (list.hit(r, 0.001, Number.MAX_SAFE_INTEGER, rec)) {
        // Normals of spheres
        // return new vec3(rec.normal.xyz).add(1).multiply(0.5);

        // Bounce light with 50% loss in a random direction
        let target = rec.p.copy().add(rec.normal).add(randomInUnitSphere());
        return color(new ray(rec.p, target.copy().subtract(rec.p)), list).multiply(0.5);
    } else {
        // Background
        const unitDirection = r.direction.copy().normalize();
        const t = 0.5 * (unitDirection.y + 1);
        return new vec3([1, 1, 1]).multiply(1 - t).add(new vec3([0.5, 0.7, 1.0]).multiply(t));
    }
}

(function main() {
    const canvas: any = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const nx = canvas.width;
    const ny = canvas.height;
    const ns = 20; // Antialiasing

    let imageData = ctx.createImageData(canvas.width, canvas.height);

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        main()
    }

    window.addEventListener('resize', resizeCanvas, false);

    let l = new hitableList();
    l.list.push(new sphere(new vec3([0, 0, -1]), 0.5));
    l.list.push(new sphere(new vec3([0, -100.5, -1]), 100));
    l.list.push(new sphere(new vec3([3.1, 1, -3]), 1.5));

    let jj = -1;
    for (let j = ny - 1; j >= 0; j--) {
        jj++;
        for (let i = 0; i < nx; i++) {
            let col = new vec3([0, 0, 0]);

            // number of rays per pixel
            for (let s = 0; s < ns; s++) {
                // jitter slightly in x and y
                const u = (i + Math.random()) / nx;
                const v = (j + Math.random()) / ny;

                // get ray pointing to a pixel
                const r: ray = camera.getRay(u, v);
                const p = r.pointAtParameter(2);

                col.add(color(r, l));
            }

            col.divide(ns);

            // Gamma correction
            col = new vec3([Math.sqrt(col.x), Math.sqrt(col.y), Math.sqrt(col.z)]);
            const [ir, ig, ib] = col.multiply(255.99).xyz;

            imageData.data[(i * 4) + (jj * nx * 4) + 0] = ir;
            imageData.data[(i * 4) + (jj * nx * 4) + 1] = ig;
            imageData.data[(i * 4) + (jj * nx * 4) + 2] = ib;
            imageData.data[(i * 4) + (jj * nx * 4) + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
})()