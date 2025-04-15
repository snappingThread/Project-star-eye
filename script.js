const n2yoApiKey = "PNYRJG-6L9LNC-TKCCM5-5GDE";  // N2YO API Key
const celestrakUrl = "https://www.celestrak.com/NORAD/elements/stations.txt";  // CelesTrak URL

// Fetch satellite data from CelesTrak (TLE data)
async function fetchCelestrakData() {
  try {
    const response = await fetch(celestrakUrl);
    if (!response.ok) throw new Error("Failed to fetch data from CelesTrak.");
    const data = await response.text();
    parseTLEData(data);
  } catch (error) {
    console.error("Error fetching CelesTrak data:", error);
    document.getElementById("satelliteData").innerHTML = "Failed to load satellite data.";
  }
}

// Parse TLE Data and call N2YO API for satellite info
function parseTLEData(data) {
  const lines = data.split("\n");
  const satellites = [];
  
  // Parse the TLE data and collect the satellite names
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() !== "") {
      const name = lines[i].trim();
      const tle1 = lines[i + 1].trim();
      const tle2 = lines[i + 2].trim();

      satellites.push({ name, tle1, tle2 });
      i += 2;
    }
  }

  // Get satellite positions for each satellite
  satellites.forEach(satellite => {
    getSatellitePosition(satellite);
  });
}

// Fetch satellite position from N2YO API
async function getSatellitePosition(satellite) {
  const url = `https://api.n2yo.com/rest/v1/satellite/positions/${satellite.name}/0/0/0/10/&apiKey=${n2yoApiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch position for ${satellite.name}`);
    const positionData = await response.json();
    
    displaySatelliteData(satellite, positionData);
  } catch (error) {
    console.error("Error fetching position data:", error);
  }
}

// Display satellite data on the page
function displaySatelliteData(satellite, positionData) {
  const container = document.getElementById("satelliteData");

  const div = document.createElement("div");
  div.classList.add("satellite");

  const name = document.createElement("h3");
  name.textContent = satellite.name;

  const lat = document.createElement("p");
  const lon = document.createElement("p");
  const alt = document.createElement("p");

  lat.textContent = `Latitude: ${positionData.satlatitude || "N/A"}`;
  lon.textContent = `Longitude: ${positionData.satlongitude || "N/A"}`;
  alt.textContent = `Altitude: ${positionData.sataltitude || "N/A"}`;

  div.appendChild(name);
  div.appendChild(lat);
  div.appendChild(lon);
  div.appendChild(alt);

  container.appendChild(div);
}

// Function to update data every 5 seconds
function updateDataEvery5Seconds() {
  fetchCelestrakData();
  setInterval(fetchCelestrakData, 5000);  // Update every 5 seconds
}

// Start updating data once page is loaded
window.onload = updateDataEvery5Seconds;
