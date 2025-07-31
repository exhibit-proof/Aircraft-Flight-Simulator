const fs = require('fs');
const path = require('path');

function loadToken() {
    const configPath = path.join(__dirname, 'cesium_token.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if(config.CESIUM_ION_TOKEN == "Enter Token Here") {
      console.error("Please set your Cesium Ion token in the config file.");
      process.exit(1);
    }
    return config.CESIUM_ION_TOKEN;
}

const token = loadToken();
Cesium.Ion.defaultAccessToken = token;

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