
import * as THREE from '../lib/three.module.js';
import { OrbitControls } from '../lib/OrbitControls.js';

window.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.querySelector('#webgl');
  const app = new ThreeApp();
  app.initialize(wrapper);
  app.render();
}, false);

class ThreeApp {
  renderer;         // レンダラ
  scene;            // シーン
  camera;           // カメラ
  directionalLight; // 平行光源（ディレクショナルライト）
  geometry;         // ジオメトリ
  material;         // マテリアル
  mesh;             // メッシュ
  controls;         // オービットコントロール
  axesHelper;       // 軸ヘルパー

  /**
   * コンストラクタ
   * @constructor
   */
  constructor() {
    // this のバインド
    this.render = this.render.bind(this);
    this.resize = this.resize.bind(this);
  }

  /**
   * 初期化処理
   * @param {HTMLElement} wrapper - canvas 要素を append する親要素
   */
  initialize(wrapper) {
    // シーン
    this.scene = new THREE.Scene();

    // ジオメトリ
    this.geometry = new THREE.TorusGeometry(1.0, 0.4, 64, 64);

    // マテリアル
    const greenColor = new THREE.Color(0x33ff66);
    this.material = new THREE.MeshLambertMaterial({color: greenColor});

    // メッシュ
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);

    // 軸ヘルパー
    const axesBarLength = 5.0;
    this.axesHelper = new THREE.AxesHelper(axesBarLength);
    this.scene.add(this.axesHelper);

    // ディレクショナルライト（平行光源）
    const whiteColor = new THREE.Color(0xffffff);
    this.directionalLight = new THREE.DirectionalLight(whiteColor);
    this.directionalLight.position.set(1.0, 1.0, 1.0);
    this.scene.add(this.directionalLight);

    // レンダラー
    const grayColor = new THREE.Color(0x333333);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(grayColor);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    wrapper.appendChild(this.renderer.domElement);

    // カメラ
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      20.0,
    );
    this.camera.position.set(0.0, 0.0, 5.0);

    // コントロール
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // イベントの設定
    this.eventSetting();
  }

  /**
   * 描画処理
   */
  render() {
    // 恒常ループ
    requestAnimationFrame(this.render);

    // レンダラーにシーンとカメラを指定して描画させる
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * リサイズ
   */
  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  /**
   * イベントの設定
   */
  eventSetting() {
    window.addEventListener('resize', this.resize);
  }
}
