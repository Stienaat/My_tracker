const alertEl = document.getElementById("alert");

const map = L.map("map").setView([51.2351, 4.9706], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap"
}).addTo(map);

const markers = {};
let firstCenter = true;

async function loadLocations() {
  try {
    const res = await fetch("/api/location");
    const data = await res.json();

    console.log("LOCATIONS", data);

    if (!Array.isArray(data) || data.length === 0) {
      alertEl.textContent = "Geen locaties ontvangen";
      return;
    }

    let activeCount = 0;

    for (const item of data) {
      if (!item.lat || !item.lng) continue;

      const pos = [item.lat, item.lng];
      const name = item.device || "Onbekend";
      const labelClass = item.sos ? "sos-label" : "normal-label";

      if (!markers[name]) {
        markers[name] = L.marker(pos)
          .addTo(map)
          .bindPopup(name);
      } else {
        markers[name].setLatLng(pos);
      }

   markers[name].bindTooltip(name, {
  permanent: true,
  direction: "top",
  className: labelClass
});

      if (firstCenter) {
        map.setView(pos, 16);
        firstCenter = false;
      }

      const age = Date.now() - item.time;
      if (age < 30000) activeCount++;
    }

    if (activeCount > 0) {
      alertEl.textContent = `${activeCount} actieve tracker(s)`;
      alertEl.style.background = "green";
      alertEl.style.color = "white";
    } else {
      alertEl.textContent = "Geen actieve trackers";
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