// Cloudflare Pages Function: /api/heatmap
// Proxies GearAut heatmap API, decodes polylines, returns GeoJSON
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const zoom = parseInt(url.searchParams.get("zoom") || "10");
  const type = url.searchParams.get("type") || "";
  const year = url.searchParams.get("year") || "";
  const month = url.searchParams.get("month") || "";

  const hasKey = !!env.GEARAUT_API_KEY;

  if (!hasKey) {
    return new Response(JSON.stringify(getSampleGeoJSON()), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=3600" }
    });
  }

  try {
    const headers = { "X-API-Key": env.GEARAUT_API_KEY };
    if (env.GEARAUT_AUTHORIZATION) {
      headers["Authorization"] = env.GEARAUT_AUTHORIZATION;
    }

    const resp = await fetch("https://www.gearaut.com/api/open-api/heatmap", { headers });
    if (!resp.ok) throw new Error("GearAut API: " + resp.status);

    const json = await resp.json();
    if (json.code !== 0 || !json.ok) throw new Error("GearAut API error");

    const activities = json.data || [];
    const geojson = buildGeoJSON(activities, { zoom, type, year, month });

    return new Response(JSON.stringify(geojson), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=3600" }
    });
  } catch (e) {
    return new Response(JSON.stringify({
      type: "FeatureCollection", features: [],
      _error: e.message
    }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}

// Decode Google encoded polyline to [lat, lng] pairs
function decodePolyline(encoded) {
  if (!encoded) return [];
  const points = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let shift = 0, result = 0, byte;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += deltaLat;
    shift = 0; result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += deltaLng;
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

// Ramer-Douglas-Peucker simplification
function simplifyRDP(points, epsilon) {
  if (points.length <= 2) return points;
  const first = points[0], last = points[points.length - 1];
  let maxDist = 0, maxIdx = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDist(points[i], first, last);
    if (dist > maxDist) { maxDist = dist; maxIdx = i; }
  }
  if (maxDist > epsilon) {
    const left = simplifyRDP(points.slice(0, maxIdx + 1), epsilon);
    const right = simplifyRDP(points.slice(maxIdx), epsilon);
    return left.slice(0, -1).concat(right);
  }
  return [first, last];
}

function perpendicularDist(p, a, b) {
  const dx = b[1] - a[1], dy = b[0] - a[0];
  const len = dx * dx + dy * dy;
  if (len === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const t = Math.max(0, Math.min(1, ((p[1] - a[1]) * dx + (p[0] - a[0]) * dy) / len));
  return Math.hypot(p[0] - a[0] - t * dy, p[1] - a[1] - t * dx);
}

// Get epsilon based on zoom level
function epsilonForZoom(zoom) {
  if (zoom >= 12) return 0;          // original
  if (zoom >= 11) return 0.00002;    // high
  if (zoom >= 9)  return 0.0001;     // medium
  if (zoom >= 7)  return 0.0005;     // low
  return 0.002;                       // overview
}

// Build GeoJSON FeatureCollection from activities
function buildGeoJSON(activities, { zoom, type, year, month }) {
  const epsilon = epsilonForZoom(zoom);
  const features = [];

  let filtered = activities;
  if (type) filtered = filtered.filter(a => a.type === type);
  if (year) filtered = filtered.filter(a => (a.date || "").startsWith(year));
  if (month) filtered = filtered.filter(a => (a.date || "").slice(5, 7) === month.padStart(2, "0"));

  for (const act of filtered) {
    const coords = decodePolyline(act.polyline);
    if (coords.length < 2) continue;

    const simplified = epsilon > 0 ? simplifyRDP(coords, epsilon) : coords;

    // Split at antimeridian crossings
    const segments = splitAntimeridian(simplified);

    let geometry;
    if (segments.length === 1) {
      geometry = { type: "LineString", coordinates: segments[0].map(p => [p[1], p[0]]) };
    } else {
      geometry = { type: "MultiLineString", coordinates: segments.map(s => s.map(p => [p[1], p[0]])) };
    }

    features.push({
      type: "Feature",
      geometry,
      properties: {
        id: act.id,
        name: act.name || "",
        type: act.type || "Run",
        date: act.date || "",
        point_count: coords.length,
        simplified_count: simplified.length
      }
    });
  }

  return {
    type: "FeatureCollection",
    features,
    _meta: { total: activities.length, filtered: features.length, zoom, epsilon }
  };
}

// Split track at antimeridian (longitude delta > 180)
function splitAntimeridian(coords) {
  if (coords.length < 2) return [coords];
  const segments = [];
  let current = [coords[0]];
  for (let i = 1; i < coords.length; i++) {
    if (Math.abs(coords[i][1] - coords[i - 1][1]) > 180) {
      segments.push(current);
      current = [coords[i]];
    } else {
      current.push(coords[i]);
    }
  }
  if (current.length > 0) segments.push(current);
  return segments;
}

// Sample GeoJSON for when GearAut key is not configured
function getSampleGeoJSON() {
  return {
    type: "FeatureCollection",
    features: [],
    _sample: true,
    _message: "Configure GEARAUT_API_KEY in Cloudflare environment variables to see real heatmap data."
  };
}
