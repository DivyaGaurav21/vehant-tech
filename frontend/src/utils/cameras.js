export const cameraRegistry = [
  {
    cameraId: "CAM-01",
    name: "Central Avenue",
    zone: "Central Zone",
    junction: "City Hall Junction",
    location: "City Hall Junction, Central Zone",
  },
  {
    cameraId: "CAM-02",
    name: "Market Street",
    zone: "Central Zone",
    junction: "Old Market Crossing",
    location: "Old Market Crossing, Central Zone",
  },
  {
    cameraId: "CAM-03",
    name: "Riverfront Road",
    zone: "East Zone",
    junction: "Riverside Bridge",
    location: "Riverside Bridge, East Zone",
  },
  {
    cameraId: "CAM-04",
    name: "Airport Connector",
    zone: "East Zone",
    junction: "Terminal Road Merge",
    location: "Terminal Road Merge, East Zone",
  },
  {
    cameraId: "CAM-05",
    name: "University Road",
    zone: "North Zone",
    junction: "Knowledge Park Circle",
    location: "Knowledge Park Circle, North Zone",
  },
  {
    cameraId: "CAM-06",
    name: "Industrial Bypass",
    zone: "North Zone",
    junction: "Freight Gate Crossing",
    location: "Freight Gate Crossing, North Zone",
  },
  {
    cameraId: "CAM-07",
    name: "Garden Ring Road",
    zone: "South Zone",
    junction: "Botanical Garden Circle",
    location: "Botanical Garden Circle, South Zone",
  },
  {
    cameraId: "CAM-08",
    name: "Station Road",
    zone: "South Zone",
    junction: "Railway Station Approach",
    location: "Railway Station Approach, South Zone",
  },
  {
    cameraId: "CAM-09",
    name: "Lakeview Boulevard",
    zone: "West Zone",
    junction: "Lakeview Crossroads",
    location: "Lakeview Crossroads, West Zone",
  },
];
export function getCameraMetadata(cameraId) {
  return cameraRegistry.find((camera) => camera.cameraId === cameraId);
}
