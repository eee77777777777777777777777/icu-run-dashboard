// Cloudflare Pages Function: /api/training_plan
export async function onRequest(context) {
  const data = {
    generated_at: new Date().toISOString(),
    race: null,
    health_snapshot: {},
    today_training: "训练计划功能待配置。在 Cloudflare 环境变量中设置 INTERVALS_ICU_API_KEY 后即可自动生成。",
    week_plan: [],
    race_strategy: null
  };

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300"
    }
  });
}
