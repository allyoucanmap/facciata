

const EARTH_RADIUS = 6378137.0;
const EARTH_CIRCUMFERENCE = 2 * Math.PI * EARTH_RADIUS;
const ABS_MAX_LAT = 85.0511;

const deg = r => r / (Math.PI / 180.0);
const rad = d => d * (Math.PI / 180.0);
const resolution = (lat, z) => EARTH_CIRCUMFERENCE * Math.cos(lat * Math.PI / 180) / Math.pow(2, z + 8);
const scale = (lat, z, dpi) => dpi * 39.37 * resolution(lat, z);
const xToLon = x => deg(x / EARTH_RADIUS);
const yToLat = y => deg(2 * Math.atan(Math.exp(y / EARTH_RADIUS)) - Math.PI / 2);
const lonToX = lon => rad(lon) * EARTH_RADIUS;
const latToY = lat => Math.log(Math.tan(rad(lat) / 2 + Math.PI / 4)) * EARTH_RADIUS;
const wgs84 = coord => [xToLon(coord[0]), yToLat(coord[1])];
const pseudo = coord => [lonToX(coord[0]), latToY(coord[1])];

export {
  ABS_MAX_LAT,
  resolution,
  scale,
  wgs84,
  pseudo,
  lonToX,
  latToY,
  rad,
  deg
};
