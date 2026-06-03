// Cloudflare Pages Function: /api/data
// Returns summary + training data from Intervals.icu or embedded sources

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const forceRefresh = url.searchParams.get("refresh") === "1";
  const mode = url.searchParams.get("mode") || "summary";

  // Try to fetch from Intervals.icu if configured
  let data = null;
  if (env.INTERVALS_ICU_API_KEY && env.INTERVALS_ICU_ATHLETE_ID) {
    try {
      data = await fetchIntervalsData(env);
    } catch (e) {
      console.error("Intervals.icu fetch failed:", e.message);
    }
  }

  // Fallback to embedded/static data
  if (!data) {
    data = getStaticData();
  }

  data.generated_at = new Date().toISOString();
  data.cached = !forceRefresh;

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300"
    }
  });
}

async function fetchIntervalsData(env) {
  const apiKey = env.INTERVALS_ICU_API_KEY;
  const athleteId = env.INTERVALS_ICU_ATHLETE_ID;
  const auth = btoa(`API_KEY:${apiKey}`);

  // Fetch wellness data
  const wellnessResp = await fetch(
    `https://intervals.icu/api/v1/athlete/${athleteId}/wellness?oldest=2023-01-01`,
    { headers: { Authorization: `Basic ${auth}` } }
  );
  const wellness = await wellnessResp.json();

  // Fetch activities
  const activitiesResp = await fetch(
    `https://intervals.icu/api/v1/athlete/${athleteId}/activities?limit=200&oldest=2023-01-01`,
    { headers: { Authorization: `Basic ${auth}` } }
  );
  const activities = await activitiesResp.json();

  return processIntervalsData(wellness, activities);
}

function processIntervalsData(wellness, activities) {
  // Build summary from activities
  const runs = (activities || []).filter(a => a.type === "Run" || a.type === "VirtualRun");
  const totalDist = runs.reduce((s, a) => s + (a.distance || 0) / 1000, 0);
  const totalLoad = runs.reduce((s, a) => s + (a.icu_training_load || 0), 0);
  const totalMoving = runs.reduce((s, a) => s + (a.moving_time || 0), 0);
  const avgHrVals = runs.filter(a => a.icu_avg_hr).map(a => a.icu_avg_hr);
  const avgHr = avgHrVals.length ? avgHrVals.reduce((s, v) => s + v, 0) / avgHrVals.length : null;

  // Sort by date
  runs.sort((a, b) => new Date(a.start_date_local) - new Date(b.start_date_local));
  const firstRun = runs[0];
  const lastRun = runs[runs.length - 1];

  // Monthly aggregation
  const monthMap = {};
  runs.forEach(a => {
    const d = new Date(a.start_date_local);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap[key]) monthMap[key] = { period: key, dist: 0, load: 0, runs: 0, hours: 0, hrSum: 0, hrCount: 0 };
    monthMap[key].dist += (a.distance || 0) / 1000;
    monthMap[key].load += (a.icu_training_load || 0);
    monthMap[key].runs += 1;
    monthMap[key].hours += (a.moving_time || 0) / 3600;
    if (a.icu_avg_hr) { monthMap[key].hrSum += a.icu_avg_hr; monthMap[key].hrCount++; }
  });

  const monthRows = Object.values(monthMap).sort((a, b) => a.period.localeCompare(b.period)).map(m => ({
    ...m,
    avg_hr: m.hrCount > 0 ? Math.round(m.hrSum / m.hrCount) : null,
    avg_pace: m.dist > 0 && m.hours > 0 ? (m.hours * 60 / m.dist) : null
  }));

  // Year aggregation
  const yearMap = {};
  monthRows.forEach(m => {
    const yr = m.period.slice(0, 4);
    if (!yearMap[yr]) yearMap[yr] = { period: yr, dist: 0, load: 0, runs: 0 };
    yearMap[yr].dist += m.dist;
    yearMap[yr].load += m.load;
    yearMap[yr].runs += m.runs;
  });
  const yearRows = Object.values(yearMap).sort((a, b) => a.period.localeCompare(b.period));

  // HR bins
  const hrBins = { "<130": 0, "130-145": 0, "145-155": 0, "155+": 0 };
  runs.forEach(a => {
    const hr = a.icu_avg_hr;
    if (hr) {
      if (hr < 130) hrBins["<130"]++;
      else if (hr < 145) hrBins["130-145"]++;
      else if (hr < 155) hrBins["145-155"]++;
      else hrBins["155+"]++;
    }
  });

  // Recent runs
  const recentRuns = runs.slice(-30).reverse().map(a => ({
    name: a.name || a.type,
    date: a.start_date_local ? a.start_date_local.slice(0, 10) : "",
    distance_km: Math.round((a.distance || 0) / 100) / 10,
    moving_min: Math.round((a.moving_time || 0) / 6) / 10,
    avg_hr: a.icu_avg_hr || null,
    avg_pace: a.icu_avg_pace || null,
    load: Math.round(a.icu_training_load || 0),
    elevation_gain: a.total_elevation_gain || 0,
    type: a.type || "Run",
    id: a.id
  }));

  // Top by load
  const topByLoad = [...runs].sort((a, b) => (b.icu_training_load || 0) - (a.icu_training_load || 0)).slice(0, 10).map(a => ({
    name: a.name || a.type,
    date: a.start_date_local ? a.start_date_local.slice(0, 10) : "",
    distance_km: Math.round((a.distance || 0) / 100) / 10,
    moving_min: Math.round((a.moving_time || 0) / 6) / 10,
    load: Math.round(a.icu_training_load || 0),
    type: a.type || "Run",
    id: a.id
  }));

  return {
    summary: {
      distance_km: Math.round(totalDist * 10) / 10,
      activity_count: runs.length,
      weekly_km: Math.round(totalDist / Math.max(runs.length, 1) * 7 * 10) / 10,
      training_load: Math.round(totalLoad),
      avg_hr: avgHr ? Math.round(avgHr * 10) / 10 : null,
      total_hours: Math.round(totalMoving / 360) / 10,
      first_run: firstRun ? firstRun.start_date_local.slice(0, 10) : "",
      last_run: lastRun ? lastRun.start_date_local.slice(0, 10) : ""
    },
    month_rows: monthRows,
    year_rows: yearRows,
    hr_bins: hrBins,
    recent_runs: recentRuns,
    top_by_load: topByLoad
  };
}

function getStaticData() {
  return {
    summary: {
      distance_km: 0,
      activity_count: 0,
      weekly_km: 0,
      training_load: 0,
      avg_hr: null,
      total_hours: 0,
      first_run: "",
      last_run: ""
    },
    month_rows: [],
    year_rows: [],
    hr_bins: { "<130": 0, "130-145": 0, "145-155": 0, "155+": 0 },
    recent_runs: [],
    top_by_load: [],
    race: null,
    training_today: null
  };
}
