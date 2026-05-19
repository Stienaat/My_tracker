let viewerPin = prompt("Gezinscode?");

if (!viewerPin) {
  viewerPin = prompt("PIN-code?");
  localStorage.setItem("viewer_pin", viewerPin);
}

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

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
   const res = await fetch(
  "/api/location?pin=" + encodeURIComponent(viewerPin)
);

if (res.status === 403) {
  localStorage.removeItem("viewer_pin");
  alertEl.textContent = "Verkeerde PIN";
  alertEl.style.background = "red";
  alertEl.style.color = "white";
  return;
}
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      alertEl.textContent = "Geen locaties ontvangen";
      return;
    }

    let activeCount = 0;

    for (const item of data) {
      const name = item.device || "Onbekend";
      
        if (item.active === false) {
        if (markers[name]) {
          map.removeLayer(markers[name]);
          delete markers[name];
        }
        continue;
    }


      if (!item.lat || !item.lng) continue;
      const pos = [item.lat, item.lng];
 const age = Date.now() - item.time;
const isLive = item.active === true && age < 60000;

let labelText = name;
let labelClass = "offline-label";

if (item.sos) {
  labelText = name;
  labelClass = "sos-label";
} else if (isLive) {
  labelText = name;
  labelClass = "live-label";
} else {
  labelText = name;
  labelClass = "offline-label";
}

if (!markers[name]) {
  markers[name] = L.marker(pos)
    .addTo(map)
    .bindPopup(name);
} else {
  markers[name].setLatLng(pos);
}

markers[name].unbindTooltip();

let accuracyClass = "acc-good";

if (item.accuracy > 50) {
  accuracyClass = "acc-bad";
} else if (item.accuracy > 20) {
  accuracyClass = "acc-medium";
}

markers[name].bindTooltip(labelText, {
  permanent: true,
  direction: "top",
  className: `${labelClass} ${accuracyClass}`
});

      if (firstCenter) {
        map.setView(pos, 16);
        firstCenter = false;
      }

      activeCount++;
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