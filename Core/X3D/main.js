Cesium.Ion.defaultAccessToken = 'ENTER YOUR TOKEN HERE';

const viewer = new Cesium.Viewer('cesiumContainer', {
  shouldAnimate: true
});
const ws = new WebSocket("ws://localhost:8765/");
const aircraftEntity = viewer.entities.add({
  name: "Buffalonius",
  model: {
    uri: "Buffalonius.glb",  // or your own .gltf/.glb model
    scale: 1.0
  }
});

async function loadAircraftData() {
  ws.onmessage = async (event) => {
    try {
      const text = event.data instanceof Blob ? await event.data.text() : event.data;
      const data = JSON.parse(text);

      const lat = parseFloat(data["latitude"]);
      const lon = parseFloat(data["longitude"]);
      const alt = parseFloat(data["altitude"]);

      const roll = parseFloat(data["phi"]);
      const pitch = parseFloat(data["theta"]);
      const yaw = parseFloat(data["psi"]);

      console.log("---- Aircraft FDM Data ----");
      for (const [key, value] of Object.entries(data)) {
        console.log(`${key}: ${Array.isArray(value) ? value[0] : value}`);
      }
      console.log("--------------------------");
      
      aircraftEntity.position = Cesium.Cartesian3.fromRadians(lon, lat, alt);
      aircraftEntity.orientation = Cesium.Transforms.headingPitchRollQuaternion(
        Cesium.Cartesian3.fromRadians(lon, lat, alt),
        new Cesium.HeadingPitchRoll(yaw, pitch, roll)
      );

      viewer.trackedEntity = aircraftEntity;
    } catch (error) {
      console.error("Failed to process WebSocket message:", error);
    }
  };  
}

setInterval(loadAircraftData, 100); // update every 100 ms


/*
document.addEventListener("DOMContentLoaded", () => {
  const ws = new WebSocket("ws://localhost:8765/");
  const AircraftElement = document.getElementById("Buffalonius");

  ws.onopen = () => {
    console.log("WebSocket connected.");
  };

  ws.onmessage = async (event) => {
    try {
      const text = event.data instanceof Blob ? await event.data.text() : event.data;
      const data = JSON.parse(text);
      console.log("oof");
      console.log(text);
      console.log(convertInput(data));
      const {x, y, z, axis, theta} = convertInput(data);
      AircraftElement.setAttribute("translation", [x,y,z].join(" "));
      AircraftElement.setAttribute("rotation", [axis, theta].join(" "));
    } catch (error) {
      console.error("Failed to process WebSocket message:", error);
    }
  };

  ws.onerror = (err) => {
    console.error("WebSocket error:", err);
    showMessage("Failed to connect to the server.");
  };

  ws.onclose = () => {
    console.warn("WebSocket connection closed.");
  };
});

function geodeticToECEF(lat, lon, alt) {
    // Constants for WGS84
    const a = 6378137.0; // semi-major axis (meters)
    const f = 1 / 298.257223563; // flattening
    const e2 = f * (2 - f); // eccentricity squared

    const sinLat = Math.sin(lat);
    const cosLat = Math.cos(lat);
    const sinLon = Math.sin(lon);
    const cosLon = Math.cos(lon);

    // Radius of curvature in the prime vertical
    const N = a / Math.sqrt(1 - e2 * sinLat * sinLat);

    // ECEF coordinates
    const x = (N + alt) * cosLat * cosLon;
    const y = (N + alt) * cosLat * sinLon;
    const z = ((1 - e2) * N + alt) * sinLat;

    return { x, y, z };
}

function eulerToAxisAngle(roll, pitch, yaw) {
    // Convert degrees to radians if necessary
    // Assuming roll, pitch, yaw are in radians

    // Step 1: Convert Euler angles to quaternion
    const cy = Math.cos(yaw * 0.5);
    const sy = Math.sin(yaw * 0.5);
    const cp = Math.cos(pitch * 0.5);
    const sp = Math.sin(pitch * 0.5);
    const cr = Math.cos(roll * 0.5);
    const sr = Math.sin(roll * 0.5);

    const qw = cr * cp * cy + sr * sp * sy;
    const qx = sr * cp * cy - cr * sp * sy;
    const qy = cr * sp * cy + sr * cp * sy;
    const qz = cr * cp * sy - sr * sp * cy;

    // Step 2: Convert quaternion to axis-angle
    const angle = 2 * Math.acos(qw);
    const s = Math.sqrt(1 - qw * qw);

    let axis;
    if (s < 0.0001) {
        // If s is close to zero, direction is not important
        axis = { x: 1, y: 0, z: 0 }; // default axis
    } else {
        axis = {
            x: qx / s,
            y: qy / s,
            z: qz / s
        };
    }

    return {
        axis,
        angle // in radians
    };
}

function convertInput(input) {
    const latitude = input.latitude[0];
    const longitude = input.longitude[0];
    const altitude = input.altitude[0];
    const phi = input.phi[0];
    const theta = input.theta[0];
    const psi = input.psi[0];

    const { x, y, z } = geodeticToECEF(latitude, longitude, altitude);
    const { axis, angle } = eulerToAxisAngle(phi, theta, psi);

    return {
        x, y, z,
        axis, angle
    };
}*/