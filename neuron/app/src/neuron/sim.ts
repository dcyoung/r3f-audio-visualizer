import { HHModel, TStepData } from "./model";

import {
    uniformArray,
    ShaderNodeObject,
    saturate,
    floor,
    int,
    ceil,
    float,
    modInt,
    round,
    Fn,
    mix,
    uniform,
    uniforms,
    mixElement
} from "three/tsl";
import {
    Vector3
} from "three/webgpu";


export class IonRingBuffer {
    public buffer;
    public size: number;
    public pos = uniform(0);
    // public pos: number = 0;

    constructor(size: number) {
        if (size < 0) {
            throw new RangeError("Invalid size.");
        }
        this.buffer = uniformArray(Array.from({ length: size }).map(_ =>
            new Vector3(0, 0, 0)
        ))
        // Small arrays
        // this.buffer = uniforms(Array.from({ length: size }).map(_ =>
        //     new Vector3(0, 0, 0)
        // ))
        // Big arrays
        // this.buffer = storageObject( new StorageInstancedBufferAttribute( new Float32Array( array ), 3 ), 'vec3', count );
        this.size = size;
    }

    public get_currents = Fn(([alpha]) => {
        const idxFloat = saturate(alpha).mul(this.size - 1);
        const elemFloor = this.buffer.element(idxFloat.floor().add(this.pos).modInt(this.size))
        const elemCeil = this.buffer.element(idxFloat.ceil().add(this.pos).modInt(this.size))
        return mix(elemFloor, elemCeil, idxFloat.sub(idxFloat.floor()));
    });

    public add(item: TStepData): void {
        this.buffer.array[this.pos.value].x = item.IK + item.ILeak + item.IK_NaK_pump;
        this.buffer.array[this.pos.value].y = item.INa + item.INa_NaK_pump;

        // TODO: update these values
        // elem.y = ;
        // elem.z = ;
        // this.buffer.element(this.pos).xyz.assign(vec3(item.IK, item.INa, item.ILeak));
        // this.pos = modInt(this.pos.add(1), this.size);
        this.pos.value = (this.pos.value + 1) % this.size;
        // this.pos = (this.pos + 1) % this.size;
    }
}

export class NeuronSimulation {
    private model = new HHModel(0);
    private stimulusCurrent = 0;
    public readonly history = new IonRingBuffer(500);

    public step(tDeltaMs: number) {
        const data = this.model.step(tDeltaMs, this.stimulusCurrent);
        this.history.add(data);
    }

    public setStimulusCurrent(v: number) {
        this.stimulusCurrent = v;
    }
} 