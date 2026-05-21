import express from "express";

const app = express();
const PORT = process.env.PORT || 10000;

let locations = {};
const VIEWER_PIN = process.env.VIEWER_PIN || "1234";

app.use(express.json());
app.use(express.static("public"));

app.post("/api/location", (req, res) => {
  const device = req.body.device || "Onbekend";
  const group = req.body.group || "";
  const key = group + ":" + device;

  const old = locations[key] || {};

  locations[key] = {
    ...old,
    device,
    group,
    lat: req.body.lat ?? old.lat,
    lng: req.body.lng ?? old.lng,
    accuracy: req.body.accuracy ?? old.accuracy,
    time: req.body.time || Date.now(),
    sos: req.body.sos === true,
    active: req.body.active !== false
  };

  console.log("Update:", locations[key]);

  res.json({ ok: true });
});

app.get("/api/location", (req, res) => {

  const pin = req.query.pin;

  if (!pin) {
    return res.status(403).json({ error: "Geen toegang" });
  }

  const now = Date.now();

  const result = Object.values(locations)
    .filter(item => item.group === pin)
    .filter(item => item.active !== false)
    .filter(item => now - item.time < 15000);

  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Tracker server gestart op poort ${PORT}`);
});