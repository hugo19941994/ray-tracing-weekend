import vec3 from './vec3';

let canvas: any = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let imageData = ctx.createImageData(200, 100);

let nx = 200;
let ny = 100;
console.log(`P3\n${nx} ${ny}\n255\n`);
let jj = -1;
for (let j = ny - 1; j >= 0; j--) {
    jj++;
    for (let i = 0; i < nx; i++) {
        let col = new vec3([i/nx, j/ny, 0.2]);
        let [ir, ig, ib] = col.xyz.map(i => 255.99 * i);

        imageData.data[(i * 4 + 0) + (jj * nx * 4)] = ir;
        imageData.data[(i * 4 + 1) + (jj * nx * 4)] = ig;
        imageData.data[(i * 4 + 2) + (jj * nx * 4)] = ib;
        imageData.data[(i * 4 + 3) + (jj * nx * 4)] = 255;
        console.log(`${ir} ${ig} ${ib}\n`);
    }
}
ctx.putImageData(imageData, 0, 0);
