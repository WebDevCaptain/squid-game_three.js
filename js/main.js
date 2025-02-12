const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.setClearColor(0xb7c3f3, 1);

const light = new THREE.AmbientLight(0xffffff); // soft white light
scene.add(light);

// global vars
const start_position = 3;
const end_position = -start_position;
const text = document.querySelector(".text");
const TIME_LIMIT = 10;
let gameStatus = "loading";
let isLookingBackward = true;

function createCube(size, positionX, rotY = 0, color = 0xfbc851) {
  const geometry = new THREE.BoxGeometry(size.w, size.h, size.d);
  const material = new THREE.MeshBasicMaterial({ color });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.x = positionX;
  cube.rotation.y = rotY;
  scene.add(cube);

  return cube;
}

camera.position.z = 5;

const loader = new THREE.GLTFLoader();

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class Doll {
  constructor() {
    loader.load("model/scene.gltf", (gltf) => {
      scene.add(gltf.scene);
      gltf.scene.scale.set(0.4, 0.4, 0.4);
      gltf.scene.position.set(0, -1, 0);
      this.doll = gltf.scene;
    });
  }

  lookBackward() {
    // this.doll.rotation.y = -3.15;
    gsap.to(this.doll.rotation, { y: -3.15, duration: 0.45 });
    setTimeout(() => {
      isLookingBackward = true;
    }, 150);
  }

  lookForward() {
    // this.doll.rotation.y = 0;
    gsap.to(this.doll.rotation, { y: 0, duration: 0.45 });
    setTimeout(() => {
      isLookingBackward = false;
    }, 450);
  }

  async start() {
    this.lookBackward();
    await delay(Math.random() * 1000 + 1000);
    this.lookForward();
    await delay(Math.random() * 750 + 750);
    this.start();
  }
}

function createTrack() {
  createCube(
    { w: start_position * 2 + 0.2, h: 1.5, d: 1 },
    0,
    0,
    0xe5a716
  ).position.z = -1;
  createCube({ w: 0.2, h: 1.5, d: 1 }, start_position, 0.35);
  createCube({ w: 0.2, h: 1.5, d: 1 }, end_position, -0.35);
}
createTrack();

class Player {
  constructor() {
    const geometry = new THREE.SphereGeometry(0.3, 32, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.x = start_position;
    sphere.position.z = 1;
    scene.add(sphere);
    this.player = sphere;
    this.playerInfo = {
      positionX: start_position,
      velocity: 0,
    };
  }

  run() {
    this.playerInfo.velocity = 0.03;
  }

  stop() {
    // this.playerInfo.velocity = 0;
    gsap.to(this.playerInfo, { velocity: 0, duration: 0.1 });
  }

  check() {
    if (this.playerInfo.velocity > 0 && !isLookingBackward) {
      // alert("You lose");
      text.innerText = "You lose";
      gameStatus = "over";
    }

    if (this.playerInfo.positionX < end_position + 0.4) {
      // alert("You won");
      text.innerText = "You won ~!!!";
      gameStatus = "over";
    }
  }

  update() {
    this.check();
    this.playerInfo.positionX -= this.playerInfo.velocity;
    this.player.position.x = this.playerInfo.positionX;
  }
}

let doll = new Doll();
let player = new Player();

async function init() {
  await delay(500);
  text.innerText = "Starting in 3";
  await delay(500);
  text.innerText = "Starting in 2";
  await delay(500);
  text.innerText = "Starting in 1";
  await delay(500);
  text.innerText = "Go !!";
  startGame();
}

function startGame() {
  gameStatus = "started";
  let progressBar = createCube({ w: 5, h: 0.1, d: 1 }, 0);
  progressBar.position.y = 3.35;
  gsap.to(progressBar.scale, { x: 0, duration: TIME_LIMIT, ease: "none" });
  doll.start();
  setTimeout(() => {
    if (gameStatus !== "over") {
      text.innerText = "Time over !!";
      gameStatus = "over";
    }
  }, TIME_LIMIT * 1000);
}

init();

function animate() {
  if (gameStatus === "over") return;

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  player.update();
}

animate();

window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  render.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("keydown", (e) => {
  if (gameStatus !== "started") return;

  if (e.key === "ArrowUp") {
    player.run();
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowUp") {
    player.stop();
  }
});
