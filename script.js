// Include the satellite.js library by adding this script to your HTML:
// <script src="https://cdn.jsdelivr.net/npm/satellite.js@2.0.0/dist/satellite.min.js"></script>

// Fetch data from Celestrak's satellite data URL
const url = "https://www.celestrak.com/NORAD/elements/stations.txt";

// Function to fetch and display satellite data
async function fetchSatelliteData() {
  try {
    const response = await fetch(url);
    const data = await response.text();

    const satellites = parseTLEData(data);

    displaySatelliteData(satellites);
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
}

// Function to parse TLE data into an array of satellite objects
function parseTLEData(data) {
  const lines = data.split("\n").filter(line => line.trim() !== "");
  const satellites = [];

  for (let i = 0; i < lines.length; i += 3) {
    const name = lines[i];
    const tle1 = lines[i + 1];
    const tle2 = lines[i + 2];
    
    satellites.push({
      name,
      tle1,
      tle2
    });
  }

  return satellites;
}

// Function to calculate the satellite's position using satellite.js
function getSatellitePosition(tle1, tle2) {
  const satrec = satellite.twoline2satrec(tle1, tle2);
  
  // Get current time
  const now = new Date();
  
  // Propagate the satellite position
  const positionAndVelocity = satellite.propagate(satrec, now);

  if (!positionAndVelocity.position) {
    return { lat: "N/A", lon: "N/A", alt: "N/A" }; // Handle error in propagation
  }

  const positionEci = positionAndVelocity.position;
  const gmst = satellite.gstime(now);
  const positionGeodetic = satellite.eciToGeodetic(positionEci, gmst);

  // Convert radians to degrees for lat and lon
  const lat = positionGeodetic.latitude * (180 / Math.PI);
  const lon = positionGeodetic.longitude * (180 / Math.PI);
  const alt = positionGeodetic.height / 1000; // Convert to kilometers

  return { lat: lat.toFixed(2), lon: lon.toFixed(2), alt: alt.toFixed(2) };
}

// Function to display the satellite data on the page
function displaySatelliteData(satellites) {
  const list = document.getElementById("satellite-list");

  satellites.forEach(satellite => {
    const li = document.createElement("li");
    li.classList.add("satellite-item");

    // Calculate satellite position
    const position = getSatellitePosition(satellite.tle1, satellite.tle2);

    li.innerHTML = `
      <div class="satellite-info">
        <h3>${satellite.name}</h3>
        <p><strong>TLE 1:</strong> ${satellite.tle1}</p>
        <p><strong>TLE 2:</strong> ${satellite.tle2}</p>
      </div>
      <div class="satellite-position">
        <h4>Calculated Position</h4>
        <p><strong>Latitude:</strong> ${position.lat}°</p>
        <p><strong>Longitude:</strong> ${position.lon}°</p>
        <p><strong>Altitude:</strong> ${position.alt} km</p>
      </div>
    `;

    list.appendChild(li);
  });
}

// Initialize the fetching of satellite data
fetchSatelliteData();
