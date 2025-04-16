document.addEventListener('DOMContentLoaded', async () => {
  const output = document.getElementById('output');
  const fetchDataButton = document.getElementById('fetch-data');

  // Check if the output element exists before proceeding
  if (!output) {
    console.error('Output element not found!');
    return;
  }

  // Fetch and parse TLE data when the button is clicked
  fetchDataButton.addEventListener('click', async () => {
    output.textContent = 'Fetching data...';
    await fetchSatelliteData();
  });

  // Automatically recalculate satellite data every 500ms
  setInterval(async () => {
    output.textContent = 'Recalculating satellite positions...'; // Optional: Show recalculation message
    await updateSatellitePositions(); // Recalculate the positions every 500ms
  }, 500); // 500 milliseconds interval
});

// Load satellite.js
async function loadSatelliteJs() {
  if (!window.satellite) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/satellite.js/4.0.0/satellite.min.js';
    document.head.appendChild(script);
    await new Promise((resolve) => (script.onload = resolve));
  }
}

// Declare satellites array globally
let satellites = [];

// Fetch and parse the TLE data, then calculate positions
async function fetchSatelliteData() {
  const output = document.getElementById('output');
  try {
    await loadSatelliteJs();

    // Fetch TLE data from CelesTrak
    const response = await fetch('https://celestrak.com/NORAD/elements/stations.txt');
    const tleData = await response.text();

    // Parse the TLE data into satellite objects
    satellites = parseTLEData(tleData);

    // Initially calculate and display positions
    await updateSatellitePositions();
  } catch (error) {
    output.textContent = `Error fetching or processing data: ${error.message}`;
  }
}

// Parse TLE data into an array of satellite objects
function parseTLEData(tleText) {
  const lines = tleText.split('\n').filter((line) => line.trim());
  const parsedSatellites = [];
  for (let i = 0; i < lines.length; i += 3) {
    if (lines[i] && lines[i + 1] && lines[i + 2]) {
      parsedSatellites.push({
        name: lines[i].trim(),
        tle1: lines[i + 1].trim(),
        tle2: lines[i + 2].trim(),
      });
    }
  }
  return parsedSatellites;
}

// Calculate and update satellite positions based on the current time
async function updateSatellitePositions() {
  const output = document.getElementById('output');
  const now = new Date();
  const positions = satellites.map((sat) => {
    const position = calculatePosition(sat, now);
    return `${sat.name}: Lat: ${position.latitude.toFixed(2)}, Lon: ${position.longitude.toFixed(2)}, Alt: ${position.altitude.toFixed(2)} km`;
  });

  // Display updated positions
  output.textContent = positions.join('\n');
}

// Calculate the position of a satellite at a given time
function calculatePosition(satelliteData, date) {
  const satrec = satellite.twoline2satrec(satelliteData.tle1, satelliteData.tle2);
  const positionAndVelocity = satellite.propagate(satrec, date);
  const gmst = satellite.gstime(date);

  const position = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
  return {
    latitude: satellite.degreesLat(position.latitude),
    longitude: satellite.degreesLong(position.longitude),
    altitude: position.height / 1000, // Convert to km
  };
}
