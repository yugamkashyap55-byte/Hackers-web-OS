/* =========================================================
   TRIAGE COMMAND
   FRONTEND-ONLY SIMULATION
   ========================================================= */

const patients = [
  {
    id: "PT-001",
    unit: "ALPHA-01",
    zone: "North Ridge",
    pulse: 118,
    spo2: 89,
    respiration: 27,
    pain: 8,
    priority: "IMMEDIATE"
  },
  {
    id: "PT-002",
    unit: "BRAVO-02",
    zone: "East Gate",
    pulse: 104,
    spo2: 94,
    respiration: 22,
    pain: 6,
    priority: "URGENT"
  },
  {
    id: "PT-003",
    unit: "CHARLIE-03",
    zone: "Supply Point",
    pulse: 82,
    spo2: 98,
    respiration: 17,
    pain: 3,
    priority: "STABLE"
  },
  {
    id: "PT-004",
    unit: "DELTA-04",
    zone: "West Track",
    pulse: 126,
    spo2: 91,
    respiration: 29,
    pain: 9,
    priority: "IMMEDIATE"
  },
  {
    id: "PT-005",
    unit: "ECHO-05",
    zone: "Field Station",
    pulse: 96,
    spo2: 96,
    respiration: 20,
    pain: 5,
    priority: "URGENT"
  },
  {
    id: "PT-006",
    unit: "FOXTROT-06",
    zone: "South Route",
    pulse: 76,
    spo2: 99,
    respiration: 16,
    pain: 2,
    priority: "STABLE"
  }
];


const routes = [
  {
    id: "R-01",
    name: "North Corridor",
    status: "OPEN",
    eta: "8 min",
    risk: 18
  },
  {
    id: "R-02",
    name: "East Service Road",
    status: "CAUTION",
    eta: "12 min",
    risk: 42
  },
  {
    id: "R-03",
    name: "South Track",
    status: "BLOCKED",
    eta: "—",
    risk: 91
  },
  {
    id: "R-04",
    name: "West Access Route",
    status: "OPEN",
    eta: "10 min",
    risk: 26
  }
];


const $ = selector =>
  document.querySelector(selector);


const $$ = selector =>
  document.querySelectorAll(selector);


/* =========================================================
   CLOCK
   ========================================================= */

function updateClock() {

  const element = $("#clock");

  if (!element) return;

  element.textContent =
    new Date().toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }
    );
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

  const navItems =
    $$(".nav-item");

  const pages =
    $$(".page");

  const titleMap = {

    operations:
      "Operations Overview",

    patients:
      "Patient Triage",

    evacuation:
      "Evacuation Planning",

    report:
      "Mission Report"

  };


  navItems.forEach(item => {

    item.addEventListener(
      "click",
      () => {

        const target =
          item.dataset.page;

        navItems.forEach(button =>
          button.classList.remove("active")
        );

        pages.forEach(page =>
          page.classList.remove("active")
        );

        item.classList.add("active");

        const targetPage =
          document.getElementById(target);

        if (targetPage) {
          targetPage.classList.add("active");
        }

        $("#pageTitle").textContent =
          titleMap[target];

        if (target === "report") {
          updateReport();
        }

      }
    );

  });
}


/* =========================================================
   METRICS
   ========================================================= */

function updateMetrics() {

  const immediate =
    patients.filter(
      p => p.priority === "IMMEDIATE"
    ).length;

  const availableRoutes =
    routes.filter(
      r => r.status !== "BLOCKED"
    ).length;


  $("#patientsMetric").textContent =
    patients.length;

  $("#immediateMetric").textContent =
    immediate;

  $("#routesMetric").textContent =
    availableRoutes;

  $("#capacityMetric").textContent =
    "8";
}


/* =========================================================
   PATIENT TABLE
   ========================================================= */

function renderPatientTable() {

  const table =
    $("#patientTable");

  if (!table) return;


  table.innerHTML =
    patients.map(patient => {

      return `
        <tr>

          <td><strong>${patient.id}</strong></td>

          <td>${patient.unit}</td>

          <td>${patient.zone}</td>

          <td>${patient.pulse} bpm</td>

          <td>${patient.spo2}%</td>

          <td>${patient.respiration}/min</td>

          <td>${patient.pain}/10</td>

          <td>
            <span class="status-badge ${patient.priority.toLowerCase()}">
              ${patient.priority}
            </span>
          </td>

        </tr>
      `;

    }).join("");
}


/* =========================================================
   PRIORITY QUEUE
   ========================================================= */

function renderPriorityQueue() {

  const list =
    $("#priorityList");

  if (!list) return;


  const order = {
    IMMEDIATE: 1,
    URGENT: 2,
    STABLE: 3
  };


  const sorted =
    [...patients].sort(
      (a, b) =>
        order[a.priority] -
        order[b.priority]
    );


  list.innerHTML =
    sorted.map(
      (patient, index) => {

        return `
          <div class="queue-item">

            <div>
              <strong>
                ${String(index + 1).padStart(2, "0")}
                · ${patient.id}
              </strong>

              <small>
                ${patient.zone}
              </small>
            </div>

            <span class="status-badge ${patient.priority.toLowerCase()}">
              ${patient.priority}
            </span>

          </div>
        `;

      }
    ).join("");
}


/* =========================================================
   ROUTES
   ========================================================= */

function renderRoutes() {

  const list =
    $("#routeList");

  const evacuation =
    $("#evacuationRoutes");

  const html =
    routes.map(route => {

      return `
        <div class="route-card">

          <div class="route-main">

            <strong>
              ${route.id}
            </strong>

            <span>
              ${route.name}
            </span>

          </div>

          <div class="route-info">

            <span>
              ${route.status}
            </span>

            <span>
              ETA ${route.eta}
            </span>

            <span>
              RISK ${route.risk}%
            </span>

          </div>

        </div>
      `;

    }).join("");


  if (list) {
    list.innerHTML = html;
  }


  if (evacuation) {
    evacuation.innerHTML = html;
  }
}


/* =========================================================
   MAP
   ========================================================= */

function drawMap() {

  const canvas =
    $("#mapCanvas");

  if (!canvas) return;


  const box =
    canvas.parentElement;

  const width =
    box.clientWidth;

  const height =
    box.clientHeight;


  canvas.width = width * devicePixelRatio;
  canvas.height = height * devicePixelRatio;

  canvas.style.width =
    width + "px";

  canvas.style.height =
    height + "px";


  const ctx =
    canvas.getContext("2d");

  ctx.scale(
    devicePixelRatio,
    devicePixelRatio
  );


  /* background */

  ctx.fillStyle =
    "#e8ebe4";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  /* grid */

  ctx.strokeStyle =
    "#cbd1c8";

  ctx.lineWidth = 1;


  for (
    let x = 0;
    x < width;
    x += 38
  ) {

    ctx.beginPath();

    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);

    ctx.stroke();
  }


  for (
    let y = 0;
    y < height;
    y += 38
  ) {

    ctx.beginPath();

    ctx.moveTo(0, y);
    ctx.lineTo(width, y);

    ctx.stroke();
  }


  /* routes */

  const routePaths = [

    [
      45,
      height - 45,
      width * .48,
      height * .5,
      width - 55,
      50
    ],

    [
      55,
      55,
      width * .52,
      height * .52,
      width - 60,
      height - 55
    ],

    [
      35,
      height * .55,
      width - 40,
      height * .55
    ]

  ];


  routePaths.forEach(path => {

    ctx.strokeStyle =
      "#536654";

    ctx.lineWidth = 4;

    ctx.beginPath();

    ctx.moveTo(
      path[0],
      path[1]
    );


    for (
      let i = 2;
      i < path.length;
      i += 2
    ) {

      ctx.lineTo(
        path[i],
        path[i + 1]
      );

    }

    ctx.stroke();

  });


  /* medical node */

  const centerX =
    width / 2;

  const centerY =
    height / 2;


  ctx.fillStyle =
    "#344536";

  ctx.beginPath();

  ctx.arc(
    centerX,
    centerY,
    17,
    0,
    Math.PI * 2
  );

  ctx.fill();


  ctx.fillStyle =
    "white";

  ctx.font =
    "bold 11px Arial";

  ctx.textAlign =
    "center";

  ctx.fillText(
    "+",
    centerX,
    centerY + 4
  );


  ctx.fillStyle =
    "#344536";

  ctx.font =
    "bold 9px Arial";

  ctx.fillText(
    "MEDICAL NODE",
    centerX,
    centerY + 32
  );


  /* patients */

  const points = [

    [width * .16, height * .23],

    [width * .78, height * .23],

    [width * .25, height * .76],

    [width * .76, height * .72],

    [width * .39, height * .25],

    [width * .60, height * .75]

  ];


  patients.forEach(
    (patient, index) => {

      const [x, y] =
        points[index];


      let color =
        "#477053";


      if (
        patient.priority ===
        "IMMEDIATE"
      ) {
        color = "#a5483e";
      }

      if (
        patient.priority ===
        "URGENT"
      ) {
        color = "#a8792f";
      }


      ctx.fillStyle =
        color;

      ctx.beginPath();

      ctx.arc(
        x,
        y,
        8,
        0,
        Math.PI * 2
      );

      ctx.fill();


      ctx.strokeStyle =
        "rgba(255,255,255,.8)";

      ctx.lineWidth = 2;

      ctx.stroke();

    }
  );
}


/* =========================================================
   CHART
   ========================================================= */

function drawChart() {

  const canvas =
    $("#telemetryChart");

  if (!canvas) return;


  const box =
    canvas.parentElement;

  const width =
    box.clientWidth;

  const height =
    box.clientHeight;


  canvas.width =
    width * devicePixelRatio;

  canvas.height =
    height * devicePixelRatio;

  canvas.style.width =
    width + "px";

  canvas.style.height =
    height + "px";


  const ctx =
    canvas.getContext("2d");

  ctx.scale(
    devicePixelRatio,
    devicePixelRatio
  );


  ctx.fillStyle =
    "#fffefa";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  /* grid */

  ctx.strokeStyle =
    "#e0e3dd";

  ctx.lineWidth = 1;


  for (
    let y = 25;
    y < height - 20;
    y += 40
  ) {

    ctx.beginPath();

    ctx.moveTo(35, y);

    ctx.lineTo(
      width - 20,
      y
    );

    ctx.stroke();
  }


  const values = [
    76,
    84,
    81,
    94,
    88,
    105,
    98,
    112,
    101,
    116,
    108,
    118
  ];


  ctx.strokeStyle =
    "#536654";

  ctx.lineWidth = 3;

  ctx.beginPath();


  values.forEach(
    (value, index) => {

      const x =
        40 +
        index *
        ((width - 65) /
        (values.length - 1));


      const y =
        height -
        25 -
        ((value - 60) / 70) *
        (height - 55);


      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

    }
  );


  ctx.stroke();


  values.forEach(
    (value, index) => {

      const x =
        40 +
        index *
        ((width - 65) /
        (values.length - 1));


      const y =
        height -
        25 -
        ((value - 60) / 70) *
        (height - 55);


      ctx.fillStyle =
        "#344536";

      ctx.beginPath();

      ctx.arc(
        x,
        y,
        3,
        0,
        Math.PI * 2
      );

      ctx.fill();

    }
  );
}


/* =========================================================
   TRIAGE MODEL
   ========================================================= */

function calculatePriority(
  pulse,
  spo2,
  respiration,
  pain
) {

  let score = 0;


  if (spo2 < 92) {
    score += 3;
  }
  else if (spo2 < 95) {
    score += 1;
  }


  if (
    pulse > 110 ||
    pulse < 55
  ) {
    score += 2;
  }
  else if (
    pulse > 100 ||
    pulse < 60
  ) {
    score += 1;
  }


  if (respiration > 24) {
    score += 2;
  }
  else if (respiration > 20) {
    score += 1;
  }


  if (pain >= 8) {
    score += 1;
  }


  if (score >= 5) {
    return "IMMEDIATE";
  }


  if (score >= 3) {
    return "URGENT";
  }


  return "STABLE";
}


/* =========================================================
   TRIAGE FORM
   ========================================================= */

function setupTriage() {

  const form =
    $("#triageForm");

  if (!form) return;


  form.addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const pulse =
        Number(
          $("#pulse").value
        );


      const spo2 =
        Number(
          $("#spo2").value
        );


      const respiration =
        Number(
          $("#respiration").value
        );


      const pain =
        Number(
          $("#pain").value
        );


      const priority =
        calculatePriority(
          pulse,
          spo2,
          respiration,
          pain
        );


      const result =
        $("#triageResult");


      result.className =
        `triage-result ${priority.toLowerCase()}`;


      result.innerHTML = `

        <strong>
          SIMULATED PRIORITY:
          ${priority}
        </strong>

        <p>
          The demonstration model generated
          this classification from the supplied
          simulated observations.
          This is not a medical diagnosis.
        </p>

      `;

    }
  );
}


/* =========================================================
   REFRESH
   ========================================================= */

function setupRefresh() {

  const button =
    $("#refreshBtn");

  if (!button) return;


  button.addEventListener(
    "click",
    () => {

      patients.forEach(
        patient => {

          patient.pulse +=
            Math.floor(
              Math.random() * 7
            ) - 3;


          patient.pulse =
            Math.max(
              55,
              Math.min(
                135,
                patient.pulse
              )
            );


          patient.spo2 +=
            Math.floor(
              Math.random() * 3
            ) - 1;


          patient.spo2 =
            Math.max(
              88,
              Math.min(
                100,
                patient.spo2
              )
            );

        }
      );


      renderAll();


      button.textContent =
        "Updated ✓";


      setTimeout(
        () => {

          button.textContent =
            "↻ Refresh";

        },
        900
      );

    }
  );
}


/* =========================================================
   REPORT
   ========================================================= */

function updateReport() {

  const immediate =
    patients.filter(
      p => p.priority === "IMMEDIATE"
    ).length;


  const available =
    routes.filter(
      r => r.status !== "BLOCKED"
    ).length;


  $("#reportPatients").textContent =
    patients.length;

  $("#reportImmediate").textContent =
    immediate;

  $("#reportRoutes").textContent =
    available;


  $("#reportDate").textContent =
    new Date().toLocaleString(
      "en-IN"
    );


  const list =
    $("#reportRoutesList");


  list.innerHTML =
    routes.map(
      route => {

        return `
          <div class="report-route">

            <strong>
              ${route.id} · ${route.name}
            </strong>

            <span>
              ${route.status}
              · ETA ${route.eta}
              · Risk ${route.risk}%
            </span>

          </div>
        `;

      }
    ).join("");
}


/* =========================================================
   PRINT
   ========================================================= */

function setupPrint() {

  const button =
    $("#printBtn");

  if (!button) return;


  button.addEventListener(
    "click",
    () => {

      updateReport();

      window.print();

    }
  );
}


/* =========================================================
   RENDER EVERYTHING
   ========================================================= */

function renderAll() {

  updateMetrics();

  renderPatientTable();

  renderPriorityQueue();

  renderRoutes();

  updateReport();

  drawMap();

  drawChart();
}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupNavigation();

    setupTriage();

    setupRefresh();

    setupPrint();

    updateClock();

    renderAll();
    drawMap();
    drawChart();

    setInterval(
      updateClock,
      1000
    );


    window.addEventListener(
      "resize",
      () => {

        drawMap();
        drawChart();

      }
    );

  }
);