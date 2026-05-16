import express from "express";

const app = express();
const PORT = process.env.PORT || 10000;

let locations = {};

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
    sos: req.body.sos === true
  };

  console.log("Nieuwe locatie:", locations[device]);

  res.json({ ok: true });
});

app.get("/api/location", (req, res) => {
  res.json(Object.values(locations));
});

app.listen(PORT, () => {
  console.log(`Tracker server gestart op poort ${PORT}`);
});