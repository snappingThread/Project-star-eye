const satelliteDataEl = document.getElementById('satellite-data');
const asciiMapEl = document.getElementById('ascii-map');

// Draw ASCII map
function drawSolarSystem(satellites) {
  const width = 50; // Width of the map
  const height = 20; // Height of the map
  const map = Array.from({ length: height }, () => Array(width).fill(' '));

  // Place Earth at the center
  const earthX = Math.floor(width / 2);
  const earthY = Math.floor(height / 2);
  map[earthY][earthX] = 'O'; // Earth represented as 'O'

  // Plot satellites
  satellites.forEach((sat) => {
    const offsetX = Math.floor((sat.lat / 90) * (width / 2));
    const offsetY = Math.floor((sat.long / 180) * (height / 2));

    const x = Math.max(0, Math.min(width - 1, earthX + offsetX));
    const y = Math.max(0, Math.min(height - 1, earthY - offsetY));

    map[y][x] = 'X'; // Satellite represented as 'X'
    const label = sat.name.substring(0, 5); // Label near satellite (shortened)
    if (x + label.length < width) {
      for (let j = 0; j < label.length; j++) {
        map[y][x + 1 + j] = label[j];
      }
    }
  });

  return map.map(row => row.join('')).join('\n');
}

// Fetch and process TLE data
async function fetchSatelliteData() {
  try {
    const response = await fetch('https://celestrak.com/NORAD/elements/stations.txt');
    const data = await response.text();

    const satellites = [];
    const lines = data.split('\n');
    for (let i = 0; i < lines.length; i += 3) {
      if (lines[i]) {
        satellites.push({
          name: lines[i].trim(),
          lat: Math.random() * 180 - 90, // Placeholder latitude
          long: Math.random() * 360 - 180, // Placeholder longitude
          alt: Math.random() * 400 + 200, // Placeholder altitude
        });
      }
    }

    return satellites;
  } catch (error) {
    console.error('Error fetching satellite data:', error);
    return [];
  }
}

// Update display
async function updateDisplay() {
  const satellites = await fetchSatelliteData();

  // Update satellite data display
  const satelliteInfo = satellites
    .map(
      (sat) =>
        `Name: ${sat.name}\nLat: ${sat.lat.toFixed(2)}°\nLong: ${sat.long.toFixed(2)}°\nAlt: ${sat.alt.toFixed(2)} km\n`
    )
    .join('\n');
  satelliteDataEl.textContent = satelliteInfo;

  // Update ASCII map
  const map = drawSolarSystem(satellites);
  asciiMapEl.textContent = map;
}

// Update every 500 milliseconds
setInterval(updateDisplay, 500);
