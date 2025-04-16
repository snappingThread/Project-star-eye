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
  try {
    await loadSatelliteJs();

    // Fetch TLE data
    const response = await fetch('https://celestrak.com/NORAD/elements/stations.txt');
    const tleData = await response.text();
    console.log('Raw TLE Data:', tleData);

    // Parse TLE data
    const satellites = parseTLEData(tleData);
    console.log('Parsed Satellites:', satellites);

    // Calculate positions
    const now = new Date();
    const positions = satellites.map((sat) => {
      const position = calculatePosition(sat, now);
      console.log(`Position for ${sat.name}:`, position);
      return `${sat.name}: Lat: ${position.latitude.toFixed(2)}, Lon: ${position.longitude.toFixed(2)}, Alt: ${position.altitude.toFixed(2)} km`;
    });

    // Display results
    output.textContent = positions.join('\n');
  } catch (error) {
    console.error('Error fetching or processing data:', error);
    output.textContent = `Error: ${error.message}`;
  }
}

function parseTLEData(tleText) {
  const lines = tleText.split('\n').filter((line) => line.trim());
  const satellites = [];
  for (let i = 0; i < lines.length; i += 3) {
    if (lines[i + 2]) {
      const name = lines[i].trim();
      const tle1 = lines[i + 1].trim();
      const tle2 = lines[i + 2].trim();
      console.log(`Satellite: ${name}, TLE 1: ${tle1}, TLE 2: ${tle2}`);
      satellites.push({ name, tle1, tle2 });
    }
  }
  return satellites;
}

function calculatePosition(satelliteData, date) {
  const satrec = satellite.twoline2satrec(satelliteData.tle1, satelliteData.tle2);
  const positionAndVelocity = satellite.propagate(satrec, date);

  if (!positionAndVelocity.position) {
    console.warn(`Propagation failed for ${satelliteData.name}`);
    return { latitude: 0, longitude: 0, altitude: 0 };
  }

  const gmst = satellite.gstime(date);
  const position = satellite.eciToGeodetic(positionAndVelocity.position, gmst);

  return {
    latitude: satellite.degreesLat(position.latitude),
    longitude: satellite.degreesLong(position.longitude),
    altitude: position.height / 1000, // Convert to km
  };
}

// Update positions every 500ms
setInterval(fetchSatelliteData, 500);
