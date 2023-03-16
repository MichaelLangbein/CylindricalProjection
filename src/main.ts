import { BoxGeometry, Camera, DoubleSide, Mesh, PlaneGeometry, Scene, ShaderMaterial, TextureLoader, Vector3, WebGLRenderer } from "three";
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
  float r = 0.3;
  float h = 0.6;
  float dmin = r;
  float dmax = 100.0;

  vUV = uv;
  vec4 posCamSpace = viewMatrix * modelMatrix * vec4( position, 1.0 );   // verified
  posCamSpace.z = - posCamSpace.z; // usually, camera looks into negative z direction in camera space. changing that.

  float d = sqrt(                              // verified
    (posCamSpace.x * posCamSpace.x) +  
    (posCamSpace.y * posCamSpace.y) + 
    (posCamSpace.z * posCamSpace.z)
  );
  float d_xz = sqrt(                          // verified
    (posCamSpace.x * posCamSpace.x) + 
    (posCamSpace.z * posCamSpace.z)
  );
  float d_xy = sqrt(                            // verified
    (posCamSpace.x * posCamSpace.x) + 
    (posCamSpace.y * posCamSpace.y)
  );

  float theta = 0.0;
  if (posCamSpace.z > 0.0) {
    theta = asin(posCamSpace.x / d_xz);      // verified
  } else {
    float thetaMax = M_PI;                 // ...............
    if (posCamSpace.x < 0.0) {
      thetaMax = -1.0 * thetaMax;          // ....................
    }
    theta = thetaMax - asin(posCamSpace.x / d_xz);    // .................
  }

  float rho = asin(posCamSpace.y / d_xy);

  float xNew = theta / M_PI;
  float yNew = (r * tan(rho)) / h;
  float zNew = (d - dmin) / (dmax - dmin);

  gl_Position = vec4(xNew, yNew, zNew, 1.0);
  debug = vec3(xNew, yNew, zNew);
  debug = vec3(abs(theta) / M_PI, abs(theta) / M_PI, abs(theta) / M_PI);
  debug = vec3(abs(rho), abs(rho), abs(rho));
}
`;

const fragment = /* glsl */`
uniform sampler2D tex;
varying vec2 vUV;
varying vec3 debug;

void main() {
  vec4 texColor = texture2D(tex, vUV);
  gl_FragColor = vec4(texColor.rgb, 1.0);
  // gl_FragColor = vec4(debug.xyz, 1.0);
  // gl_FragColor = vec4(vUV.xy, debug.x, 1.0);
}`;



const texture_nx = await new TextureLoader().loadAsync('./indoors-skyboxes/DallasW/negx.jpg');
const texture_ny = await new TextureLoader().loadAsync('./indoors-skyboxes/DallasW/negy.jpg');
const texture_nz = await new TextureLoader().loadAsync('./indoors-skyboxes/DallasW/negz.jpg');
const texture_px = await new TextureLoader().loadAsync('./indoors-skyboxes/DallasW/posx.jpg');
const texture_py = await new TextureLoader().loadAsync('./indoors-skyboxes/DallasW/posy.jpg');
const texture_pz = await new TextureLoader().loadAsync('./indoors-skyboxes/DallasW/posz.jpg');
const textureFace = await new TextureLoader().loadAsync('./indexed-face.png');
const lowRes = await new TextureLoader().loadAsync('./low-res.png');



// const skyboxGeometry = new BoxGeometry(10, 2, 15);
// const skyboxMaterials = [
//   new ShaderMaterial({ 
//     vertexShader: vertex, fragmentShader: fragment, 
//     uniforms: { 'tex': { value: textureFace } },    // texture_px } }, 
//     side: DoubleSide 
//   }),
//   new ShaderMaterial({ 
//     vertexShader: vertex, fragmentShader: fragment, 
//     uniforms: { 'tex': { value: textureFace } },    // texture_nx } }, 
//     side: DoubleSide 
//   }),
//   new ShaderMaterial({ 
//     vertexShader: vertex, fragmentShader: fragment, 
//     uniforms: { 'tex': { value: textureFace } },    // texture_py } }, 
//     side: DoubleSide 
//   }),
//   new ShaderMaterial({ 
//     vertexShader: vertex, fragmentShader: fragment, 
//     uniforms: { 'tex': { value: textureFace } },    // texture_ny } }, 
//     side: DoubleSide 
//   }),
//   new ShaderMaterial({ 
//     vertexShader: vertex, fragmentShader: fragment, 
//     uniforms: { 'tex': { value: textureFace } },    // texture_pz } }, 
//     side: DoubleSide 
//   }),
//   new ShaderMaterial({ 
//     vertexShader: vertex, fragmentShader: fragment, 
//     uniforms: { 'tex': { value: textureFace } },    // texture_nz } }, 
//     side: DoubleSide 
//   }),
// ]
// const skybox = new Mesh(skyboxGeometry, skyboxMaterials);
// skybox.position.set(0, 0, 0);
// scene.add(skybox);

const plane1 = new Mesh(
  new PlaneGeometry(1, 1, 64, 32),
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
  new PlaneGeometry(1, 1, 64, 32),
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
  new PlaneGeometry(1, 1, 64, 32),
  new ShaderMaterial({
    vertexShader: vertex, fragmentShader: fragment,
    uniforms: { 'tex': {value: textureFace}},
    side: DoubleSide
  })
);
plane3.position.set(-1, 0, 0);
plane3.lookAt(new Vector3(0, 0, 0));
scene.add(plane3);
const plane4 = new Mesh(
  new PlaneGeometry(1, 1, 64, 32),
  new ShaderMaterial({
    vertexShader: vertex, fragmentShader: fragment,
    uniforms: { 'tex': {value: textureFace}},
    side: DoubleSide
  })
);
plane4.position.set(0, 0, -1);
plane4.lookAt(new Vector3(0, 0, 0));
scene.add(plane4);



const cube = new Mesh(
  new BoxGeometry(1, 1, 1), 
  new ShaderMaterial({ 
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: { 'tex': {value: lowRes} }, 
    side: DoubleSide
  }));
cube.position.set(0.5, 0, 1.5);
// scene.add(cube);





function loop() {
  // skybox.rotateY(0.003);
  // camera.rotateY(0.002);
  cube.rotateX(0.003);
  renderer.render(scene, camera);

  setTimeout(loop, 10);
}

loop();