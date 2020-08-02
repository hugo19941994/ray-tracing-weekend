import workerPool from './workerPool';
import { sphere } from './sphere';
import material, { lambertian, metal } from './material';
import { hitableList } from './hitableList';
import vec3 from './vec3';

var observer = new MutationObserver(function (mutations, me) {
  // `mutations` is an array of mutations that occurred
  // `me` is the MutationObserver instance
  var btn = document.getElementById('button');
  if (btn) {
      btn.addEventListener("click", (e:Event) => render());
  }
});

observer.observe(document, {
  childList: true,
  subtree: true
});

var imageData: any;
function render() {
    let w = parseFloat((<HTMLInputElement>document.getElementById('width')).value);
    let h = parseFloat((<HTMLInputElement>document.getElementById('height')).value);
    let a = parseFloat((<HTMLInputElement>document.getElementById('antialiasing')).value);

    const canvas: any = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    //canvas.width = window.innerWidth;
    //canvas.height = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    const nx = canvas.width;
    const ny = canvas.height;
    const ns = a; // Antialiasing
    const threads = 8;

    imageData = ctx.createImageData(canvas.width, canvas.height);

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        render()
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
}
