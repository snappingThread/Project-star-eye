// Import satellite.js library
async function loadSatelliteJs() {
  if (!window.satellite) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/satellite.js/4.0.0/satellite.min.js';
    document.head.appendChild(script);
    await new Promise((resolve) => (script.onload = resolve));
  }
}

async function fetchSatelliteData() {
  const output = document.getElementById('output');
  output.textContent = 'Fetching data...';

  try {
    await loadSatelliteJs();

    // Fetch TLE data from CelesTrak
    const response = await fetch('https://celestrak.com/NORAD/elements/stations.txt');
    const tleData = await response.text();

    // Parse the TLE data into satellite objects
    const satellites = parseTLEData(tleData);
    console.log('Parsed Satellites:', satellites);

    // Get positions for each satellite
    const now = new Date();
    const positions = satellites.map((sat) => {
      try {
        const position = calculatePosition(sat, now);
        console.log(`Satellite: ${sat.name}`, position);
        return `${sat.name}: Lat: ${position.latitude.toFixed(2)}, Lon: ${position.longitude.toFixed(2)}, Alt: ${position.altitude.toFixed(2)} km`;
      } catch (error) {
        console.error(`Error processing satellite: ${sat.name}`, error);
        return `${sat.name}: Error calculating position.`;
      }
    });

    // Display positions
    output.textContent = positions.join('\n');
  } catch (error) {
    output.textContent = `Error fetching or processing data: ${error.message}`;
  }
}

function parseTLEData(tleText) {
  const lines = tleText.split('\n').filter((line) => line.trim());
  const satellites = [];
  for (let i = 0; i < lines.length; i += 3) {
    if (lines[i + 2]) {
      satellites.push({
        name: lines[i].trim(),
        tle1: lines[i + 1].trim(),
        tle2: lines[i + 2].trim(),
      });
    }
  }
  return satellites;
}

function calculatePosition(satelliteData, date) {
  const satrec = satellite.twoline2satrec(satelliteData.tle1, satelliteData.tle2);
  const positionAndVelocity = satellite.propagate(satrec, date);

  if (!positionAndVelocity.position) {
    throw new Error('Invalid position data.');
  }

  const gmst = satellite.gstime(date);
  const position = satellite.eciToGeodetic(positionAndVelocity.position, gmst);

  return {
    latitude: satellite.degreesLat(position.latitude),
    longitude: satellite.degreesLong(position.longitude),
    altitude: position.height / 1000, // Convert meters to kilometers
  };
}

// Set up automatic updates
function updateDisplay() {
  fetchSatelliteData();
}
setInterval(updateDisplay, 500);
updateDisplay(); // Initial call to populate data immediately
