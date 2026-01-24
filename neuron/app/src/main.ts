import * as THREE from "three/webgpu";
import {
  float,
  If,
  PI,
  color,
  cos,
  instanceIndex,
  Loop,
  mix,
  mod,
  sin,
  instancedArray,
  Fn,
  uint,
  uniform,
  select,
  uniformArray,
  round,
  time,
  hash,
  vec3,
  vec4,
  exp2,
  saturate,
} from "three/tsl";

import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { NeuronSimulation } from "./neuron/sim";

const sim = new NeuronSimulation();
window.addEventListener("keydown", () => sim.setStimulusCurrent(20));
window.addEventListener("keyup", () => sim.setStimulusCurrent(0));


const camera = new THREE.PerspectiveCamera(
  25,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(3, 5, 8);

const scene = new THREE.Scene();
// ambient light
const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
scene.add(ambientLight);

// directional light
const directionalLight = new THREE.DirectionalLight("#ffffff", 1.5);
directionalLight.position.set(4, 2, 0);
scene.add(directionalLight);

// renderer
const renderer = new THREE.WebGPURenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
renderer.setClearColor("#000000");
document.body.appendChild(renderer.domElement);


const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 0.1;
controls.maxDistance = 50;

// particles
const count = Math.pow(2, 18);
const material = new THREE.SpriteNodeMaterial({
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const scale = uniform(0.008);
const positionBuffer = instancedArray(count, "vec3");
const initPositionBuffer = instancedArray(count, "vec3");
const velocityBuffer = instancedArray(count, "vec3");
const colorBuffer = instancedArray(count, "vec4");

const sphericalToVec3 = Fn(([phi, theta]) => {
  const sinPhiRadius = sin(phi);

  return vec3(
    sinPhiRadius.mul(sin(theta)),
    cos(phi),
    sinPhiRadius.mul(cos(theta))
  );
});

// init compute
const gridSize = 5;
const init = Fn(() => {
  const position = positionBuffer.element(instanceIndex);
  const velocity = velocityBuffer.element(instanceIndex);
  const color = colorBuffer.element(instanceIndex);
  const initPosition = initPositionBuffer.element(instanceIndex);
  If(instanceIndex.modInt(2).equal(0), () => {
    // yellow
    color.assign(vec4(1, 1, 0, 1));
  })
    .Else(() => {
      // red
      color.assign(vec4(1, 0, 0, 1));
    });

  const basePosition = vec3(
    hash(instanceIndex.add(uint(Math.random() * 0xffffff))),
    hash(instanceIndex.add(uint(Math.random() * 0xffffff))),
    hash(instanceIndex.add(uint(Math.random() * 0xffffff)))
  )
    .sub(0.5)
    .mul(vec3(gridSize, 0.35, gridSize));
  position.assign(basePosition);
  initPosition.assign(basePosition);

  const phi = hash(instanceIndex.add(uint(Math.random() * 0xffffff)))
    .mul(PI)
    .mul(2);
  const theta = hash(
    instanceIndex.add(uint(Math.random() * 0xffffff))
  ).mul(PI);
  const baseVelocity = sphericalToVec3(phi, theta).mul(0.05);
  velocity.assign(baseVelocity);
});

const initCompute = init().compute(count);

const reset = () => {
  renderer.computeAsync(initCompute);
};

reset();



// update compute
const thresh = 5;
const update = Fn(() => {
  const position = positionBuffer.element(instanceIndex);
  const velocity = velocityBuffer.element(instanceIndex);
  const initPosition = initPositionBuffer.element(instanceIndex);

  // @y=0, prob=low, @y=thresh, prob=high
  const probReset = position.y.abs().div(thresh).saturate().oneMinus().mul(-20).exp2().toVar()
  If(position.x.abs().sub(gridSize / 2).greaterThan(0), () => {
    probReset.assign(1);
  })


  const randValue = hash(time.add(instanceIndex.toFloat()));
  If(randValue.lessThan(probReset).or(position.y.abs().greaterThanEqual(thresh)), () => {
    position.assign(initPosition);
  })


  If(instanceIndex.modInt(2).equal(0), () => {
    // Potassium
    const xNorm = position.x.div(gridSize).add(0.5);
    const iKMax = sim.history.get_currents(xNorm).x.div(850);
    const distAlpha = float(0.5).sub(position.y.abs()).mul(2).saturate();
    const expEaseOut = distAlpha.mul(-10).exp2();
    const vY = iKMax.mul(expEaseOut.add(0.01)).mul(0.15);
    position.y.assign(position.y.add(vY));
    velocity.y.assign(vY);
  })
    .Else(() => {
      // Sodium
      const xNorm = position.x.div(gridSize).add(0.5);
      const iKMax = sim.history.get_currents(xNorm).y.div(800);
      const distAlpha = float(0.5).sub(position.y.abs()).mul(2).saturate();
      const expEaseOut = distAlpha.mul(-10).exp2();
      const vY = iKMax.mul(expEaseOut.add(0.01)).mul(0.15);
      position.y.assign(position.y.add(vY));
      velocity.y.assign(vY);
    })


  const vNoise = vec3(
    hash(time.add(instanceIndex.toFloat())),
    hash(time.add(instanceIndex.toFloat().add(1))),
    hash(time.add(instanceIndex.toFloat().add(2)))
  ).sub(0.5).normalize().mul(0.0025)
  position.addAssign(vNoise);

  // // velocity.addAssign(vJitter);
  // position.addAssign(vJitter);
  // position.addAssign(velocity);
});
const updateCompute = update().compute(count);

// nodes
material.positionNode = positionBuffer.toAttribute();

material.colorNode = colorBuffer.toAttribute();
// material.colorNode = Fn(() => {
//   return vec4(1, 1, 1, 1);
// })();

material.scaleNode = scale;

// mesh
const geometry = new THREE.PlaneGeometry(1, 1);
const mesh = new THREE.InstancedMesh(geometry, material, count);
scene.add(mesh);

// debug

const gui = new GUI();
// gui.add(maxSpeed, "value", 0, 10, 0.01).name("maxSpeed");
gui.add(scale, "value", 0, 0.1, 0.001).name("scale");
gui.add({ reset }, "reset");


window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});

let lastFrameTimeMs = -1;
async function animate(time: number) {
  if (lastFrameTimeMs < 0) {
    lastFrameTimeMs = time;
    return;
  }

  const deltaMs = time - lastFrameTimeMs;
  lastFrameTimeMs = time;
  sim.step(0.002 * deltaMs);

  controls.update();

  renderer.compute(updateCompute);
  renderer.render(scene, camera);
}