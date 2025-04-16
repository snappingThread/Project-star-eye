document.getElementById('fetch-data').addEventListener('click', async () => {
  const output = document.getElementById('output');
  output.textContent = 'Fetching data...';

  try {
    // Fetch TLE data from CelesTrak
    const response = await fetch('https://celestrak.com/NORAD/elements/stations.txt');
    const data = await response.text();
    output.textContent = data; // Display raw TLE data
  } catch (error) {
    output.textContent = `Error fetching data: ${error.message}`;
  }
});
