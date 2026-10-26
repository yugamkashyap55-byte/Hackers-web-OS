const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// -----------------------------
// SIMULATION DATA
// -----------------------------

const units = [
  "ALPHA-01",
  "BRAVO-02",
  "CHARLIE-03",
  "DELTA-04",
  "ECHO-05",
  "FOXTROT-06",
  "GOLF-07",
  "HOTEL-08"
];

const zones = [
  "North Ridge",
  "East Gate",
  "Supply Point",
  "West Track",
  "Field Station",
  "South Route",
  "River Crossing",
  "Hill Sector"
];

const names = [
  "Unit Alpha",
  "Unit Bravo",
  "Unit Charlie",
  "Unit Delta",
  "Unit Echo",
  "Unit Foxtrot",
  "Unit Golf",
  "Unit Hotel"
];

// Generate realistic-looking simulated telemetry
function createPatient(index) {
  const time = Date.now() / 10000;
  const wave = Math.sin(time + index * 1.7);
  const wave2 = Math.cos(time * 0.7 + index);

  const pulse = Math.round(
    78 + wave * 22 + wave2 * 8 + index * 2
  );

  const spo2 = Math.max(
    88,
    Math.min(
      99,
      Math.round(96 + wave2 * 3 - index * 0.2)
    )
  );

  const respiration = Math.round(
    16 + Math.abs(wave) * 9 + index * 0.5
  );

  const pain = Math.max(
    0,
    Math.min(
      10,
      Math.round(3 + Math.abs(wave2) * 5)
    )
  );

  const triage = calculateTriage(
    pulse,
    spo2,
    respiration,
    pain
  );

  return {
    id: units[index],
    name: names[index],
    zone: zones[index],
    pulse,
    spo2,
    respiration,
    pain,
    priority: triage.priority,
    score: triage.score,
    updated: new Date().toISOString()
  };
}

// --------------------------------
// SIMULATED TRIAGE LOGIC
// --------------------------------

function calculateTriage(pulse, spo2, respiration, pain) {
  let score = 0;

  if (spo2 < 92) {
    score += 3;
  } else if (spo2 < 95) {
    score += 1;
  }

  if (pulse > 110 || pulse < 55) {
    score += 2;
  } else if (pulse > 100 || pulse < 60) {
    score += 1;
  }

  if (respiration > 24) {
    score += 2;
  } else if (respiration > 20) {
    score += 1;
  }

  if (pain >= 8) {
    score += 1;
  }

  let priority = "STABLE";

  if (score >= 5) {
    priority = "IMMEDIATE";
  } else if (score >= 3) {
    priority = "URGENT";
  }

  return {
    score,
    priority
  };
}

// --------------------------------
// ROUTES & HAZARDS
// --------------------------------

function getHazards() {
  return [
    {
      id: "HZ-01",
      type: "ROAD BLOCK",
      severity: "HIGH",
      x: 70,
      y: 35
    },
    {
      id: "HZ-02",
      type: "WEATHER",
      severity: "MEDIUM",
      x: 42,
      y: 65
    },
    {
      id: "HZ-03",
      type: "DEBRIS",
      severity: "LOW",
      x: 78,
      y: 74
    }
  ];
}

function getRoutes() {
  return [
    {
      id: "R-01",
      name: "North Corridor",
      status: "OPEN",
      eta: 8,
      risk: 18
    },
    {
      id: "R-02",
      name: "East Service Road",
      status: "CAUTION",
      eta: 12,
      risk: 42
    },
    {
      id: "R-03",
      name: "South Track",
      status: "BLOCKED",
      eta: null,
      risk: 91
    },
    {
      id: "R-04",
      name: "West Access Route",
      status: "OPEN",
      eta: 10,
      risk: 26
    }
  ];
}

// --------------------------------
// DASHBOARD API
// --------------------------------

app.get("/api/dashboard", (req, res) => {
  const patients = units.map((_, index) =>
    createPatient(index)
  );

  const hazards = getHazards();
  const routes = getRoutes();

  const immediate = patients.filter(
    patient => patient.priority === "IMMEDIATE"
  ).length;

  const urgent = patients.filter(
    patient => patient.priority === "URGENT"
  ).length;

  const stable = patients.filter(
    patient => patient.priority === "STABLE"
  ).length;

  const openRoutes = routes.filter(
    route => route.status === "OPEN"
  ).length;

  res.json({
    success: true,

    system: {
      name: "TRIAGE COMMAND",
      status: "ONLINE",
      mode: "SIMULATION",
      timestamp: new Date().toISOString()
    },

    summary: {
      patientsTracked: patients.length,
      immediate,
      urgent,
      stable,
      routesAvailable: openRoutes,
      nodeCapacity: 20,
      nodeOccupied: 12
    },

    patients,
    hazards,
    routes,

    medicalNode: {
      name: "FIELD MEDICAL NODE",
      capacity: 20,
      occupied: 12,
      available: 8
    }
  });
});

// --------------------------------
// SIMULATED TRIAGE API
// --------------------------------

app.post("/api/triage", (req, res) => {
  const {
    pulse,
    spo2,
    respiration,
    pain
  } = req.body;

  const values = [
    Number(pulse),
    Number(spo2),
    Number(respiration),
    Number(pain)
  ];

  if (values.some(value => !Number.isFinite(value))) {
    return res.status(400).json({
      success: false,
      message: "Please enter valid numeric values."
    });
  }

  const result = calculateTriage(
    values[0],
    values[1],
    values[2],
    values[3]
  );

  res.json({
    success: true,
    score: result.score,
    priority: result.priority,
    disclaimer:
      "Simulation only. This prototype is not a medical diagnostic or treatment system."
  });
});

// --------------------------------
// SYSTEM STATUS
// --------------------------------

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    status: "ONLINE",
    mode: "SIMULATION",
    serverTime: new Date().toISOString(),
    version: "1.0.0"
  });
});

// --------------------------------
// REPORT DATA
// --------------------------------

app.get("/api/report", (req, res) => {
  const patients = units.map((_, index) =>
    createPatient(index)
  );

  const routes = getRoutes();

  res.json({
    generatedAt: new Date().toISOString(),

    overview: {
      patientsTracked: patients.length,
      immediate: patients.filter(
        p => p.priority === "IMMEDIATE"
      ).length,
      urgent: patients.filter(
        p => p.priority === "URGENT"
      ).length,
      stable: patients.filter(
        p => p.priority === "STABLE"
      ).length
    },

    routeSummary: routes,

    note:
      "All values shown by this application are simulated demonstration data."
  });
});

// --------------------------------
// FRONTEND FALLBACK
// --------------------------------

app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

// --------------------------------
// START SERVER
// --------------------------------

app.listen(PORT, () => {
  console.log("----------------------------------------");
  console.log(" TRIAGE COMMAND");
  console.log(" Emergency Response Simulation");
  console.log("----------------------------------------");
  console.log(` Server running on port ${PORT}`);
  console.log(` http://localhost:${PORT}`);
  console.log("----------------------------------------");
});