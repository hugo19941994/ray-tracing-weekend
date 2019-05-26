import { emit } from "cluster";
import Worker from "worker-loader!./task.worker";
import WebpackWorker from "worker-loader!./task.worker";
import EventEmitter from 'eventemitter3';

export default class workerPool extends EventEmitter {
    max = 4;
    //workers: Array<WebpackWorker> = [];
    current = 0;
    jobs: Array<Object> = [];

    // Set max number of workers
    constructor(w: number) {
        super();
        this.max = w;
    }

    queueJob(msg: Object) {
        this.jobs.push(msg);
        this.runJobs()
    }

    runJobs() {
        if (this.current < this.max && this.jobs.length > 0) {
            this.current++;
            let worker = new Worker();
            worker.postMessage(this.jobs.shift());
            this.runJobs();

            worker.onmessage = oEvent => {
                this.emit('done', oEvent)
                //worker.terminate();
                //this.current--;
                //this.runJobs()
            }
        }
    }

}