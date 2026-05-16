const alertEl = document.getElementById("alert");

const map = L.map("map").setView([51.05, 4.45], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap"
}).addTo(map);

let marker = null;
let circle = null;

async function loadLocation() {
  try {
    const res = await fetch("/api/location");
    const data = await res.json();

    if (!data || !data.lat || !data.lng) {
      alertEl.textContent = "Nog geen locatie ontvangen";
      return;
    }

    const pos = [data.lat, data.lng];

    if (!marker) {
      marker = L.marker(pos).addTo(map);
      map.setView(pos, 16);
    } else {
      marker.setLatLng(pos);
    }

    if (!circle) {
      circle = L.circle(pos, {
        radius: data.accuracy || 20
      }).addTo(map);
    } else {
      circle.setLatLng(pos);
      circle.setRadius(data.accuracy || 20);
    }

const age = Date.now() - data.time;

if (data.sos) {

  alertEl.textContent = "SOS ACTIEF!";
  alertEl.classList.add("sos");

} else if (age < 30000) {

  alertEl.textContent = "Locatie actief";
  alertEl.style.background = "green";
  alertEl.style.color = "white";

} else {

  alertEl.textContent = "Locatie niet actief";
  alertEl.style.background = "red";
  alertEl.style.color = "white";
}

  } catch (err) {
    console.error(err);
    alertEl.textContent = "Server niet bereikbaar";
  }
}

loadLocation();
setInterval(loadLocation, 5000);