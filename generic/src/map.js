export const DEFAULT_MAP_ZOOM = 17;
export const TILE_SIZE = 256;

export function latLonToPixel(latitude, longitude, zoom) {
  const scale = TILE_SIZE * 2 ** zoom;
  const sinLat = Math.sin(toRad(clamp(latitude, -85.05112878, 85.05112878)));
  return {
    x: (longitude + 180) / 360 * scale,
    y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale,
  };
}

export function pixelToLatLon(x, y, zoom) {
  const scale = TILE_SIZE * 2 ** zoom;
  const longitude = x / scale * 360 - 180;
  const latitude = toDeg(Math.atan(Math.sinh(Math.PI * (1 - 2 * y / scale))));
  return { latitude, longitude };
}

export function buildTileLayout(centerLatitude, centerLongitude, zoom, width, height) {
  const center = latLonToPixel(centerLatitude, centerLongitude, zoom);
  const left = center.x - width / 2;
  const top = center.y - height / 2;
  const startX = Math.floor(left / TILE_SIZE);
  const endX = Math.floor((left + width) / TILE_SIZE);
  const startY = Math.floor(top / TILE_SIZE);
  const endY = Math.floor((top + height) / TILE_SIZE);
  const tileCount = 2 ** zoom;
  const tiles = [];

  for (let x = startX; x <= endX; x += 1) {
    for (let y = startY; y <= endY; y += 1) {
      if (y < 0 || y >= tileCount) continue;
      const wrappedX = ((x % tileCount) + tileCount) % tileCount;
      tiles.push({
        x: wrappedX,
        y,
        z: zoom,
        left: Math.round(x * TILE_SIZE - left),
        top: Math.round(y * TILE_SIZE - top),
      });
    }
  }

  return { tiles, center, left, top };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toRad(degrees) {
  return degrees * Math.PI / 180;
}

function toDeg(radians) {
  return radians * 180 / Math.PI;
}
