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
    
    satellites.push({ name, tle1, tle2 });
  }

  return satellites;
}

// Function to calculate satellite position
function getSatellitePosition(tle1, tle2) {
  const satrec = satellite.twoline2satrec(tle1, tle2);
  const now = new Date();

  const positionAndVelocity = satellite.propagate(satrec, now);
  if (!positionAndVelocity.position) {
    return { lat: "N/A", lon: "N/A", alt: "N/A" };
  }

  const positionEci = positionAndVelocity.position;
  const gmst = satellite.gstime(now);
  const positionGeodetic = satellite.eciToGeodetic(positionEci, gmst);

  const lat = positionGeodetic.latitude * (180 / Math.PI);
  const lon = positionGeodetic.longitude * (180 / Math.PI);
  const alt = positionGeodetic.height / 1000;

  return { lat: lat.toFixed(2), lon: lon.toFixed(2), alt: alt.toFixed(2) };
}

// Function to display satellite data
function displaySatelliteData(satellites) {
  const list = document.getElementById("satellite-list");

  satellites.forEach(satellite => {
    const position = getSatellitePosition(satellite.tle1, satellite.tle2);

    const li = document.createElement("li");
    li.classList.add("satellite-item");

    li.innerHTML = `
      <div class="satellite-info">
        <h3>${satellite.name}</h3>
        <p><strong>TLE 1:</strong> ${satellite.tle1}</p>
        <p><strong>TLE 2:</strong> ${satellite.tle2}</p>
      </div>
      <div class="satellite-position">
        <h4>Position:</h4>
        <p><strong>Latitude:</strong> ${position.lat}°</p>
        <p><strong>Longitude:</strong> ${position.lon}°</p>
        <p><strong>Altitude:</strong> ${position.alt} km</p>
      </div>
    `;

    list.appendChild(li);
  });
}

// Initialize fetching of satellite data
fetchSatelliteData();
