import vec3 from "./vec3";

export default class ray {
    private orig: vec3;
    private dir: vec3;

    constructor(a: vec3, b: vec3) {
        this.orig = a;
        this.dir = b;
    }

    get origin(): vec3 {
        return this.orig;
    }

    get direction(): vec3 {
        return this.dir;
    }

    pointAtParameter(t: number): vec3 {
        // A + (t * B)
        return this.orig.copy().add(this.dir.copy().multiply(t));
    }
}