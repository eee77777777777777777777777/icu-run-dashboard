// Cloudflare Pages Function: /api/club
export async function onRequest(context) {
  const data = {
    club_name: "跑步俱乐部",
    updated: new Date().toISOString(),
    period: "等待 Strava 数据",
    activities: [],
    commentary: "俱乐部数据需要通过 Strava API 或 /club_today.json 获取。请在 Cloudflare 环境变量中配置 STRAVA_CLUB_ID 和 STRAVA_TOKEN。"
  };

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300"
    }
  });
}
