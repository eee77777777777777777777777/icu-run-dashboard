// Cloudflare Pages Function: /api/club
export async function onRequest(context) {
  const { env } = context;

  const hasStrava = !!(env.STRAVA_CLUB_ID && env.STRAVA_TOKEN);

  if (hasStrava) {
    try {
      const data = await fetchStravaClub(env);
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=300" }
      });
    } catch (e) {
      // Fall through to static
    }
  }

  const data = {
    club_name: "跑步俱乐部",
    updated: new Date().toISOString(),
    period: "等待 Strava 数据",
    activities: [],
    commentary: "请在 Cloudflare 环境变量中配置 STRAVA_CLUB_ID 和 STRAVA_TOKEN。Token 获取: strava.com/settings/api"
  };

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=300" }
  });
}

async function fetchStravaClub(env) {
  const clubId = env.STRAVA_CLUB_ID;
  const token = env.STRAVA_TOKEN;

  const resp = await fetch(
    `https://www.strava.com/api/v3/clubs/${clubId}/activities?per_page=100`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!resp.ok) throw new Error(`Strava API: ${resp.status}`);

  const rawActivities = await resp.json();
  const activities = processStravaActivities(rawActivities);

  return {
    club_name: "跑步俱乐部",
    updated: new Date().toISOString(),
    period: "Strava 实时数据",
    activities,
    commentary: generateCommentary(activities)
  };
}

function processStravaActivities(raw) {
  return (raw || []).map(a => {
    const dist = (a.distance || 0) / 1000;
    const time = (a.moving_time || 0) / 60;
    const name = `${a.athlete?.firstname || ""} ${a.athlete?.lastname || ""}`.trim() || "未知";
    return {
      name,
      type: a.type || "Run",
      distance_km: Math.round(dist * 100) / 100,
      moving_min: Math.round(time * 10) / 10,
      elevation_gain: Math.round(a.total_elevation_gain || 0),
      device: a.gear_id || "--",
      activity_name: a.name || "--",
      start_date: a.start_date_local || ""
    };
  });
}

function generateCommentary(activities) {
  const members = [...new Set(activities.map(a => a.name))];
  const runActs = activities.filter(a => a.type === "Run");
  const totalDist = runActs.reduce((s, a) => s + a.distance_km, 0);
  const avgDist = members.length > 0 ? totalDist / members.length : 0;
  const distFormatter = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 1 });
  return `本次活动共 ${members.length} 人参与，${runActs.length} 条跑步记录，人均距离 ${distFormatter.format(avgDist)} km。${members.length > 3 ? "大家都很活跃，继续保持节奏！" : "期待更多伙伴加入。"}`;
}
