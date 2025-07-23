import { step, X3DWorld, Aircraft } from './simulator.js';

function showMessage(message) {
  setTimeout(() => alert(message), 50);
}

<<<<<<< HEAD
setInterval(loadAircraftData, 100); // update every 100 ms
=======
// handle incoming WS messages
function receiveUpdatedStates(aircraft, websocket) {
  console.log(aircraft);
  websocket.addEventListener("message", ({ data }) => {
    const event = JSON.parse(data);
        step(
          aircraft,
          [event.axisY, event.axisZ, event.axisX],
          -event.theta,
          [event.bodyX, event.bodyY, event.bodyZ]
        );

  });
}

// when the user clicks on any DEF-named X3D node, send its name
function sendUserInputs(aircraft) {
  console.log(aircraft);
  ws.send(JSON.stringify({"axisX": aircraft.axisX, "axisY": aircraft.axisY, "axisZ": aircraft.axisZ, "theta": aircraft.theta, "bodyX": aircraft.bodyX, "bodyY": aircraft.bodyY, "bodyZ": aircraft.bodyZ }));
}

document.addEventListener("DOMContentLoaded", () => {
  //const x3dWorld = new X3DWorld("x3dElement");
  const aircraft = new Aircraft("Buffalonius");
  const ws = new WebSocket("ws://localhost:8765/");
  ws.onopen = () => {
    console.log("WebSocket connected.");
    receiveUpdatedStates(aircraft, ws);
    //document.getElementById("BuffaloniusTouchSensor").addEventListener("click", sendUserInputs(aircraft), false);
  };

  ws.onerror = (err) => {
    console.error("WebSocket error:", err);
    showMessage("Failed to connect to the server.");
  };

  ws.onclose = () => {
    console.warn("WebSocket connection closed.");
  };
});
>>>>>>> 8530830 (Added X3D Example)
