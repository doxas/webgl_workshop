/**
 * MeshLambertMaterial で使われているシェーダの雛形
 * https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderLib/meshlambert.glsl.js
 */

import * as THREE from '../lib/three.module.js';
import { OrbitControls } from '../lib/OrbitControls.js';
import { Pane } from '../lib/tweakpane-4.0.3.min.js';

window.addEventListener('DOMContentLoaded', async () => {
  const wrapper = document.querySelector('#webgl');
  const app = new ThreeApp();
  await app.load();
  app.initialize(wrapper);
  app.render();
}, false);

/**
 * 指定されたパスからファイルを読み込みテキストとして解決する
 */
async function loadText(path) {
  const response = await fetch(path);
  return await response.text();
}

class ThreeApp {
  renderer;             // レンダラ
  scene;                // シーン
  camera;               // カメラ
  directionalLight;     // 平行光源（ディレクショナルライト）
  geometry;             // ジオメトリ
  material;             // マテリアル
  mesh;                 // メッシュ
  controls;             // オービットコントロール
  axesHelper;           // 軸ヘルパー
  vertexShaderSource;   // 頂点シェーダのソースコード
  fragmentShaderSource; // フラグメントシェーダのソースコード
  uniforms;             // カスタム uniform 変数

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
   * ロード処理
   */
  async load() {
    this.vertexShaderSource = await loadText('./main.vert');
    this.fragmentShaderSource = await loadText('./main.frag');
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
    // コンパイル直前に呼び出されるコールバックを使って既存のマテリアルを上書きする
    this.uniforms = {
      tone: {value: 2.0},
      blockSize: {value: 10.0},
      dotSize: {value: 0.5},
    };
    this.material.onBeforeCompile = (shader) => {
      shader.vertexShader = this.vertexShaderSource;
      shader.fragmentShader = this.fragmentShaderSource;
      // Object.assign で参照を結合しておく
      Object.assign(shader.uniforms, this.uniforms);
    };

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

    const pane = new Pane();
    const parameters = {
      tone: this.uniforms.tone.value,
      block: this.uniforms.blockSize.value,
      dot: this.uniforms.dotSize.value,
    };
    pane.addBinding(parameters, 'tone', {
      min: 2.0,
      max: 5.0,
      step: 1.0,
    })
    .on('change', (v) => {
      this.uniforms.tone.value = v.value;
    });
    pane.addBinding(parameters, 'block', {
      min: 1.0,
      max: 50.0,
    })
    .on('change', (v) => {
      this.uniforms.blockSize.value = v.value;
    });
    pane.addBinding(parameters, 'dot', {
      min: 0.01,
      max: 1.0,
    })
    .on('change', (v) => {
      this.uniforms.dotSize.value = v.value;
    });
  }
}
