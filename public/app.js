let watchId = null;
let sosActive = false;

const btnStart = document.getElementById("btnStart");
const btnStop = document.getElementById("btnStop");
const btnSOS = document.getElementById("btnSOS");
const btnCancelSOS = document.getElementById("btnCancelSOS");
const statusEl = document.getElementById("status");

btnStart.addEventListener("click", startTracking);
btnStop.addEventListener("click", stopTracking);
btnSOS.addEventListener("click", () => {
  sosActive = true;
  statusEl.textContent = "SOS actief!";
});

btnCancelSOS.addEventListener("click", () => {
  sosActive = false;
  statusEl.textContent = "SOS geannuleerd";
});

function startTracking() {
  if (!navigator.geolocation) {
    statusEl.textContent = "GPS wordt niet ondersteund.";
    return;
  }

  statusEl.textContent = "Locatie delen gestart...";

  watchId = navigator.geolocation.watchPosition(
    sendLocation,
    handleError,
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000
    }
  );
}

function stopTracking() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }

  statusEl.textContent = "Locatie delen gestopt.";
}

async function sendLocation(position) {
  const data = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: position.coords.accuracy,
    time: Date.now(),
    sos: sosActive
  };

  try {
    const res = await fetch("/api/location", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.ok) {
      statusEl.textContent = sosActive
        ? "Locatie verzonden - SOS actief!"
        : "Locatie verzonden";
    } else {
      statusEl.textContent = "Fout bij verzenden.";
    }
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Server niet bereikbaar.";
  }
}

function handleError(error) {
  console.error(error);

  if (error.code === 1) {
    statusEl.textContent = "Geen toestemming voor locatie.";
  } else if (error.code === 2) {
    statusEl.textContent = "Locatie niet beschikbaar.";
  } else if (error.code === 3) {
    statusEl.textContent = "Locatie timeout.";
  } else {
    statusEl.textContent = "Onbekende GPS-fout.";
  }
}