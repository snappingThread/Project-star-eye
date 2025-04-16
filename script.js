import satellite from 'https://cdn.jsdelivr.net/npm/satellite.js@2.0.0/dist/satellite.js';

document.getElementById('fetch-data').addEventListener('click', async () => {
  const output = document.getElementById('satellite-data');
  output.textContent = 'Fetching data...';

  try {
    // Fetch TLE data from CelesTrak
    const response = await fetch('https://celestrak.com/NORAD/elements/stations.txt');
    const data = await response.text();

    // Split the data into individual satellites
    const satData = data.split('\n').filter(line => line.trim().length > 0);

    // Extract TLE lines and fetch position data for each satellite
    const satellitePositions = [];
    for (let i = 0; i < satData.length; i += 3) {
      const name = satData[i];
      const tleLine1 = satData[i + 1];
      const tleLine2 = satData[i + 2];

      // Get satellite record using twoline2satrec
      const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

      // Get current position of the satellite
      const currentTime = new Date();
      const positionAndVelocity = satellite.propagate(satrec, currentTime);

      if (positionAndVelocity) {
        const position = positionAndVelocity.position;
        const lat = satellite.degreesLat(position);
        const lon = satellite.degreesLong(position);
        const alt = satellite.metersToKilometers(position[2]);

        satellitePositions.push({
          name: name,
          lat: lat,
          lon: lon,
          alt: alt,
        });
      }
    }

    // Display satellite position data
    output.textContent = satellitePositions.map(sat => 
      `${sat.name} - Lat: ${sat.lat.toFixed(2)}, Long: ${sat.lon.toFixed(2)}, Alt: ${sat.alt.toFixed(2)} km`
    ).join('\n');
  } catch (error) {
    output.textContent = `Error fetching data: ${error.message}`;
  }
});
