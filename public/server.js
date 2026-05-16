const alertEl = document.getElementById("alert");

const map = L.map("map").setView([51.05, 4.45], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap"
}).addTo(map);

const markers = {};

async function loadLocations() {

  try {

    const res = await fetch("/api/location");
    const data = await res.json();

    if (!Array.isArray(data)) {
      return;
    }

    let activeCount = 0;

    for (const item of data) {

      const pos = [item.lat, item.lng];

      if (!markers[item.device]) {

        markers[item.device] = L.marker(pos)
          .addTo(map)
          .bindPopup(item.device);

      } else {

        markers[item.device].setLatLng(pos);
      }

      const age = Date.now() - item.time;

      if (age < 30000) {
        activeCount++;
      }
    }

    if (activeCount > 0) {

      alertEl.textContent =
        `${activeCount} actieve tracker(s)`;

      alertEl.style.background = "green";
      alertEl.style.color = "white";

    } else {

      alertEl.textContent =
        "Geen actieve trackers";

      alertEl.style.background = "red";
      alertEl.style.color = "white";
    }

  } catch (err) {

    console.error(err);

    alertEl.textContent = "Server niet bereikbaar";

    alertEl.style.background = "red";
    alertEl.style.color = "white";
  }
}

loadLocations();

setInterval(loadLocations, 5000);