/**
 * God's Eye 3D Suite Navigator - Core Application Engine
 * CesiumJS 3D WebGL Engine with Google Photorealistic 3D Tiles & High-Res Satellite
 */

// Coordinates for 7045 N Maple Ave, Fresno CA (Meridian Professional Center)
const GEO = {
  center: { lon: -119.756200, lat: 36.839634, height: 105 },
  drivewayNorth: { lon: -119.756900, lat: 36.839880, height: 105 },
  drivewaySouth: { lon: -119.756900, lat: 36.839250, height: 105 },
  parking101: { lon: -119.756380, lat: 36.839820, height: 105 },
  door101: { lon: -119.756350, lat: 36.839680, height: 105 },
  parking108: { lon: -119.755850, lat: 36.839350, height: 105 },
  door108: { lon: -119.755950, lat: 36.839420, height: 105 }
};

let viewer = null;
let activeDestination = 'clinic'; // 'clinic' (101) or 'billing' (108)
let currentMissionStep = 0;
let isOrbiting = false;
let orbitRemoveListener = null;

// Mission Camera Presets
const missions = {
  clinic: [
    {
      pill: "PHASE 1: DRIVEWAY APPROACH",
      eta: "⚡ Turn East off N. Maple Ave",
      icon: "🚗",
      heading: "Turn in at North Driveway",
      detail: "Approach Meridian Professional Center from North Maple Ave. Take the North entrance driveway into the patient parking lot.",
      camera: {
        destination: Cesium.Cartesian3.fromDegrees(-119.757800, 36.839880, 220),
        orientation: {
          heading: Cesium.Math.toRadians(85),
          pitch: Cesium.Math.toRadians(-28),
          roll: 0.0
        },
        duration: 2.2
      }
    },
    {
      pill: "PHASE 2: DRONE PARKING ANGLE",
      eta: "🅿️ Stalls 1–15 (Facing Suite 101)",
      icon: "🅿️",
      heading: "Park in North Patient Stalls",
      detail: "Park in the illuminated green parking zone directly facing the ground-floor glass entrance of Suite 101.",
      camera: {
        destination: Cesium.Cartesian3.fromDegrees(-119.756700, 36.840200, 160),
        orientation: {
          heading: Cesium.Math.toRadians(145),
          pitch: Cesium.Math.toRadians(-38),
          roll: 0.0
        },
        duration: 2.0
      }
    },
    {
      pill: "PHASE 3: DOORWAY ARRIVAL",
      eta: "🚪 Ground Floor • Flat ADA Access",
      icon: "🩺",
      heading: "Enter Glass Door: Suite 101",
      detail: "Walk 15 feet across the flat sidewalk to the glass entrance marked 'Suite 101 - Reddy Medical Group'. Zero steps, automatic ADA door.",
      camera: {
        destination: Cesium.Cartesian3.fromDegrees(-119.756420, 36.839800, 120),
        orientation: {
          heading: Cesium.Math.toRadians(165),
          pitch: Cesium.Math.toRadians(-18),
          roll: 0.0
        },
        duration: 1.8
      }
    }
  ],
  billing: [
    {
      pill: "PHASE 1: SOUTH DRIVEWAY ENTRY",
      eta: "⚡ Turn in at South Entrance",
      icon: "🚗",
      heading: "Enter via South Maple Driveway",
      detail: "Take the South entrance off Maple Ave toward the rear executive wing of the complex.",
      camera: {
        destination: Cesium.Cartesian3.fromDegrees(-119.757800, 36.839250, 220),
        orientation: {
          heading: Cesium.Math.toRadians(85),
          pitch: Cesium.Math.toRadians(-28),
          roll: 0.0
        },
        duration: 2.2
      }
    },
    {
      pill: "PHASE 2: SOUTHEAST PARKING LOT",
      eta: "🅿️ Executive Wing Stalls",
      icon: "🅿️",
      heading: "Park in Southeast Stalls",
      detail: "Park in the stalls closest to the southeast administrative wing.",
      camera: {
        destination: Cesium.Cartesian3.fromDegrees(-119.755400, 36.839000, 160),
        orientation: {
          heading: Cesium.Math.toRadians(315),
          pitch: Cesium.Math.toRadians(-35),
          roll: 0.0
        },
        duration: 2.0
      }
    },
    {
      pill: "PHASE 3: SUITE 108 ARRIVAL",
      eta: "💼 Corporate & Billing Office",
      icon: "🏢",
      heading: "Enter Suite 108 Entrance",
      detail: "Door marked 'Reddy Medical Group Corporate & Billing'. Ring reception bell for administrative staff.",
      camera: {
        destination: Cesium.Cartesian3.fromDegrees(-119.755750, 36.839350, 120),
        orientation: {
          heading: Cesium.Math.toRadians(295),
          pitch: Cesium.Math.toRadians(-20),
          roll: 0.0
        },
        duration: 1.8
      }
    }
  ]
};

// ==========================================================================
// 1. Initialization
// ==========================================================================
async function initCesium() {
  const googleApiKey = localStorage.getItem('GODEYE_GOOGLE_KEY') || '';
  const cesiumToken = localStorage.getItem('GODEYE_CESIUM_TOKEN') || '';

  if (cesiumToken) {
    Cesium.Ion.defaultAccessToken = cesiumToken;
  }

  // Create Cesium Viewer with clean UI HUD
  viewer = new Cesium.Viewer('cesiumContainer', {
    baseLayer: false, // Prevents default Ion token warnings
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    navigationHelpButton: false,
    animation: false,
    shouldAnimate: true,
    shadows: true,
    terrainProvider: await Cesium.createWorldTerrainAsync({
      requestVertexNormals: true,
      requestWaterMask: true
    }).catch(() => undefined)
  });

  // Optimize Scene & Visuals
  viewer.scene.globe.depthTestAgainstTerrain = false;
  viewer.scene.globe.enableLighting = true;
  viewer.scene.highDynamicRange = true;

  // Add ESRI High-Resolution Satellite Imagery as Default Base (100% Free, Zero Token Warnings)
  try {
    const esriImagery = await Cesium.ArcGisMapServerImageryProvider.fromUrl(
      'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
      { enablePickFeatures: false }
    );
    viewer.imageryLayers.addImageryProvider(esriImagery);
  } catch (err) {
    console.warn('ArcGIS MapServer fromUrl failed, using direct UrlTemplateImageryProvider:', err);
    const fallbackTiles = new Cesium.UrlTemplateImageryProvider({
      url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      maximumLevel: 19
    });
    viewer.imageryLayers.addImageryProvider(fallbackTiles);
  }

  // Attempt Google Photorealistic 3D Tiles if Key Provided
  let activeProvider = 'Photorealistic Satellite';
  if (googleApiKey) {
    try {
      const googleTileset = await Cesium.createGooglePhotorealistic3DTileset({
        key: googleApiKey,
        onlyUsingWithGoogleGeocoder: true
      });
      viewer.scene.primitives.add(googleTileset);
      activeProvider = 'Google Photorealistic 3D Tiles';
      console.log('Google Photorealistic 3D Tiles loaded successfully!');
    } catch (err) {
      console.warn('Google 3D Tiles failed, falling back to satellite:', err);
    }
  }

  document.getElementById('providerLabel').textContent = `3D Mesh: ${activeProvider}`;

  // Add 3D Volumetric Waypoint Entities
  create3DWaypoints();

  // Telemetry Listener
  setupTelemetry();

  // Hide loading radar
  setTimeout(() => {
    document.getElementById('loadingOverlay').classList.add('hidden');
    flyToMission('approach');
  }, 1200);
}

// ==========================================================================
// 2. 3D Volumetric Waypoint Geometry
// ==========================================================================
function create3DWaypoints() {
  viewer.entities.removeAll();

  // 1. Meridian Center 3D Building Extrusion (Semi-Transparent Glass Aesthetic)
  viewer.entities.add({
    name: "Meridian Professional Center Building Shell",
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray([
        -119.756500, 36.839800,
        -119.755700, 36.839800,
        -119.755700, 36.839350,
        -119.756500, 36.839350
      ]),
      extrudedHeight: 114,
      height: 105,
      material: Cesium.Color.fromCssColorString("#1e293b").withAlpha(0.4),
      outline: true,
      outlineColor: Cesium.Color.fromCssColorString("#38bdf8").withAlpha(0.6),
      outlineWidth: 2
    }
  });

  if (activeDestination === 'clinic') {
    // 2. SUITE 101 (Clinical - Glowing Emerald 3D Volume)
    viewer.entities.add({
      name: "Suite 101 Clinical Check-in",
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray([
          -119.756480, 36.839780,
          -119.756250, 36.839780,
          -119.756250, 36.839620,
          -119.756480, 36.839620
        ]),
        extrudedHeight: 112,
        height: 105,
        material: Cesium.Color.fromCssColorString("#10b981").withAlpha(0.6),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString("#34d399"),
        outlineWidth: 3
      }
    });

    // 3. Recommended North Parking Zone (Pulsing 3D Highlight)
    viewer.entities.add({
      name: "Recommended Patient Parking Zone",
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray([
          -119.756480, 36.839900,
          -119.756250, 36.839900,
          -119.756250, 36.839820,
          -119.756480, 36.839820
        ]),
        height: 105.5,
        material: Cesium.Color.fromCssColorString("#10b981").withAlpha(0.4),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString("#34d399")
      }
    });

    // 4. Glowing 3D Polyline Pathway (Driveway -> Parking -> Door)
    viewer.entities.add({
      name: "3D Driving & Walking Trail",
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          GEO.drivewayNorth.lon, GEO.drivewayNorth.lat, 106,
          -119.756380, 36.839880, 106,
          GEO.parking101.lon, GEO.parking101.lat, 106,
          -119.756350, 36.839750, 106,
          GEO.door101.lon, GEO.door101.lat, 106
        ]),
        width: 6,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.35,
          color: Cesium.Color.fromCssColorString("#38bdf8")
        }),
        clampToGround: false
      }
    });

    // 5. 3D Pulsing Beacon Pin at Suite 101 Entrance Door
    viewer.entities.add({
      name: "Suite 101 Entrance Door",
      position: Cesium.Cartesian3.fromDegrees(GEO.door101.lon, GEO.door101.lat, 108),
      point: {
        pixelSize: 18,
        color: Cesium.Color.fromCssColorString("#10b981"),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 3
      },
      label: {
        text: "🎯 SUITE 101 DOOR (Dr. Kiran Reddy)",
        font: "bold 13px 'Plus Jakarta Sans', sans-serif",
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.fromCssColorString("#090d16"),
        outlineWidth: 4,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -16)
      }
    });

  } else {
    // 2. SUITE 108 (Billing/Admin - Glowing Cyan 3D Volume)
    viewer.entities.add({
      name: "Suite 108 Billing & Admin",
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray([
          -119.756050, 36.839520,
          -119.755750, 36.839520,
          -119.755750, 36.839380,
          -119.756050, 36.839380
        ]),
        extrudedHeight: 112,
        height: 105,
        material: Cesium.Color.fromCssColorString("#0284c7").withAlpha(0.6),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString("#38bdf8"),
        outlineWidth: 3
      }
    });

    // 3. Recommended South Parking Zone
    viewer.entities.add({
      name: "South Parking Zone",
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray([
          -119.756050, 36.839380,
          -119.755750, 36.839380,
          -119.755750, 36.839300,
          -119.756050, 36.839300
        ]),
        height: 105.5,
        material: Cesium.Color.fromCssColorString("#0284c7").withAlpha(0.4),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString("#38bdf8")
      }
    });

    // 4. Glowing 3D Trail to Suite 108
    viewer.entities.add({
      name: "3D Trail to Suite 108",
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          GEO.drivewaySouth.lon, GEO.drivewaySouth.lat, 106,
          -119.755850, 36.839250, 106,
          GEO.parking108.lon, GEO.parking108.lat, 106,
          GEO.door108.lon, GEO.door108.lat, 106
        ]),
        width: 6,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.35,
          color: Cesium.Color.fromCssColorString("#38bdf8")
        }),
        clampToGround: false
      }
    });

    // 5. Suite 108 Beacon
    viewer.entities.add({
      name: "Suite 108 Entrance Door",
      position: Cesium.Cartesian3.fromDegrees(GEO.door108.lon, GEO.door108.lat, 108),
      point: {
        pixelSize: 18,
        color: Cesium.Color.fromCssColorString("#0284c7"),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 3
      },
      label: {
        text: "💼 SUITE 108 (Billing & Corporate)",
        font: "bold 13px 'Plus Jakarta Sans', sans-serif",
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.fromCssColorString("#090d16"),
        outlineWidth: 4,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -16)
      }
    });
  }
}

// ==========================================================================
// 3. Cinematic Camera & Missions
// ==========================================================================
function flyToMission(phaseName) {
  stopOrbit();
  const list = missions[activeDestination];
  let targetStep = 0;

  if (phaseName === 'approach') targetStep = 0;
  else if (phaseName === 'parking') targetStep = 1;
  else if (phaseName === 'doorway') targetStep = 2;

  currentMissionStep = targetStep;
  updateMissionUI();

  const target = list[targetStep].camera;
  viewer.camera.flyTo({
    destination: target.destination,
    orientation: target.orientation,
    duration: target.duration,
    easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT
  });
}

function setDestination(mode) {
  stopOrbit();
  activeDestination = mode;
  currentMissionStep = 0;

  const btnClinic = document.getElementById('btnClinic');
  const btnBilling = document.getElementById('btnBilling');

  if (mode === 'clinic') {
    btnClinic.classList.add('active');
    btnBilling.classList.remove('active');
  } else {
    btnBilling.classList.add('active');
    btnClinic.classList.remove('active');
  }

  create3DWaypoints();
  flyToMission('approach');
}

function nextStep() {
  const list = missions[activeDestination];
  if (currentMissionStep < list.length - 1) {
    currentMissionStep++;
    const target = list[currentMissionStep].camera;
    viewer.camera.flyTo({
      destination: target.destination,
      orientation: target.orientation,
      duration: target.duration,
      easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT
    });
    updateMissionUI();
  }
}

function prevStep() {
  if (currentMissionStep > 0) {
    currentMissionStep--;
    const target = missions[activeDestination][currentMissionStep].camera;
    viewer.camera.flyTo({
      destination: target.destination,
      orientation: target.orientation,
      duration: target.duration,
      easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT
    });
    updateMissionUI();
  }
}

function updateMissionUI() {
  const list = missions[activeDestination];
  const step = list[currentMissionStep];

  document.getElementById('stepPill').textContent = step.pill;
  document.getElementById('etaLabel').textContent = step.eta;
  document.getElementById('missionIcon').textContent = step.icon;
  document.getElementById('missionHeading').textContent = step.heading;
  document.getElementById('missionDetail').textContent = step.detail;

  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');

  btnPrev.disabled = (currentMissionStep === 0);

  if (currentMissionStep === list.length - 1) {
    btnNext.textContent = "You're at the Door! 🎉";
    btnNext.style.background = (activeDestination === 'clinic') ? '#10b981' : '#0284c7';
  } else {
    btnNext.textContent = "Next Phase →";
    btnNext.style.background = '#10b981';
  }
}

// 360° Cinematic Orbit Around Complex
function toggleOrbit() {
  if (isOrbiting) {
    stopOrbit();
  } else {
    startOrbit();
  }
}

function startOrbit() {
  isOrbiting = true;
  document.getElementById('btnOrbit').classList.add('orbiting');
  document.getElementById('orbitText').textContent = 'Stop Orbit';

  const centerCartesian = Cesium.Cartesian3.fromDegrees(GEO.center.lon, GEO.center.lat, 105);
  const distance = 180;
  const pitch = Cesium.Math.toRadians(-35);

  orbitRemoveListener = viewer.clock.onTick.addEventListener(() => {
    const heading = viewer.camera.heading + Cesium.Math.toRadians(0.12);
    viewer.camera.lookAt(
      centerCartesian,
      new Cesium.HeadingPitchRange(heading, pitch, distance)
    );
  });
}

function stopOrbit() {
  if (isOrbiting && orbitRemoveListener) {
    orbitRemoveListener();
    orbitRemoveListener = null;
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
  }
  isOrbiting = false;
  document.getElementById('btnOrbit').classList.remove('orbiting');
  document.getElementById('orbitText').textContent = 'Orbit 360°';
}

// ==========================================================================
// 4. Live Telemetry Readout Hook
// ==========================================================================
function setupTelemetry() {
  viewer.camera.changed.addEventListener(() => {
    const height = Math.round(viewer.camera.positionCartographic.height);
    const pitch = Math.round(Cesium.Math.toDegrees(viewer.camera.pitch));
    const heading = Math.round(Cesium.Math.toDegrees(viewer.camera.heading));

    document.getElementById('altVal').textContent = `${height}m`;
    document.getElementById('pitchVal').textContent = `${pitch}°`;
    document.getElementById('headingVal').textContent = `${String(heading).padStart(3, '0')}°`;
  });
}

// ==========================================================================
// 5. Configuration Modal (Google Maps 3D Tiles)
// ==========================================================================
function toggleConfigModal() {
  const modal = document.getElementById('configModal');
  modal.classList.toggle('open');
  if (modal.classList.contains('open')) {
    document.getElementById('googleApiKeyInput').value = localStorage.getItem('GODEYE_GOOGLE_KEY') || '';
    document.getElementById('cesiumTokenInput').value = localStorage.getItem('GODEYE_CESIUM_TOKEN') || '';
  }
}

function saveCredentials() {
  const key = document.getElementById('googleApiKeyInput').value.trim();
  const token = document.getElementById('cesiumTokenInput').value.trim();

  if (key) localStorage.setItem('GODEYE_GOOGLE_KEY', key);
  else localStorage.removeItem('GODEYE_GOOGLE_KEY');

  if (token) localStorage.setItem('GODEYE_CESIUM_TOKEN', token);
  else localStorage.removeItem('GODEYE_CESIUM_TOKEN');

  toggleConfigModal();
  location.reload();
}

function clearCredentials() {
  localStorage.removeItem('GODEYE_GOOGLE_KEY');
  localStorage.removeItem('GODEYE_CESIUM_TOKEN');
  toggleConfigModal();
  location.reload();
}

// Start
window.addEventListener('DOMContentLoaded', initCesium);
