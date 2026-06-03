// Cloudflare Pages Function: /api/training_plan
export async function onRequest(context) {
  const { env } = context;

  const hasKey = !!env.INTERVALS_ICU_API_KEY;
  const hasId = !!env.INTERVALS_ICU_ATHLETE_ID;

  if (!hasKey || !hasId) {
    return new Response(JSON.stringify({
      generated_at: new Date().toISOString(),
      race: null,
      health_snapshot: {},
      today_training: "请在 Cloudflare 环境变量中设置 INTERVALS_ICU_API_KEY 和 INTERVALS_ICU_ATHLETE_ID。",
      week_plan: [],
      race_strategy: null
    }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const data = await generateTrainingPlan(env);
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=600" }
    });
  } catch (e) {
    return new Response(JSON.stringify({
      generated_at: new Date().toISOString(),
      race: null,
      health_snapshot: {},
      today_training: "生成训练计划时出错: " + e.message,
      week_plan: [],
      race_strategy: null
    }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
  }
}

async function generateTrainingPlan(env) {
  const apiKey = env.INTERVALS_ICU_API_KEY;
  const athleteId = env.INTERVALS_ICU_ATHLETE_ID;
  const auth = btoa("API_KEY:" + apiKey);

  // Fetch recent wellness + calendar events
  const [wellnessResp, calResp] = await Promise.all([
    fetch(`https://intervals.icu/api/v1/athlete/${athleteId}/wellness?oldest=2026-06-01`, { headers: { Authorization: `Basic ${auth}` } }),
    fetch(`https://intervals.icu/api/v1/athlete/${athleteId}/events?daysAhead=30`, { headers: { Authorization: `Basic ${auth}` } })
  ]);

  const wellness = await wellnessResp.json();
  const events = calResp.ok ? await calResp.json() : [];

  // Latest health snapshot
  const w = (wellness || []);
  w.sort((a, b) => (a.id || "").localeCompare(b.id || ""));
  const latest = w[w.length - 1] || {};

  const health_snapshot = {
    date: latest.id,
    hrv: latest.hrv || null,
    resting_hr: latest.restingHR || null,
    ctl: latest.ctl ? Math.round(latest.ctl) : null,
    tsb: latest.rampRate ? Math.round(latest.rampRate) : null,
    sleep_score: latest.sleepQuality ? Math.round(latest.sleepQuality * 20) : null,
    body_battery: null
  };

  // Find next race
  const races = (events || []).filter(e => e.category === "RACE" || e.type === "RACE");
  races.sort((a, b) => new Date(a.start) - new Date(b.start));
  const nextRace = races[0];
  const race = nextRace ? {
    name: nextRace.name || nextRace.title || "比赛",
    date: nextRace.start ? nextRace.start.slice(0, 10) : "",
    days_left: Math.ceil((new Date(nextRace.start) - new Date()) / 86400000),
    distance: nextRace.distance ? (nextRace.distance / 1000).toFixed(1) + " km" : "",
    location: nextRace.location || ""
  } : null;

  // Generate training suggestion based on TSB and CTL
  const ctl = latest.ctl || 0;
  const tsb = latest.rampRate || 0;
  let suggestion = "";

  if (tsb > 5) {
    suggestion = "状态良好，适合高质量训练。建议: 间歇跑 6×800m @ 5K配速，组间慢跑400m恢复。总距离约10-12km。";
  } else if (tsb > -5) {
    suggestion = "正常训练日。建议: 节奏跑 8-10km @ 半马配速，心率控制在 Zone 3-4。注意跑后拉伸。";
  } else if (tsb > -15) {
    suggestion = "适度疲劳，建议减量。今天轻松跑 6-8km，心率 Zone 2，步频保持175+。感觉累就缩短距离。";
  } else {
    suggestion = "深度疲劳，建议休息或交叉训练。可以游泳、骑行 30-45分钟低强度，或完全休息一天让身体恢复。";
  }

  // Add race context
  if (race && race.days_left > 0) {
    if (race.days_left <= 7) {
      suggestion += " 距离比赛仅" + race.days_left + "天，以恢复和保持状态为主。";
    } else if (race.days_left <= 21) {
      suggestion += " 距离比赛" + race.days_left + "天，进入减量调整期。";
    } else {
      suggestion += " 距离比赛" + race.days_left + "天，训练正常推进。";
    }
  }

  // Week plan (simple template)
  const weekPlan = generateWeekPlan(tsb, ctl, race);

  // Race strategy
  let raceStrategy = null;
  if (race) {
    raceStrategy = `【${race.name}】比赛策略建议: 1) 赛前3天碳水加载，每天8-10g/kg体重。2) 比赛当天提前2小时吃轻食早餐。3) 起跑控制配速，前半程比目标配速慢3-5秒/km。4) 每5km补水，每10km补能量胶。5) 后半程根据体感逐渐加速。`;
  }

  return {
    generated_at: new Date().toISOString(),
    race,
    health_snapshot,
    today_training: suggestion,
    week_plan: weekPlan,
    race_strategy: raceStrategy
  };
}

function generateWeekPlan(tsb, ctl, race) {
  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const heavyDay = tsb > 0 ? 0 : 2; // Place hard workout on different days based on freshness

  const plans = [
    { day_name: days[0], workout: "轻松跑 6-8km Zone 2", distance: 7 },
    { day_name: days[1], workout: ctl > 40 ? "间歇跑 5×1000m @ 10K配速" : "节奏跑 8km", distance: ctl > 40 ? 10 : 8 },
    { day_name: days[2], workout: "轻松跑 5-6km 或 休息", distance: 5 },
    { day_name: days[3], workout: tsb > -5 ? "中长跑 12-14km Zone 2-3" : "轻松跑 8-10km", distance: tsb > -5 ? 13 : 9 },
    { day_name: days[4], workout: "休息 或 交叉训练 (游泳/骑行)", distance: 0 },
    { day_name: days[5], workout: "长跑 16-20km Zone 2", distance: 18 },
    { day_name: days[6], workout: "恢复跑 5km 或 完全休息", distance: 5 },
  ];

  // Adjust based on race proximity
  if (race && race.days_left <= 7) {
    plans[1].workout = "轻松跑 6km Zone 2"; plans[1].distance = 6;
    plans[3].workout = "轻松跑 5km Zone 2"; plans[3].distance = 5;
    plans[5].workout = "比赛日准备: 轻松跑 3km + 拉伸"; plans[5].distance = 3;
  }

  return plans;
}
