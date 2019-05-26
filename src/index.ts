import workerPool from './workerPool';
import { sphere } from './sphere';
import material, { lambertian, metal } from './material';
import { hitableList } from './hitableList';
import vec3 from './vec3';

var imageData: any;
(function main() {
    const canvas: any = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    //canvas.width = window.innerWidth;
    //canvas.height = window.innerHeight;
    canvas.width = 8*200;
    canvas.height = 8*130;
    const nx = canvas.width;
    const ny = canvas.height;
    const ns = 8; // Antialiasing
    const threads = 8;

    imageData = ctx.createImageData(canvas.width, canvas.height);

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        main()
    }

    //window.addEventListener('resize', resizeCanvas, false);

    let pool = new workerPool(8);
    pool.on('done', oEvent => {
        const {i, jj, nx, ir, ig, ib, t} = oEvent.data;
        //console.log('index received:', oEvent.data)
        imageData.data[(i * 4) + (jj * nx * 4) + 0] = ir;
        imageData.data[(i * 4) + (jj * nx * 4) + 1] = ig;
        imageData.data[(i * 4) + (jj * nx * 4) + 2] = ib;
        imageData.data[(i * 4) + (jj * nx * 4) + 3] = 255;
    })

    for (let t = 0; t < threads; ++t) {
        const subNy = ny/threads;
        const nyInit = t * subNy;
        const nyFinish = t * subNy + subNy;

        //console.log(subNy, nyInit, nyFinish)
        pool.queueJob({ nyInit, nyFinish, t, nx, ny, ns });
    }

    setInterval(() => {ctx.putImageData(imageData, 0, 0);}, 10000)
})()
