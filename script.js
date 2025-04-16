document.getElementById('fetch-data').addEventListener('click', async () => {
  const output = document.getElementById('satellite-data');
  output.textContent = 'Fetching data...';

  try {
    // Fetch TLE data from CelesTrak
    const response = await fetch('https://celestrak.com/NORAD/elements/stations.txt');
    const data = await response.text();

    // Parse the TLE data
    const satellites = parseTLEData(data);
    
    // For each satellite, get its position and display the information
    const positions = await Promise.all(satellites.map(async (satellite) => {
      const position = await getSatellitePosition(satellite);
      return { name: satellite.name, ...position };
    }));

    // Display the satellite data
    output.textContent = positions.map(position => 
      `${position.name}: Lat: ${position.lat}, Long: ${position.lon}, Alt: ${position.alt}`
    ).join('\n');

  } catch (error) {
    output.textContent = `Error fetching data: ${error.message}`;
  }
});

function parseTLEData(tleData) {
  const lines = tleData.split('\n');
  const satellites = [];
  
  for (let i = 0; i < lines.length; i += 3) {
    const name = lines[i].trim();
    const line1 = lines[i + 1].trim();
    const line2 = lines[i + 2].trim();

    if (name && line1 && line2) {
      satellites.push({ name, line1, line2 });
    }
  }

  return satellites;
}

async function getSatellitePosition(satellite) {
  try {
    const satrec = satellite.twoline2satrec(satellite.line1, satellite.line2);
    const currentTime = new Date();

    // Get satellite position at the current time
    const positionAndVelocity = satellite.propagate(satrec, currentTime);
    
    if (positionAndVelocity.error) {
      return { lat: 'N/A', lon: 'N/A', alt: 'N/A' };
    }

    // Convert the ECI position to latitude, longitude, and altitude
    const { latitude, longitude, altitude } = satellite.eciToGeodetic(positionAndVelocity.position, currentTime);
    
    return { lat: latitude.toFixed(6), lon: longitude.toFixed(6), alt: altitude.toFixed(2) };

  } catch (error) {
    console.error('Error getting satellite position:', error);
    return { lat: 'Error', lon: 'Error', alt: 'Error' };
  }
}
