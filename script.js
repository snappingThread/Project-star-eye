// Import satellite.js library dynamically
async function loadSatelliteJs() {
  if (!window.satellite) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/satellite.js/4.0.0/satellite.min.js';
    document.head.appendChild(script);
    await new Promise((resolve) => (script.onload = resolve));
  }
}

// Fetch and process TLE data
async function fetchSatelliteData() {
  const output = document.getElementById('output');
  output.textContent = 'Fetching data...';

  try {
    await loadSatelliteJs();

    // Fetch TLE data from CelesTrak
    const response = await fetch('https://celestrak.com/NORAD/elements/stations.txt');
    const tleData = await response.text();

    // Parse TLE data into objects
    const satellites = parseTLEData(tleData);

    // Calculate satellite positions
    const now = new Date();
    const positions = satellites.map((sat) => {
      const position = calculatePosition(sat, now);
      return `${sat.name}: Lat: ${position.latitude.toFixed(2)}, Lon: ${position.longitude.toFixed(2)}, Alt: ${position.altitude.toFixed(2)} km`;
    });

    // Display results
    output.textContent = positions.join('\n');
  } catch (error) {
    output.textContent = `Error fetching or processing data: ${error.message}`;
    console.error(error);
  }
}

// Parse TLE data
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

// Calculate satellite position
function calculatePosition(satelliteData, date) {
  const satrec = satellite.twoline2satrec(satelliteData.tle1, satelliteData.tle2);
  const positionAndVelocity = satellite.propagate(satrec, date);
  const gmst = satellite.gstime(date);

  if (!positionAndVelocity.position) {
    console.warn(`Unable to propagate ${satelliteData.name}`);
    return { latitude: 0, longitude: 0, altitude: 0 }; // Default invalid data
  }

  const position = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
  return {
    latitude: satellite.degreesLat(position.latitude),
    longitude: satellite.degreesLong(position.longitude),
    altitude: position.height / 1000, // Convert to km
  };
}

// Initial data fetch
fetchSatelliteData();
