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

// Function to display the satellite data on the page
function displaySatelliteData(satellites) {
  const list = document.getElementById("satellite-list");

  satellites.forEach(satellite => {
    const li = document.createElement("li");
    li.classList.add("satellite-item");

    li.innerHTML = `
      <h3>${satellite.name}</h3>
      <p><strong>TLE 1:</strong> ${satellite.tle1}</p>
      <p><strong>TLE 2:</strong> ${satellite.tle2}</p>
    `;

    list.appendChild(li);
  });
}

// Initialize the fetching of satellite data
fetchSatelliteData();
