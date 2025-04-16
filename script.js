import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js";

// Fetch data from Celestrak
const url = "https://www.celestrak.com/NORAD/elements/stations.txt";

async function fetchSatelliteData() {
  try {
    const response = await fetch(url);
    const data = await response.text();
    const satellites = parseTLEData(data);

    displaySatelliteData(satellites);
    initThreeJS(satellites);
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
}

function parseTLEData(data) {
  const lines = data.split("\n").filter(line => line.trim() !== "");
  const satellites = [];
  for (let i = 0; i < lines.length; i += 3) {
    const name = lines[i];
    const tle1 = lines[i + 1];
    const tle2 = lines[i + 2];
    satellites.push({ name, tle1, tle2 });
  }
  return satellites;
}

function displaySatelliteData(satellites) {
  const list = document.getElementById("satellite-list");
  list.innerHTML = "";
  satellites.forEach(satellite => {
    const li = document.createElement("li");
    li.className = "satellite-item";
    li.innerHTML = `
      <div class="satellite-info">
        <h3>${satellite.name}</h3>
        <p><strong>TLE 1:</strong> ${satellite.tle1}</p>
        <p><strong>TLE 2:</strong> ${satellite.tle2}</p>
      </div>
    `;
    list.appendChild(li);
  });
}

// Three.js visualization
function initThreeJS(satellites) {
  const container = document.getElementById("globe-container");
  const width = container.clientWidth;
  const height = container.clientHeight;

  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  // Add Earth
  const geometry = new THREE.SphereGeometry(5, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color: 0x0077ff,
    wireframe: false,
  });
  const earth = new THREE.Mesh(geometry, material);
  scene.add(earth);

  // Lighting
  const light = new THREE.PointLight(0xffffff, 1, 100);
  light.position.set(10, 10, 10);
  scene.add(light);

  // Add satellites
  satellites.forEach((sat, index) => {
    const satelliteMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );

    // Example: Random positions for now
    const angle = (index / satellites.length) * Math.PI * 2;
    satelliteMarker.position.set(
      7 * Math.cos(angle),
      7 * Math.sin(angle),
      0
    );

    scene.add(satelliteMarker);
  });

  // Camera position
  camera.position.z = 15;

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    earth.rotation.y += 0.001; // Rotate the Earth
    renderer.render(scene, camera);
  }

  animate();
}

fetchSatelliteData();
