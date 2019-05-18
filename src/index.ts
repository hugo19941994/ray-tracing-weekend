import vec3 from './vec3';
import ray from './ray';

function color(r: ray): vec3 {
    let t = hitSphere(new vec3([0, 0, -1]), 0.5, r);

    if (t > 0) {
        const N = r.pointAtParameter(t).subtract(new vec3([0, 0, -1])).normalize();
        console.log(N);
        return new vec3([N.x + 1, N.y + 1, N.z + 1]).multiply(0.5);
    }

    const unitDirection: vec3 = r.direction.copy().normalize();
    t = 0.5 * (unitDirection.y + 1);

    const res = new vec3([1, 1, 1]).multiply(1 - t);
    let res2 = new vec3([0.5, 0.7, 1.0]).multiply(t);
    return res.add(res2);
}

function hitSphere(center: vec3, radius: number, r: ray): number {
    const oc = r.origin.copy().subtract(center);
    const a = vec3.dot(r.direction, r.direction);
    const b = 2 * vec3.dot(oc, r.direction);
    const c = vec3.dot(oc, oc) - radius * radius;
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) {
        return -1;
    } else {
        return (-b - Math.sqrt(discriminant) / (2 * a));
    }
}

(function main() {
    const canvas: any = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth/3;
    canvas.height = window.innerHeight/3;
    const nx = canvas.width;
    const ny = canvas.height;

    let imageData = ctx.createImageData(canvas.width, canvas.height);

    function resizeCanvas() {
        canvas.width = window.innerWidth/3;
        canvas.height = window.innerHeight/3;
        main()
    }

    window.addEventListener('resize', resizeCanvas, false);

    const lowerLeftCorner: vec3 = new vec3([-2, -1, -1]);
    const horizontal: vec3 = new vec3([4, 0, 0]);
    const vertical: vec3 = new vec3([0, 2, 0]);
    const origin: vec3 = new vec3([0, 0, 0]);

    let jj = -1;
    for (let j = ny - 1; j >= 0; j--) {
        jj++;
        for (let i = 0; i < nx; i++) {
            const u = i / nx;
            const v = j / ny;

            const r = new ray(origin, lowerLeftCorner.copy().add(horizontal.copy().multiply(u)).add(vertical.copy().multiply(v)));
            const col = color(r);

            const [ir, ig, ib] = col.xyz.map(i => 255.99 * i);

            imageData.data[(i * 4) + (jj * nx * 4) + 0] = ir;
            imageData.data[(i * 4) + (jj * nx * 4) + 1] = ig;
            imageData.data[(i * 4) + (jj * nx * 4) + 2] = ib;
            imageData.data[(i * 4) + (jj * nx * 4) + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
})()