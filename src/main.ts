import { BoxGeometry, Camera, DoubleSide, Mesh, Scene, ShaderMaterial, TextureLoader, Vector3, WebGLRenderer } from "three";
import { AxesHelper } from 'three/src/helpers/AxesHelper';


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

const axh = new AxesHelper(5);
axh.position.set(0, 0, 0);
scene.add(axh);


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
  vec4 posWordSpace = viewMatrix * modelMatrix * vec4( position, 1.0 );

  float d = sqrt(
    posWordSpace.x * posWordSpace.x + 
    posWordSpace.y * posWordSpace.y + 
    posWordSpace.z * posWordSpace.z
  );

  float theta = 0.0;
  if (posWordSpace.z > 0.0) {
    theta = asin(posWordSpace.x / d);
  } else {
    float thetaMax = M_PI;
    if (posWordSpace.x < 0.0) {
      thetaMax = -1.0 * thetaMax;
    }
    theta = thetaMax - asin(posWordSpace.x / d);
  }

  float rho = asin(posWordSpace.y / d);

  float xNew = theta / M_PI;
  float yNew = (r * tan(rho)) / h;
  float zNew = (d - dmin) / (dmax - dmin);

  gl_Position = vec4(xNew, yNew, zNew, 1.0);
  debug = vec3(xNew, yNew, zNew);

  // gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
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



const skyboxGeometry = new BoxGeometry(10, 10, 10);
const skyboxMaterials = [
  new ShaderMaterial({ 
    vertexShader: vertex, fragmentShader: fragment, 
    uniforms: { 'tex': { value: textureFace } },    // texture_px } }, 
    side: DoubleSide 
  }),
  new ShaderMaterial({ 
    vertexShader: vertex, fragmentShader: fragment, 
    uniforms: { 'tex': { value: textureFace } },    // texture_nx } }, 
    side: DoubleSide 
  }),
  new ShaderMaterial({ 
    vertexShader: vertex, fragmentShader: fragment, 
    uniforms: { 'tex': { value: textureFace } },    // texture_py } }, 
    side: DoubleSide 
  }),
  new ShaderMaterial({ 
    vertexShader: vertex, fragmentShader: fragment, 
    uniforms: { 'tex': { value: textureFace } },    // texture_ny } }, 
    side: DoubleSide 
  }),
  new ShaderMaterial({ 
    vertexShader: vertex, fragmentShader: fragment, 
    uniforms: { 'tex': { value: textureFace } },    // texture_pz } }, 
    side: DoubleSide 
  }),
  new ShaderMaterial({ 
    vertexShader: vertex, fragmentShader: fragment, 
    uniforms: { 'tex': { value: textureFace } },    // texture_nz } }, 
    side: DoubleSide 
  }),
]
const skybox = new Mesh(skyboxGeometry, skyboxMaterials);
skybox.position.set(0, 0, 0);
scene.add(skybox);


const cube = new Mesh(
  new BoxGeometry(1, 1, 1), 
  new ShaderMaterial({ 
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: { 'tex': {value: lowRes} }, 
    side: DoubleSide
  }));
cube.position.set(0, 0, 1.5);
scene.add(cube);





function loop() {
  // skybox.rotateY(0.003);
  // camera.rotateY(0.002);
  cube.rotateX(0.003);
  renderer.render(scene, camera);

  setTimeout(loop, 10);
}

loop();