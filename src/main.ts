import { BackSide, BoxGeometry, CubeCamera, DoubleSide, Mesh, MeshBasicMaterial, MeshPhongMaterial, OrthographicCamera, PerspectiveCamera, Scene, ShaderMaterial, TextureLoader, Vector3, WebGLRenderer } from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
  canvas: canvas
});

const camera = new PerspectiveCamera(50, canvas.width / canvas.height, 0.01, 10000); // new OrthographicCamera(-3, 3, 3, -3, 0.01, 1000) // new CubeCamera(0.01, 1000, canvas) // new PerspectiveCamera(120, canvas.width / canvas.height, 0.01, 10000);
camera.position.set(0, 0, 0);
camera.lookAt(new Vector3(0, 0, 1));

const scene = new Scene();

const controls = new OrbitControls(camera, renderer.domElement);



export const vertex = /* glsl */`
varying vec2 vUV;
#define M_PI 3.1415926535897932384626433832795

void main() {
  vUV = uv;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );

  float x = gl_Position.x;
  float d = length(gl_Position);
  float theta = asin(x / d);  // in range [-pi/2, pi/2]
  float xNew = theta / M_PI;
  // gl_Position.x = xNew;
  // gl_Position.z = d;
}
`;

const fragment = /* glsl */`
uniform sampler2D tex;
varying vec2 vUV;
void main() {
  vec4 texColor = texture2D(tex, vUV);
  gl_FragColor = vec4(texColor.rgb, 1.0);
}`;



const texture_nx = await new TextureLoader().loadAsync('./indoors-skyboxes/DallasW/negx.jpg');
const texture_ny = await new TextureLoader().loadAsync('./indoors-skyboxes/DallasW/negy.jpg');
const texture_nz = await new TextureLoader().loadAsync('./indoors-skyboxes/DallasW/negz.jpg');
const texture_px = await new TextureLoader().loadAsync('./indoors-skyboxes/DallasW/posx.jpg');
const texture_py = await new TextureLoader().loadAsync('./indoors-skyboxes/DallasW/posy.jpg');
const texture_pz = await new TextureLoader().loadAsync('./indoors-skyboxes/DallasW/posz.jpg');

const skyboxGeometry = new BoxGeometry(10, 10, 10);
const skyboxMaterials = [
  new ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms: { 'tex': { value: texture_px } }, side: DoubleSide }),
  new ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms: { 'tex': { value: texture_nx } }, side: DoubleSide }),
  new ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms: { 'tex': { value: texture_py } }, side: DoubleSide }),
  new ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms: { 'tex': { value: texture_ny } }, side: DoubleSide }),
  new ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms: { 'tex': { value: texture_pz } }, side: DoubleSide }),
  new ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms: { 'tex': { value: texture_nz } }, side: DoubleSide }),
  // new MeshBasicMaterial({ map: texture_px, side: DoubleSide }),
  // new MeshBasicMaterial({ map: texture_nx, side: DoubleSide }),
  // new MeshBasicMaterial({ map: texture_py, side: DoubleSide }),
  // new MeshBasicMaterial({ map: texture_ny, side: DoubleSide }),
  // new MeshBasicMaterial({ map: texture_pz, side: DoubleSide }),
  // new MeshBasicMaterial({ map: texture_nz, side: DoubleSide }),
]
const skybox = new Mesh(skyboxGeometry, skyboxMaterials);
skybox.position.set(0, 0, 0);
scene.add(skybox);




function loop() {
  skybox.rotateY(0.003);
  renderer.render(scene, camera);
  controls.update();

  setTimeout(loop, 10);
}

loop();