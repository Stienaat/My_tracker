import express from "express";

const app = express();
const PORT = process.env.PORT || 10000;

let locations = {};
const VIEWER_PIN = process.env.VIEWER_PIN || "1234";

app.use(express.json());
app.use(express.static("public"));

app.post("/api/location", (req, res) => {
  const device = req.body.device || "Onbekend";

locations[device] = {
  device,
  lat: req.body.lat,
  lng: req.body.lng,
  accuracy: req.body.accuracy,
  time: req.body.time,
  sos: req.body.sos === true,
  active: req.body.active !== false
};

  console.log("Nieuwe locatie:", locations[device]);

  res.json({ ok: true });
});

app.get("/api/location", (req, res) => {
  const pin = req.query.pin;

  if (pin !== VIEWER_PIN) {
    return res.status(403).json({ error: "Geen toegang" });
  }

  res.json(Object.values(locations));
});

app.listen(PORT, () => {
  console.log(`Tracker server gestart op poort ${PORT}`);
});