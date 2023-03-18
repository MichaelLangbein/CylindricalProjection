import { BackSide, BoxGeometry, Camera, DoubleSide, FrontSide, Mesh, PlaneGeometry, Scene, ShaderMaterial, TextureLoader, Vector3, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const renderer = new WebGLRenderer({
  alpha: false,
  antialias: true,
  canvas: canvas
});

const camera = new Camera(); // new PerspectiveCamera(50, canvas.width / canvas.height, 0.01, 10000); // new OrthographicCamera(-3, 3, 3, -3, 0.01, 1000) // new CubeCamera(0.01, 1000, canvas) // new PerspectiveCamera(120, canvas.width / canvas.height, 0.01, 10000);
camera.position.set(0, 0, 0);
camera.lookAt(new Vector3(0, 0, 1));

const scene = new Scene();

// const controls = new OrbitControls(camera, renderer.domElement);



export const vertex = /* glsl */`
varying vec2 vUV;
varying vec3 debug;
#define M_PI 3.1415926535897932384626433832795

void main() {
  float r = 1.0;
  float h = 0.6;
  float dmin = r;
  float dmax = 100.0;

  vUV = uv;
  vec4 posCamSpace = viewMatrix * modelMatrix * vec4( position, 1.0 );
  posCamSpace.z = - posCamSpace.z; // usually, camera looks into negative z direction in camera space. changing that.

  float d = sqrt(
    (posCamSpace.x * posCamSpace.x) +  
    (posCamSpace.y * posCamSpace.y) + 
    (posCamSpace.z * posCamSpace.z)
  );
  float d_xz = sqrt(
    (posCamSpace.x * posCamSpace.x) + 
    (posCamSpace.z * posCamSpace.z)
  );

  float theta = 0.0;
  if (posCamSpace.z > 0.0) {
    theta = asin(posCamSpace.x / d_xz);  // not sure if maybe this should be just d, not d_xz
  } else {
    float thetaMax = M_PI;
    if (posCamSpace.x < 0.0) {
      thetaMax = -1.0 * thetaMax;
    }
    theta = thetaMax - asin(posCamSpace.x / d_xz);  // not sure if maybe this should be just d, not d_xz
  }

  float rho = asin(posCamSpace.y / d);

  float xNew = theta / M_PI;
  float yNew = (r * tan(rho)) / h;
  float zNew = (d - dmin) / (dmax - dmin);

  gl_Position = vec4(xNew, yNew, zNew, 1.0);

  debug = vec3(xNew, yNew, zNew);
  debug = vec3(abs(theta) / M_PI, abs(theta) / M_PI, abs(theta) / M_PI);
}
`;

const fragment = /* glsl */`
uniform sampler2D tex;
varying vec2 vUV;
varying vec3 debug;
#define M_PI 3.1415926535897932384626433832795

void main() {
  vec4 texColor = texture2D(tex, vUV);
  gl_FragColor = vec4(texColor.rgb, 1.0);
  // gl_FragColor = vec4(debug.xyz, 1.0);
  // gl_FragColor = vec4(vUV.xy, 0.0, 1.0);
}`;



const textureFace = await new TextureLoader().loadAsync('./indexed-face.png');
const lowRes = await new TextureLoader().loadAsync('./low-res.png');


const plane1 = new Mesh(
  new PlaneGeometry(2, 1, 64, 32),
  new ShaderMaterial({
    vertexShader: vertex, fragmentShader: fragment,
    uniforms: { 'tex': {value: textureFace}},
    side: DoubleSide
  })
);
plane1.position.set(0, 0, 1);
plane1.lookAt(new Vector3(0, 0, 0));
scene.add(plane1);
const plane2 = new Mesh(
  new PlaneGeometry(2, 1, 64, 32),
  new ShaderMaterial({
    vertexShader: vertex, fragmentShader: fragment,
    uniforms: { 'tex': {value: textureFace}},
    side: DoubleSide
  })
);
plane2.position.set(1, 0, 0);
plane2.lookAt(new Vector3(0, 0, 0));
scene.add(plane2);
const plane3 = new Mesh(
  new PlaneGeometry(2, 1, 64, 32),
  new ShaderMaterial({
    vertexShader: vertex, fragmentShader: fragment,
    uniforms: { 'tex': {value: textureFace}},
    side: DoubleSide
  })
);
plane3.position.set(-1, 0, 0);
plane3.lookAt(new Vector3(0, 0, 0));
scene.add(plane3);
// This plane causes trouble:
// wrapping it around my head from behind
// makes it smudge over the full screen.
/**
 * Here's something fascinating:
 *  - this wall is not displayed if there is only one length- and height-section.
 *  - Reason: when the projection moves the furthest-left vertex to the furthest right,
 *    the triangle is turned from a right-handed triangle into a left-handed triangle.
 *    And WebGL just doesn't render left-handed triangles... even if they are double sided
 *    (I think!)
 * - Either way, the wrap-around does seem to work with the following ingredients:
 *  - uneven with- and height-sections (this way only one section is becoming de-naturated and un-renderable.)
 *  - FrontSide-rendering only (as long as the plane looks towards the camera)
 */
const plane4 = new Mesh(
  new PlaneGeometry(2, 1, 9, 9),
  new ShaderMaterial({
    vertexShader: vertex, fragmentShader: fragment,
    uniforms: { 'tex': {value: lowRes}},
    side: FrontSide
  })
);
plane4.position.set(0, 0, -1);
plane4.lookAt(new Vector3(0, 0, 0));
scene.add(plane4);



const cube = new Mesh(
  new BoxGeometry(0.2, 0.2, 0.2, 30, 30, 30), 
  new ShaderMaterial({ 
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: { 'tex': {value: lowRes} }, 
    side: DoubleSide
  }));
cube.position.set(0.1, 0.2, 0.5);
scene.add(cube);





function loop() {
  // skybox.rotateY(0.003);
  // camera.rotateY(0.002);
  cube.rotateX(0.003);
  renderer.render(scene, camera);

  setTimeout(loop, 10);
}

loop();