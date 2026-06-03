// i18n - Chinese / English bilingual support
(function() {
  var translations = {
    zh: {
      // Nav
      "nav.home": "首页",
      "nav.health": "健康报告",
      "nav.training": "AI 训练",
      "nav.lang": "EN",

      // Index - Status bar
      "status.loading": "正在加载最新数据",
      "status.loading_data": "正在连接数据源...",
      "status.manual_refresh": "正在手动刷新...",
      "status.updating": "正在更新数据...",
      "status.update_failed": "更新失败",
      "status.cached": "缓存数据，后台定时刷新",
      "status.live": "已拉取最新数据",
      "status.updated_at": "更新于",

      // Index - Tabs
      "tab.overview": "总览",
      "tab.health_snapshot": "健康快照",
      "tab.training_detail": "训练详情",

      // Index - Race Card
      "race.next_race": "下一场比赛",
      "race.pending": "待定",
      "race.configure": "配置比赛信息后可显示倒计时",
      "race.days": "天",

      // Index - Recovery
      "recovery.index": "恢复指数",

      // Index - Status Cards
      "card.total_distance": "三年总跑量",
      "card.total_runs": "跑步次数",
      "card.weekly_avg": "平均每周",
      "card.training_load": "训练负荷",
      "card.avg_hr": "平均心率",
      "card.avg_pace": "平均配速",
      "card.total_hours": "总时长",
      "card.peak_month": "最高月",
      "card.km_week": "km / 周",
      "card.three_year": "三年累计",
      "card.three_year_tl": "三年累计 TL",
      "card.all_avg": "全部活动均值",
      "card.since": "开始",

      // Index - Training Today
      "training.today": "今日训练建议",
      "training.loading": "加载中...",

      // Index - Insight
      "insight.title": "当前判断",
      "insight.auto": "自动分析",
      "insight.no_data": "还没有足够的跑步数据生成判断。",

      // Index - Week
      "week.title": "本周训练",
      "week.motto": "激励语 · 运动卡片",
      "week.distance": "本周跑量",
      "week.time": "本周时长",
      "week.load": "本周负荷",
      "week.speed": "周均速度",
      "week.no_runs": "本周暂无跑步记录",
      "week.runs": "次",
      "week.min": "min",
      "week.km_h": "km/h",

      // Index - Training Tab
      "training.monthly": "月度训练汇总",
      "training.months": "个月",
      "training.recent": "最近跑步",
      "training.recent_note": "最新记录",
      "training.hard": "关键强课",
      "training.hard_note": "按训练负荷排序",
      "training.load_label": "负荷",
      "training.tl_label": "TL",
      "training.unnamed": "未命名",

      // Monthly table columns
      "month.col_activity": "活动",
      "month.col_distance": "距离 km",
      "month.col_duration": "时长 min",
      "month.col_load": "负荷",
      "month.col_hr": "均心",
      "month.col_pace": "均速",
      "month.col_elevation": "爬升 m",
      "month.col_calories": "卡路里",
      "month.col_cadence": "均步频",
      "month.col_power": "均功率",
      "month.col_notes": "备注",
      "month.detail_pending": "次跑步，详情待加载",

      // Modal
      "modal.title": "活动详情",
      "modal.distance": "距离 km",
      "modal.duration": "时长 min",
      "modal.heart_rate": "心率 bpm",
      "modal.pace": "配速 /km",
      "modal.load": "训练负荷",
      "modal.vo2max": "VO2max",
      "modal.route_map": "路线地图",
      "modal.hr_zones": "心率区间",
      "modal.run_dynamics": "跑步动态",
      "modal.cadence": "步频 spm",
      "modal.stride": "步幅 cm",
      "modal.gct": "触地 ms",
      "modal.balance": "左右平衡 %",
      "modal.vert_osc": "垂直振幅 cm",
      "modal.vert_ratio": "垂直比率 %",
      "modal.training_effect": "训练效果",
      "modal.aerobic_te": "有氧 TE",
      "modal.anaerobic_te": "无氧 TE",
      "modal.recovery_time": "恢复时间 h",
      "modal.weather": "天气",
      "modal.pace_hr_chart": "配速 · 心率",
      "modal.ai_analysis": "AI 分析",
      "modal.no_segment_data": "暂无分段数据",

      // HR zones
      "hr.zone_recovery": "恢复",
      "hr.zone_aerobic": "有氧",
      "hr.zone_tempo": "节奏",
      "hr.zone_threshold": "阈值",
      "hr.zone_anaerobic": "无氧",
      "hr.min": "min",

      // Vo2max levels
      "vo2.beginner": "入门",
      "vo2.fair": "一般",
      "vo2.good": "良好",
      "vo2.excellent": "优秀",
      "vo2.elite": "精英",
      "vo2.level": "水平",

      // Motivations
      "motto.1": "每一步都算数。",
      "motto.2": "今天不想跑，所以才去跑。",
      "motto.3": "没有白跑的步，每一步都作数。",
      "motto.4": "跑步教会我的是：再坚持一下。",
      "motto.5": "慢就是快，少就是多。",
      "motto.6": "今天的汗水是明天的勋章。",
      "motto.7": "跑起来，风会拥抱你。",
      "motto.8": "不用跑赢别人，跑赢昨天的自己。",

      // Health page
      "health.title": "健康报告",
      "health.subtitle": "HRV · RHR · 睡眠 · CTL · VO2max · Garmin",
      "health.loading": "正在加载健康数据",
      "health.hrv": "HRV (rMSSD)",
      "health.rhr": "静息心率",
      "health.sleep_score": "睡眠评分",
      "health.sleep_hours": "睡眠时长",
      "health.ctl": "CTL (体能)",
      "health.tsb": "TSB (状态)",
      "health.atl": "ATL (疲劳)",
      "health.weight": "体重",
      "health.body_fat": "体脂率",
      "health.body_battery": "身体电量",
      "health.vo2max_run": "VO2max 跑步",
      "health.vo2max_cycle": "VO2max 骑行",
      "health.need_garmin": "需 Garmin",
      "health.pending_sync": "待同步",
      "health.recovery_good": "恢复良好",
      "health.fatigue_normal": "正常疲劳",
      "health.fatigue_moderate": "中度疲劳",
      "health.fatigue_deep": "深度疲劳",
      "health.recovered": "恢复",
      "health.fatigued": "疲劳",
      "health.excellent": "优秀",
      "health.good": "良好",
      "health.lower_better": "越低越好",
      "health.weekly_avg": "每晚",
      "health.long_term": "长期训练负荷",
      "health.short_term": "短期训练负荷",
      "health.latest": "最新记录",
      "health.trend_up": "↑ 变好",
      "health.trend_down": "↓ 注意",
      "health.trend_rhr_up": "↑ 注意",
      "health.trend_rhr_down": "↓ 变好",
      "health.ml_kg_min": "ml/kg/min",
      "health.no_sync_msg": "健康数据待同步 — 请确保 Garmin 已连接 Intervals.icu",
      "health.load_failed": "加载失败",
      "health.data_loaded": "数据已加载",
      "health.chart_loading": "图表加载中...",
      "health.chart_ctl": "CTL · ATL · TSB",
      "health.chart_hrv": "HRV 趋势 (rMSSD)",
      "health.chart_rhr": "静息心率",
      "health.chart_sleep": "睡眠评分 & 时长",
      "health.chart_weight": "体重 & 体脂",
      "health.chart_monthly": "月度跑量 & 训练负荷",
      "health.chart_pace": "跑量",
      "health.chart_load": "负荷",
      "health.chart_score": "评分",
      "health.chart_hours": "时长 (h)",
      "health.chart_weight_kg": "体重 kg",
      "health.chart_body_fat": "体脂 %",

      // Training plan page
      "plan.title": "AI 训练计划",
      "plan.subtitle": "每日训练建议 · 比赛策略",
      "plan.loading": "正在加载训练计划",
      "plan.backend_offline": "训练计划功能需要后端支持。",
      "plan.check_api": "请确认 /api/training_plan 端点已配置。",
      "plan.no_race": "暂无比赛信息",
      "plan.configure_race": "配置比赛日期后可显示倒计时",
      "plan.race_countdown": "比赛倒计时",
      "plan.health_snapshot": "健康快照",
      "plan.today_training": "今日训练方案",
      "plan.ai_generated": "AI 生成",
      "plan.week_plan": "7天训练计划",
      "plan.preview": "预览",
      "plan.race_strategy": "比赛策略",
      "plan.no_strategy": "暂无比赛策略数据",
      "plan.no_plan": "暂无训练计划",
      "plan.rest": "休息",
      "plan.days": ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
    },

    en: {
      // Nav
      "nav.home": "Home",
      "nav.health": "Health",
      "nav.training": "AI Training",
      "nav.lang": "中",

      // Index - Status bar
      "status.loading": "Loading latest data",
      "status.loading_data": "Connecting to data sources...",
      "status.manual_refresh": "Refreshing...",
      "status.updating": "Updating data...",
      "status.update_failed": "Update failed",
      "status.cached": "Cached data, auto-refreshing",
      "status.live": "Live data fetched",
      "status.updated_at": "Updated at",

      // Index - Tabs
      "tab.overview": "Overview",
      "tab.health_snapshot": "Health",
      "tab.training_detail": "Training",

      // Index - Race Card
      "race.next_race": "Next Race",
      "race.pending": "TBD",
      "race.configure": "Configure race info for countdown",
      "race.days": "days",

      // Index - Recovery
      "recovery.index": "Recovery Index",

      // Index - Status Cards
      "card.total_distance": "3-Year Distance",
      "card.total_runs": "Total Runs",
      "card.weekly_avg": "Weekly Avg",
      "card.training_load": "Training Load",
      "card.avg_hr": "Avg HR",
      "card.avg_pace": "Avg Pace",
      "card.total_hours": "Total Hours",
      "card.peak_month": "Peak Month",
      "card.km_week": "km / week",
      "card.three_year": "3-year total",
      "card.three_year_tl": "3-year TL",
      "card.all_avg": "all activities avg",
      "card.since": "since",

      // Index - Training Today
      "training.today": "Today's Training",
      "training.loading": "Loading...",

      // Index - Insight
      "insight.title": "Insight",
      "insight.auto": "Auto analysis",
      "insight.no_data": "Not enough running data to generate insights.",

      // Index - Week
      "week.title": "This Week",
      "week.motto": "Motto · Activity Cards",
      "week.distance": "Week Distance",
      "week.time": "Week Time",
      "week.load": "Week Load",
      "week.speed": "Avg Speed",
      "week.no_runs": "No runs this week",
      "week.runs": "runs",
      "week.min": "min",
      "week.km_h": "km/h",

      // Index - Training Tab
      "training.monthly": "Monthly Summary",
      "training.months": "months",
      "training.recent": "Recent Runs",
      "training.recent_note": "Latest records",
      "training.hard": "Key Workouts",
      "training.hard_note": "Sorted by training load",
      "training.load_label": "Load",
      "training.tl_label": "TL",
      "training.unnamed": "Unnamed",

      // Monthly table columns
      "month.col_activity": "Activity",
      "month.col_distance": "Distance km",
      "month.col_duration": "Duration min",
      "month.col_load": "Load",
      "month.col_hr": "Avg HR",
      "month.col_pace": "Avg Pace",
      "month.col_elevation": "Elevation m",
      "month.col_calories": "Calories",
      "month.col_cadence": "Avg Cad",
      "month.col_power": "Avg Power",
      "month.col_notes": "Notes",
      "month.detail_pending": "runs, details pending",

      // Modal
      "modal.title": "Activity Detail",
      "modal.distance": "Distance km",
      "modal.duration": "Duration min",
      "modal.heart_rate": "Heart Rate bpm",
      "modal.pace": "Pace /km",
      "modal.load": "Training Load",
      "modal.vo2max": "VO2max",
      "modal.route_map": "Route Map",
      "modal.hr_zones": "Heart Rate Zones",
      "modal.run_dynamics": "Running Dynamics",
      "modal.cadence": "Cadence spm",
      "modal.stride": "Stride Length cm",
      "modal.gct": "Ground Contact ms",
      "modal.balance": "L/R Balance %",
      "modal.vert_osc": "Vert. Oscillation cm",
      "modal.vert_ratio": "Vert. Ratio %",
      "modal.training_effect": "Training Effect",
      "modal.aerobic_te": "Aerobic TE",
      "modal.anaerobic_te": "Anaerobic TE",
      "modal.recovery_time": "Recovery Time h",
      "modal.weather": "Weather",
      "modal.pace_hr_chart": "Pace · Heart Rate",
      "modal.ai_analysis": "AI Analysis",
      "modal.no_segment_data": "No segment data available",

      // HR zones
      "hr.zone_recovery": "Recovery",
      "hr.zone_aerobic": "Aerobic",
      "hr.zone_tempo": "Tempo",
      "hr.zone_threshold": "Threshold",
      "hr.zone_anaerobic": "Anaerobic",
      "hr.min": "min",

      // Vo2max levels
      "vo2.beginner": "Beginner",
      "vo2.fair": "Fair",
      "vo2.good": "Good",
      "vo2.excellent": "Excellent",
      "vo2.elite": "Elite",
      "vo2.level": "Level",

      // Motivations
      "motto.1": "Every step counts.",
      "motto.2": "The only bad run is the one that didn't happen.",
      "motto.3": "No run is wasted, every step matters.",
      "motto.4": "What running taught me: just hold on a little longer.",
      "motto.5": "Slow is smooth, smooth is fast.",
      "motto.6": "Today's sweat is tomorrow's medal.",
      "motto.7": "Run, and the wind will embrace you.",
      "motto.8": "Don't race others, race yesterday's you.",

      // Health page
      "health.title": "Health Report",
      "health.subtitle": "HRV · RHR · Sleep · CTL · VO2max · Garmin",
      "health.loading": "Loading health data",
      "health.hrv": "HRV (rMSSD)",
      "health.rhr": "Resting HR",
      "health.sleep_score": "Sleep Score",
      "health.sleep_hours": "Sleep Duration",
      "health.ctl": "CTL (Fitness)",
      "health.tsb": "TSB (Form)",
      "health.atl": "ATL (Fatigue)",
      "health.weight": "Weight",
      "health.body_fat": "Body Fat",
      "health.body_battery": "Body Battery",
      "health.vo2max_run": "VO2max Run",
      "health.vo2max_cycle": "VO2max Cycle",
      "health.need_garmin": "Need Garmin",
      "health.pending_sync": "Pending Sync",
      "health.recovery_good": "Well Recovered",
      "health.fatigue_normal": "Normal Fatigue",
      "health.fatigue_moderate": "Moderate Fatigue",
      "health.fatigue_deep": "Deep Fatigue",
      "health.recovered": "Recovered",
      "health.fatigued": "Fatigued",
      "health.excellent": "Excellent",
      "health.good": "Good",
      "health.lower_better": "Lower is better",
      "health.weekly_avg": "per night",
      "health.long_term": "Long-term load",
      "health.short_term": "Short-term load",
      "health.latest": "Latest record",
      "health.trend_up": "↑ Improving",
      "health.trend_down": "↓ Watch",
      "health.trend_rhr_up": "↑ Watch",
      "health.trend_rhr_down": "↓ Improving",
      "health.ml_kg_min": "ml/kg/min",
      "health.no_sync_msg": "Health data pending — Connect Garmin to Intervals.icu",
      "health.load_failed": "Load failed",
      "health.data_loaded": "Data loaded",
      "health.chart_loading": "Loading charts...",
      "health.chart_ctl": "CTL · ATL · TSB",
      "health.chart_hrv": "HRV Trend (rMSSD)",
      "health.chart_rhr": "Resting Heart Rate",
      "health.chart_sleep": "Sleep Score & Duration",
      "health.chart_weight": "Weight & Body Fat",
      "health.chart_monthly": "Monthly Distance & Load",
      "health.chart_pace": "Distance",
      "health.chart_load": "Load",
      "health.chart_score": "Score",
      "health.chart_hours": "Duration (h)",
      "health.chart_weight_kg": "Weight kg",
      "health.chart_body_fat": "Body Fat %",

      // Training plan page
      "plan.title": "AI Training Plan",
      "plan.subtitle": "Daily Suggestions · Race Strategy",
      "plan.loading": "Loading training plan",
      "plan.backend_offline": "Training plan requires backend support.",
      "plan.check_api": "Please ensure /api/training_plan endpoint is configured.",
      "plan.no_race": "No race info",
      "plan.configure_race": "Configure race date for countdown",
      "plan.race_countdown": "Race Countdown",
      "plan.health_snapshot": "Health Snapshot",
      "plan.today_training": "Today's Training",
      "plan.ai_generated": "AI Generated",
      "plan.week_plan": "7-Day Plan",
      "plan.preview": "Preview",
      "plan.race_strategy": "Race Strategy",
      "plan.no_strategy": "No race strategy data",
      "plan.no_plan": "No training plan yet",
      "plan.rest": "Rest",
      "plan.days": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    }
  };

  // Current language
  var lang = localStorage.getItem("sport-lang") || "zh";

  // Translation function
  window.t = function(key, params) {
    var s = translations[lang] && translations[lang][key] || translations.zh[key] || key;
    if (params) {
      Object.keys(params).forEach(function(k) {
        s = s.replace("{" + k + "}", params[k]);
      });
    }
    return s;
  };

  // Language getter
  window.lang = function() { return lang; };

  // Toggle language
  window.toggleLang = function() {
    lang = lang === "zh" ? "en" : "zh";
    localStorage.setItem("sport-lang", lang);
    location.reload();
  };

  // Update all data-i18n elements
  window.applyI18n = function() {
    document.querySelectorAll("[data-i18n]").forEach(function(el) {
      var key = el.getAttribute("data-i18n");
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.placeholder = t(key);
      } else {
        el.textContent = t(key);
      }
    });
    // Also update data-i18n-html elements (innerHTML)
    document.querySelectorAll("[data-i18n-html]").forEach(function(el) {
      el.innerHTML = t(el.getAttribute("data-i18n-html"));
    });
    // Update lang toggle text
    var toggleBtn = document.getElementById("lang-toggle");
    if (toggleBtn) toggleBtn.textContent = t("nav.lang");
  };

  // Apply on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", window.applyI18n);
  } else {
    window.applyI18n();
  }

  // Expose translations for JS use
  window.motivations = function() {
    var list = [];
    for (var i = 1; i <= 8; i++) list.push(t("motto." + i));
    return list;
  };
})();
