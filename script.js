import * as satellite from "https://cdn.jsdelivr.net/npm/satellite.js@4.0.0/+esm";

document.getElementById('fetch-data').addEventListener('click', async () => {
  const output = document.getElementById('output');
  output.textContent = 'Fetching data...';

  try {
    // Fetch TLE data from CelesTrak
    const response = await fetch('https://celestrak.com/NORAD/elements/stations.txt');
    const data = await response.text();

    // Parse the TLE data
    const satellites = parseTLEData(data);

    // Set an interval to update the data every second
    setInterval(() => {
      // Generate current positions for the satellites
      const positions = satellites.map((satelliteData) => {
        const { name, tle1, tle2 } = satelliteData;
        const position = getSatellitePosition(tle1, tle2);
        return `${name}: Lat: ${position.latitude.toFixed(2)}°, Lon: ${position.longitude.toFixed(2)}°, Alt: ${position.altitude.toFixed(2)} km`;
      });

      // Display parsed and calculated data
      output.textContent = positions.join('\n');
    }, 1000); // Update every 1000 milliseconds (1 second)

  } catch (error) {
    output.textContent = `Error fetching data: ${error.message}`;
  }
});

function parseTLEData(data) {
  const lines = data.split('\n');
  const satellites = [];
  for (let i = 0; i < lines.length; i += 3) {
    const name = lines[i].trim();
    const tle1 = lines[i + 1]?.trim();
    const tle2 = lines[i + 2]?.trim();
    if (name && tle1 && tle2) {
      satellites.push({ name, tle1, tle2 });
    }
  }
  return satellites;
}

function getSatellitePosition(tle1, tle2) {
  const satrec = satellite.twoline2satrec(tle1, tle2);
  const now = new Date();
  const positionAndVelocity = satellite.propagate(satrec, now);

  if (!positionAndVelocity.position) {
    return { latitude: 0, longitude: 0, altitude: 0 }; // Default if position calculation fails
  }

  const gmst = satellite.gstime(now);
  const position = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
  const latitude = satellite.degreesLat(position.latitude);
  const longitude = satellite.degreesLong(position.longitude);
  const altitude = position.height / 1000; // Convert from meters to kilometers

  return { latitude, longitude, altitude };
}
