function X3DWorld(X3DSceneName) {
  this.X3DScene = document.getElementById(X3DSceneName);
  const linkElement = document.createElement("link");
  linkElement.href = import.meta.url.replace(".js", ".css");
  linkElement.rel = "stylesheet";
  document.head.append(linkElement);
}

function Aircraft(AircraftName) {
  this.AircraftElement = document.getElementById(AircraftName);
  this.axisX = 0;
  this.axisY = 0;
  this.axisZ = 0;
  this.theta = 0;
  this.bodyX = 0;
  this.bodyY = 0;
  this.bodyZ = 0;
}

function step(aircraft, bodyAxis, bodyTheta, bodyTranslation) {
  //console.log(bodyTranslation)
  aircraft.axisX = bodyAxis[0];
  aircraft.axisY = bodyAxis[1];
  aircraft.axisZ = bodyAxis[2];
  aircraft.theta = bodyTheta;
  aircraft.bodyX = bodyTranslation[0];
  aircraft.bodyY = bodyTranslation[1];
  aircraft.bodyZ = bodyTranslation[2];
  //console.log(bodyTranslation.join(" "));
  aircraft.AircraftElement.setAttribute("translation", bodyTranslation.join(" "));
  //console.log(bodyAxis.join(" ") + " " + String(bodyTheta));
  aircraft.AircraftElement.setAttribute("rotation", bodyAxis.join(" ") + " " + String(bodyTheta));
  // Deflect flaps and change rotor speeds
}

export { X3DWorld, Aircraft, step };
