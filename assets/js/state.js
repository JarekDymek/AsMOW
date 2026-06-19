/* Application logic; data constants are loaded from assets/js/data.js */
/* ────────────────────────────────
   STATE
──────────────────────────────── */
let chatHistory = [];
let harmContent = null;
let harmFileName = null;
let speechRecognition = null;
let isListening = false;
let aiAttachments = [];
let harmAttachment = null;
let lastFailedChat = null;
let imageZoom = 1;
let weeklyPlan = null;
let weeklyPlanMeta = null;
let knowledgeItems = [];
let dayScheduleCollapsed = localStorage.getItem('mow_day_schedule_collapsed_v1') === '1';
const CHAT_DRAFT_KEY = 'mow_chat_draft_v2';
const WEEKLY_SETTINGS_KEY = 'mow_weekly_settings_v1';
const WEEKLY_PLAN_KEY = 'mow_weekly_plan_v1';
const KNOWLEDGE_KEY = 'mow_knowledge_base_v1';
const WEEKLY_SAMPLE_URL = 'https://jarekdymek.github.io/Harmonogram-MOW/data/sample-weeks.json';
