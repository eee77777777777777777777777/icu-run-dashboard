// Cloudflare Pages Function: /api/data
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const forceRefresh = url.searchParams.get("refresh") === "1";

  const hasKey = !!env.INTERVALS_ICU_API_KEY;
  const hasId = !!env.INTERVALS_ICU_ATHLETE_ID;

  let data = null;
  let errorMsg = null;

  if (hasKey && hasId) {
    try {
      data = await fetchIntervalsData(env);
    } catch (e) {
      errorMsg = e.message;
    }
  }

  if (!data) data = getStaticData();
  data.generated_at = new Date().toISOString();
  data.cached = !forceRefresh;
  data._debug = { hasApiKey: hasKey, hasAthleteId: hasId, error: errorMsg };
  if (url.searchParams.get("debug") === "wellness" && hasKey && hasId) {
    try {
      const auth = btoa("API_KEY:" + env.INTERVALS_ICU_API_KEY);
      const wr = await fetch(`https://intervals.icu/api/v1/athlete/${env.INTERVALS_ICU_ATHLETE_ID}/wellness?oldest=2026-05-01`, { headers: { Authorization: `Basic ${auth}` } });
      const wdata = await wr.json();
      const sample = (wdata || []).slice(-3);
      return new Response(JSON.stringify({ count: wdata.length, sample }), { headers: { "Content-Type": "application/json" } });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { headers: { "Content-Type": "application/json" } });
    }
  }

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=300" }
  });
}

async function fetchIntervalsData(env) {
  const apiKey = env.INTERVALS_ICU_API_KEY;
  const athleteId = env.INTERVALS_ICU_ATHLETE_ID;
  const auth = btoa("API_KEY:" + apiKey);

  const [wellnessResp, activitiesResp] = await Promise.all([
    fetch(`https://intervals.icu/api/v1/athlete/${athleteId}/wellness?oldest=2023-01-01`, { headers: { Authorization: `Basic ${auth}` } }),
    fetch(`https://intervals.icu/api/v1/athlete/${athleteId}/activities?limit=5000&oldest=2020-01-01`, { headers: { Authorization: `Basic ${auth}` } })
  ]);

  if (!wellnessResp.ok) throw new Error(`Wellness API: ${wellnessResp.status}`);
  if (!activitiesResp.ok) throw new Error(`Activities API: ${activitiesResp.status}`);

  const wellness = await wellnessResp.json();
  const activities = await activitiesResp.json();

  return {
    ...processIntervalsData(wellness, activities),
    health: processHealthData(wellness)
  };
}

function processIntervalsData(wellness, activities) {
  const runs = (activities || []).filter(a => a.type === "Run" || a.type === "VirtualRun");
  runs.sort((a, b) => new Date(a.start_date_local) - new Date(b.start_date_local));

  const totalDist = runs.reduce((s, a) => s + (a.distance || 0) / 1000, 0);
  const totalLoad = runs.reduce((s, a) => s + (a.icu_training_load || 0), 0);
  const totalMoving = runs.reduce((s, a) => s + (a.moving_time || 0), 0);
  const avgHrVals = runs.filter(a => a.icu_avg_hr).map(a => a.icu_avg_hr);
  const avgHr = avgHrVals.length ? avgHrVals.reduce((s, v) => s + v, 0) / avgHrVals.length : null;

  const firstRun = runs[0];
  const lastRun = runs[runs.length - 1];

  const monthMap = {};
  runs.forEach(a => {
    const d = new Date(a.start_date_local);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap[key]) monthMap[key] = { period: key, dist: 0, load: 0, runs: 0, hours: 0, hrSum: 0, hrCount: 0, activities: [] };
    monthMap[key].dist += (a.distance || 0) / 1000;
    monthMap[key].load += (a.icu_training_load || 0);
    monthMap[key].runs += 1;
    monthMap[key].hours += (a.moving_time || 0) / 3600;
    if (a.icu_avg_hr) { monthMap[key].hrSum += a.icu_avg_hr; monthMap[key].hrCount++; }
    monthMap[key].activities.push({
      name: a.name || a.type, distance_km: Math.round((a.distance || 0) / 100) / 10,
      moving_min: Math.round((a.moving_time || 0) / 6) / 10, load: Math.round(a.icu_training_load || 0),
      avg_hr: a.icu_avg_hr || null, avg_pace: a.icu_avg_pace || null,
      elevation_gain: a.total_elevation_gain || 0, calories: a.icu_calories || null,
      avg_power: a.icu_weighted_avg_watts || null, cadence: a.icu_avg_cadence || null,
      ifactor: a.icu_intensity || null, tss: a.icu_training_stress_score || null,
      type: a.type || "Run", id: a.id, notes: a.description || ""
    });
  });

  const monthRows = Object.values(monthMap).sort((a, b) => a.period.localeCompare(b.period)).map(m => ({
    ...m, avg_hr: m.hrCount > 0 ? Math.round(m.hrSum / m.hrCount) : null,
    avg_pace: m.dist > 0 && m.hours > 0 ? (m.hours * 60 / m.dist) : null,
    activities: m.activities.slice(-50)
  }));

  const yearMap = {};
  monthRows.forEach(m => {
    const yr = m.period.slice(0, 4);
    if (!yearMap[yr]) yearMap[yr] = { period: yr, dist: 0, load: 0, runs: 0, avg_hr: 0, hrCount: 0 };
    yearMap[yr].dist += m.dist; yearMap[yr].load += m.load; yearMap[yr].runs += m.runs;
  });
  const yearRows = Object.values(yearMap).map(y => ({ period: y.period, dist: Math.round(y.dist * 10) / 10, load: Math.round(y.load), runs: y.runs }));

  const hrBins = { "<130": 0, "130-145": 0, "145-155": 0, "155+": 0 };
  runs.forEach(a => { const hr = a.icu_avg_hr; if (hr) { if (hr < 130) hrBins["<130"]++; else if (hr < 145) hrBins["130-145"]++; else if (hr < 155) hrBins["145-155"]++; else hrBins["155+"]++; } });

  const recentRuns = runs.slice(-30).reverse().map(a => ({
    name: a.name || a.type, date: a.start_date_local ? a.start_date_local.slice(0, 10) : "",
    distance_km: Math.round((a.distance || 0) / 100) / 10, moving_min: Math.round((a.moving_time || 0) / 6) / 10,
    avg_hr: a.icu_avg_hr || null, avg_pace: a.icu_avg_pace || null,
    load: Math.round(a.icu_training_load || 0), elevation_gain: a.total_elevation_gain || 0,
    type: a.type || "Run", id: a.id
  }));

  const topByLoad = [...runs].sort((a, b) => (b.icu_training_load || 0) - (a.icu_training_load || 0)).slice(0, 10).map(a => ({
    name: a.name || a.type, date: a.start_date_local ? a.start_date_local.slice(0, 10) : "",
    distance_km: Math.round((a.distance || 0) / 100) / 10, moving_min: Math.round((a.moving_time || 0) / 6) / 10,
    load: Math.round(a.icu_training_load || 0), type: a.type || "Run", id: a.id
  }));

  const peakMonth = [...monthRows].sort((a, b) => b.load - a.load)[0];
  const firstDate = firstRun ? new Date(firstRun.start_date_local) : new Date();
  const weeksSince = Math.max((new Date() - firstDate) / (7 * 86400000), 1);

  return {
    summary: {
      distance_km: Math.round(totalDist * 10) / 10, activity_count: runs.length,
      weekly_km: Math.round(totalDist / weeksSince * 10) / 10,
      training_load: Math.round(totalLoad), avg_hr: avgHr ? Math.round(avgHr * 10) / 10 : null,
      total_hours: Math.round(totalMoving / 360) / 10,
      first_run: firstRun ? firstRun.start_date_local.slice(0, 10) : "",
      last_run: lastRun ? lastRun.start_date_local.slice(0, 10) : "",
      peak_month_km: peakMonth ? Math.round(peakMonth.dist * 10) / 10 : null,
      peak_month: peakMonth ? peakMonth.period : null
    },
    month_rows: monthRows, year_rows: yearRows, hr_bins: hrBins,
    recent_runs: recentRuns, top_by_load: topByLoad
  };
}

function processHealthData(wellness) {
  const w = (wellness || []);
  if (!w.length) return getStaticHealth();

  w.sort((a, b) => (a.id || "").localeCompare(b.id || ""));
  const latest = w[w.length - 1] || {};
  const prev = w[w.length - 2] || {};

  // Calculate trends
  const hrvTrend = latest.hrv && prev.hrv ? (latest.hrv - prev.hrv) : null;
  const rhrTrend = latest.resting_hr && prev.resting_hr ? (latest.resting_hr - prev.resting_hr) : null;

  // Build time series (last 90 days)
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const recent = w.filter(d => d.id >= cutoffStr);

  // Sleep score: convert 1-5 to 0-100
  const sleepToScore = (q) => q != null ? Math.round(q * 20) : null;

  return {
    hrv: latest.hrv || null,
    hrv_trend: hrvTrend,
    resting_hr: latest.resting_hr || null,
    rhr_trend: rhrTrend,
    sleep_score: sleepToScore(latest.sleep_quality),
    sleep_hours: latest.sleep_secs ? Math.round(latest.sleep_secs / 360) / 10 : null,
    ctl: latest.ctl || null,
    atl: latest.atl || null,
    tsb: latest.tsb || null,
    weight_kg: latest.body?.weight_kg || null,
    body_fat: latest.body?.body_fat_percent || null,
    body_battery: null,
    vo2max_run: null,
    vo2max_cycle: null,
    readiness: null,
    hrv_data: recent.map(d => ({ date: d.id, val: d.hrv })).filter(d => d.val != null),
    rhr_data: recent.map(d => ({ date: d.id, val: d.resting_hr })).filter(d => d.val != null),
    sleep_data: recent.map(d => ({
      date: d.id,
      score: sleepToScore(d.sleep_quality),
      hours: d.sleep_secs ? Math.round(d.sleep_secs / 360) / 10 : null
    })).filter(d => d.score != null),
    weight_data: recent.map(d => ({
      date: d.id,
      weight: d.body?.weight_kg,
      bodyFat: d.body?.body_fat_percent
    })).filter(d => d.weight != null),
    ctl_data: recent.map(d => ({ date: d.id, ctl: d.ctl, atl: d.atl, tsb: d.tsb })).filter(d => d.ctl != null)
  };
}

function getStaticHealth() {
  return {
    hrv: null, hrv_trend: null, resting_hr: null, rhr_trend: null,
    sleep_score: null, sleep_hours: null,
    ctl: null, atl: null, tsb: null,
    weight_kg: null, body_fat: null,
    body_battery: null, vo2max_run: null, vo2max_cycle: null, readiness: null,
    hrv_data: [], rhr_data: [], sleep_data: [], weight_data: [], ctl_data: []
  };
}

function getStaticData() {
  return {
    summary: { distance_km: 0, activity_count: 0, weekly_km: 0, training_load: 0, avg_hr: null, total_hours: 0, first_run: "", last_run: "", peak_month_km: null, peak_month: null },
    month_rows: [], year_rows: [], hr_bins: { "<130": 0, "130-145": 0, "145-155": 0, "155+": 0 }, recent_runs: [], top_by_load: [],
    health: getStaticHealth()
  };
}

