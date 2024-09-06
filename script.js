import * as THREE from "/build/three.module.js";
import { FlyControls } from "/jsm/controls/FlyControls.js";
import { Lensflare, LensflareElement } from "/jsm/objects/Lensflare.js";

//THREEは以下の変数必須
let camera, scene, renderer;

//Flyの変数
let controls;

const clock = new THREE.Clock();

init();

function init() {
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  //カメラの視野角、アスペクト比、開始距離、終了距離
  camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    1,
    15000
  );
  //cameraの位置は以下のように変える。
  camera.position.z = 250;

  //scenes
  scene = new THREE.Scene();

  //geometry = オブジェクト（四角い箱とか)
  //BoxGeometryは立方体、高さ、幅、奥行き
  const size = 250;
  const geometry = new THREE.BoxGeometry(size, size, size);

  //materialは材質、色 色は16進数でかく. specularは鏡面反射、
  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0xffffff, //鏡面反射
    shininess: 50, //輝度
  });

  for (let i = 0; i < 2500; i++) {
    const mesh = new THREE.Mesh(geometry, material);

    //Meshが位置する場所を指定する

    mesh.position.x = 8000 * (2.0 * Math.random() - 1.0);
    mesh.position.y = 8000 * (2.0 * Math.random() - 1.0);
    mesh.position.z = 8000 * (2.0 * Math.random() - 1.0);

    //回転度合いをランダムに決める
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    mesh.rotation.z = Math.random() * Math.PI;

    //meshを定義したら絶対 scene.add(mesh);をする
    scene.add(mesh);
  }

  //平行光源を設定。これしないと見えない
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.03);
  scene.add(dirLight);

  //レンズフレアを追加する
  const textureLoader = new THREE.TextureLoader();

  const textureFlare = textureLoader.load("./textures/LensFlare.png");

  addLight(0.08, 0.3, 0.9, 0, 0, -1000);

  //ポイント光源を追加する
  //h:色相、s：彩度、l:光
  function addLight(h, s, l, x, y, z) {
    const light = new THREE.PointLight(0xffffff, 1.5, 2000);
    light.color.setHSL(h, s, l);
    light.position.set(x, y, z);
    scene.add(light);

    const lensflare = new Lensflare();
    lensflare.addElement(
      new LensflareElement(textureFlare, 700, 0, light.color)
    );

    scene.add(lensflare);
  }

  //リサイズ操作
  window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(window.devicePixelRatio);
  });

  //renderer これもないと映らない。
  renderer = new THREE.WebGLRenderer();
  //これで画面いっぱいに描写（レンダリング）する。
  renderer.setSize(window.innerWidth, window.innerHeight);
  //これをすると画面が明るくなる
  renderer.outputEncoding = THREE.sRGBEncoding;
  //どこに描写するのか指定する。
  document.body.appendChild(renderer.domElement);

  //マウス操作を行う
  //引数には動かしたいものを入れる。
  //renderの宣言の後に入れる
  controls = new FlyControls(camera, renderer.domElement);

  //mobementSpeedはマウスの右と左クリックの速度を変える
  controls.movementSpeed = 2500;

  //カーソルの位置でスピードを帰るのはcontrols.rollSpeedで買える
  controls.rollSpeed = Math.PI / 20;

  animate();
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta(); //経過時間を取得
  controls.update(delta);
  renderer.render(scene, camera);
}
