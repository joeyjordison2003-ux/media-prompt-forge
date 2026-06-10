import {
  TASKS,
  MODEL_ROUTES,
  MOTION_PROFILES,
  EXPRESSION_PROFILES,
  PHYSICS_PROFILES,
  MODEL_ADAPTERS,
  MEMORY_STORAGE_KEY,
  MEMORY_CARD_TYPES,
  BUILT_IN_MEMORY_CARDS,
  CASE_CARDS,
  PROMPT_TEMPLATES,
  MODEL_TEST_SCENARIOS,
  EXAMPLES,
  SOURCE_RADAR_CARDS,
  KNOWLEDGE_GAPS,
  NAV_GROUPS,
  ONBOARDING_STORAGE_KEY,
  ONBOARDING_STEPS,
  HISTORY_STORAGE_KEY,
  HISTORY_LIMIT,
  MODEL_LOGIC_NOTES,
  LENS_GUIDE,
  PROMPT_FRAMEWORKS,
  AUDIT_RULES
} from "./data.js";
import { STYLE_CATEGORIES, CINEMATIC_STYLES } from "./styles_data.js";

let currentMode = 'image';
let activePanel = 'builder';
let customMemoryCards = [];

const $ = (id) => document.getElementById(id);

function currentTask() {
  return TASKS.find((task) => task.id === $('taskType').value) || TASKS[0];
}

function value(id) {
  return ($(id).value || '').trim();
}

function setValue(id, next) {
  if ($(id)) $(id).value = next || '';
}

function populateTasks() {
  const select = $('taskType');
  const available = TASKS.filter((task) => task.modes.includes(currentMode));
  select.innerHTML = available.map((task) => `<option value="${task.id}">${task.label}</option>`).join('');
}

function populateModels() {
  const select = $('targetModel');
  const available = MODEL_ROUTES.filter((model) => model.modes.includes(currentMode));
  select.innerHTML = available.map((model) => `<option value="${model.id}">${model.name}</option>`).join('');
}

function populateProfiles() {
  $('motionProfile').innerHTML = MOTION_PROFILES.map((profile) => `<option value="${profile.id}">${profile.label}</option>`).join('');
  $('expressionProfile').innerHTML = EXPRESSION_PROFILES.map((profile) => `<option value="${profile.id}">${profile.label}</option>`).join('');
  $('physicsProfile').innerHTML = PHYSICS_PROFILES.map((profile) => `<option value="${profile.id}">${profile.label}</option>`).join('');
}

function populateCaseFilters() {
  $('caseTaskFilter').innerHTML = [
    '<option value="all">全部任務</option>',
    ...TASKS.map((task) => `<option value="${task.id}">${task.label}</option>`)
  ].join('');
}

function populateTemplateFilters() {
  $('templateTaskFilter').innerHTML = [
    '<option value="all">全部任務</option>',
    ...TASKS.map((task) => `<option value="${task.id}">${task.label}</option>`)
  ].join('');
}

function populateMemoryControls() {
  const options = MEMORY_CARD_TYPES.map((type) => `<option value="${type.id}">${type.label}</option>`).join('');
  $('memoryTypeFilter').innerHTML = `<option value="all">全部類型</option>${options}`;
  $('memoryCardType').innerHTML = options;
}

function populateTestFilters() {
  $('testTaskFilter').innerHTML = [
    '<option value="all">全部任務</option>',
    ...TASKS.map((task) => `<option value="${task.id}">${task.label}</option>`)
  ].join('');
}

function populateSourceFilters() {
  const areas = [...new Set(SOURCE_RADAR_CARDS.map((card) => card.area))].sort();
  $('sourceAreaFilter').innerHTML = [
    '<option value="all">全部領域</option>',
    ...areas.map((area) => `<option value="${area}">${area}</option>`)
  ].join('');
}

const FIELD_LABELS = {
  subject: '主體 / 角色 / 商品',
  action: '動作 / 表情 / 狀態變化',
  scene: '場景 / 世界觀 / 背景',
  camera: '鏡頭 / 構圖',
  light: '光線 / 色彩',
  style: '風格 / 質感 / 參考',
  details: '關鍵細節',
  constraints: '約束 / 禁止項'
};

function renderOnboarding() {
  const card = $('onboardingCard');
  if (!card) return;
  const dismissed = localStorage.getItem(ONBOARDING_STORAGE_KEY) === '1';
  card.classList.toggle('is-hidden', dismissed);
  if (dismissed) {
    card.innerHTML = '';
    return;
  }
  card.innerHTML = `
    <div class="onboarding-head">
      <strong>快速開始</strong>
      <button class="ghost-button" id="dismissOnboarding" type="button">不再顯示</button>
    </div>
    ${ONBOARDING_STEPS.map((step) => `<p><strong>${escapeHtml(step.title)}</strong> ${escapeHtml(step.text)}</p>`).join('')}
    <div class="actions">
      <button class="ghost-button" id="onboardingTemplates" type="button">打開模板庫</button>
      <button class="ghost-button" id="onboardingExample" type="button">載入範例</button>
    </div>
  `;
}

function populateNav() {
  document.querySelector('.tool-nav').innerHTML = NAV_GROUPS.map((group) => `
    <p class="nav-group-label">${group.label}</p>
    ${group.panels.map((panel) => `<button class="nav-button${panel.id === activePanel ? ' active' : ''}" type="button" data-panel="${panel.id}" role="tab" aria-controls="panel-${panel.id}" aria-selected="${panel.id === activePanel}">${panel.label}</button>`).join('')}
  `).join('');
}

function historyEntries() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
  } catch (error) {
    return [];
  }
}

const HISTORY_FIELD_IDS = ['taskType', 'frameworkSelect', 'ratio', 'duration', 'motionScale', 'motionProfile', 'expressionProfile', 'physicsProfile', 'subject', 'action', 'performanceNotes', 'scene', 'camera', 'light', 'style', 'details', 'constraints'];

function saveHistoryEntry() {
  const prompt = $('promptOutput').textContent.trim();
  if (!prompt) return;
  const entries = historyEntries();
  if (entries[0] && entries[0].prompt === prompt) return;
  const fields = {};
  HISTORY_FIELD_IDS.forEach((id) => { if ($(id)) fields[id] = $(id).value; });
  entries.unshift({
    id: `H${Date.now()}`,
    ts: Date.now(),
    mode: currentMode,
    taskLabel: currentTask().label,
    prompt,
    fields
  });
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries.slice(0, HISTORY_LIMIT)));
  renderHistory();
}

function deleteHistoryEntry(id) {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyEntries().filter((entry) => entry.id !== id)));
  renderHistory();
}

function restoreHistoryEntry(id) {
  const entry = historyEntries().find((item) => item.id === id);
  if (!entry) return;
  updateMode(entry.mode);
  Object.entries(entry.fields).forEach(([fieldId, fieldValue]) => setValue(fieldId, fieldValue));
  populateFrameworkSelect();
  if (entry.fields.frameworkSelect) setValue('frameworkSelect', entry.fields.frameworkSelect);
  updatePanel('builder');
  buildAll();
}

function renderHistory() {
  const summary = $('historySummary');
  if (!summary) return;
  const query = value('historySearch').toLowerCase();
  const entries = historyEntries().filter((entry) => !query || `${entry.prompt} ${entry.taskLabel}`.toLowerCase().includes(query));
  summary.innerHTML = `
    <h4>歷史 ${entries.length}/${historyEntries().length}</h4>
    <p>每次點「生成提示詞」自動保存（只存在本機瀏覽器，上限 ${HISTORY_LIMIT} 條）。</p>
  `;
  $('historyOutput').innerHTML = entries.length ? entries.map((entry) => `
    <article class="history-card">
      <div class="card-topline">
        <span class="case-pill">${new Date(entry.ts).toLocaleString()}</span>
        <span class="case-pill">${entry.mode === 'image' ? '生圖' : '生視頻'}</span>
        <span class="case-pill">${escapeHtml(entry.taskLabel)}</span>
      </div>
      <p>${escapeHtml(entry.prompt.slice(0, 160))}${entry.prompt.length > 160 ? '…' : ''}</p>
      <div class="actions">
        <button class="ghost-button copy-history" type="button" data-history-id="${entry.id}">複製</button>
        <button class="ghost-button restore-history" type="button" data-history-id="${entry.id}">恢復</button>
        <button class="ghost-button delete-history" type="button" data-history-id="${entry.id}">刪除</button>
      </div>
    </article>
  `).join('') : '<p>還沒有歷史記錄。去生成器點「生成提示詞」。</p>';
}

function populateStyleFilters() {
  $('styleCategoryFilter').innerHTML = [
    '<option value="all">全部類別</option>',
    ...STYLE_CATEGORIES.map((cat) => `<option value="${cat.id}">${cat.label}</option>`)
  ].join('');
}

function styleCategory(id) {
  return STYLE_CATEGORIES.find((cat) => cat.id === id) || null;
}

function filteredStyles() {
  const query = value('styleSearch').toLowerCase();
  const category = value('styleCategoryFilter') || 'all';
  return CINEMATIC_STYLES.filter((item) => {
    const queryOk = !query || item.text.toLowerCase().includes(query);
    const categoryOk = category === 'all' || item.category === category;
    return queryOk && categoryOk;
  });
}

function renderStyles() {
  const summary = $('styleSummary');
  if (!summary) return;
  const items = filteredStyles();
  const counts = STYLE_CATEGORIES.map((cat) => `${cat.label} ${CINEMATIC_STYLES.filter((item) => item.category === cat.id).length}`).join(' · ');
  summary.innerHTML = `
    <h4>風格庫 ${items.length}/${CINEMATIC_STYLES.length}</h4>
    <p>${escapeHtml(counts)}。點「插入」寫入對應欄位（燈光→光線、攝影→鏡頭、其餘→風格）。</p>
  `;
  $('styleOutput').innerHTML = items.length ? items.map((item) => {
    const cat = styleCategory(item.category);
    return `
      <div class="style-row">
        <span class="case-pill">${escapeHtml(cat ? cat.label : item.category)}</span>
        <span class="style-text">${escapeHtml(item.text)}</span>
        <span class="style-actions">
          <button class="ghost-button copy-style" type="button" data-text="${escapeHtml(item.text)}">複製</button>
          <button class="ghost-button insert-style" type="button" data-text="${escapeHtml(item.text)}" data-target="${cat ? cat.targetField : 'style'}">插入</button>
        </span>
      </div>
    `;
  }).join('') : '<p>沒有匹配的風格。</p>';
}

function populateFrameworkSelect() {
  const select = $('frameworkSelect');
  const previous = select.value;
  const available = PROMPT_FRAMEWORKS.filter((framework) => framework.forModes.includes(currentMode));
  select.innerHTML = [
    '<option value="none">不使用框架</option>',
    ...available.map((framework) => `<option value="${framework.id}">${framework.name} · ${framework.domain}</option>`)
  ].join('');
  select.value = available.some((framework) => framework.id === previous) ? previous : 'none';
}

function selectedFramework() {
  const select = $('frameworkSelect');
  if (!select) return null;
  return PROMPT_FRAMEWORKS.find((framework) => framework.id === select.value) || null;
}

function renderFrameworkHints() {
  const container = $('frameworkHints');
  const framework = selectedFramework();
  container.classList.toggle('is-hidden', !framework);
  if (!framework) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = framework.cheatSheet.map((group) => `
    <div class="cheat-group">
      <p class="cheat-head">${escapeHtml(group.group)} <span>→ ${escapeHtml(FIELD_LABELS[group.targetField] || group.targetField)}</span></p>
      <div class="chip-row">
        ${group.words.map((word) => `<button class="chip framework-chip" type="button" data-target="${group.targetField}" data-word="${escapeHtml(word.en)}" title="${escapeHtml(word.zh)}">${escapeHtml(word.en)}</button>`).join('')}
      </div>
    </div>
  `).join('');
}

function appendToField(fieldId, text) {
  const existing = value(fieldId);
  setValue(fieldId, existing ? `${existing.replace(/[,，]\s*$/, '')}, ${text}` : text);
}

function updateMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.seg-button').forEach((button) => {
    const isActive = button.dataset.mode === mode;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  document.querySelectorAll('.video-only').forEach((node) => {
    node.classList.toggle('is-hidden', mode !== 'video');
  });
  populateTasks();
  populateModels();
  populateFrameworkSelect();
  buildAll();
}

function updatePanel(panel) {
  activePanel = panel;
  document.querySelectorAll('.nav-button').forEach((button) => {
    const isActive = button.dataset.panel === panel;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', String(isActive));
  });
  document.querySelectorAll('.tab-panel').forEach((node) => {
    const isActive = node.id === `panel-${panel}`;
    node.classList.toggle('active', isActive);
    node.setAttribute('aria-hidden', String(!isActive));
  });
  if (panel === 'routes') renderRoutes();
  if (panel === 'adapters') renderAdapters();
  if (panel === 'templates') renderTemplates();
  if (panel === 'memory') renderMemoryCards();
  if (panel === 'tests') renderTestMatrix();
  if (panel === 'sources') renderSources();
  if (panel === 'frameworks') renderFrameworks();
  if (panel === 'styles') renderStyles();
  if (panel === 'history') renderHistory();
  if (panel === 'cases') renderCases();
  if (panel === 'export') renderExport();
  if (panel === 'qa') renderQa();
}

function section(label, text) {
  return text ? `${label}: ${text}` : '';
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function selectedProfile(collection, id) {
  return collection.find((profile) => profile.id === value(id)) || collection[0];
}

function performanceSections() {
  const motion = selectedProfile(MOTION_PROFILES, 'motionProfile');
  const expression = selectedProfile(EXPRESSION_PROFILES, 'expressionProfile');
  const physics = selectedProfile(PHYSICS_PROFILES, 'physicsProfile');
  const notes = value('performanceNotes');

  return {
    motion: motion.text,
    expression: expression.text,
    physics: physics.text,
    notes
  };
}

function buildImagePrompt(task) {
  const performance = performanceSections();
  const lines = [
    `Use case: ${task.label} for ${value('targetModel') || 'selected image model'}.`,
    section('Scene', value('scene')),
    section('Subject', value('subject')),
    section('Action / expression', value('action')),
    section('Performance / expression', [performance.motion, performance.expression, performance.notes].filter(Boolean).join(' ')),
    section('Camera / composition', value('camera')),
    section('Lighting / color', value('light')),
    section('Physical realism', performance.physics),
    section('Style / medium', value('style')),
    section('Important details', value('details')),
    `Output: single ${value('ratio')} image, clean composition, production-ready visual.`,
    section('Constraints', value('constraints'))
  ].filter(Boolean);

  return lines.join('\n');
}

function motionInstruction() {
  const map = {
    micro: 'micro movement only: eye shift, tiny breath, subtle lip or finger motion',
    small: 'small controlled movement: one clear action, no scene jump',
    medium: 'medium movement: readable body or camera change, preserve identity and location',
    large: 'large movement: only use if the scene can remain coherent across the full duration'
  };
  return map[value('motionScale')] || map.small;
}

function buildVideoPrompt(task) {
  const performance = performanceSections();
  const lines = [
    `Video use case: ${task.label}.`,
    `Duration: ${value('duration')}; aspect ratio: ${value('ratio')}; motion scale: ${motionInstruction()}.`,
    section('Subject lock', value('subject')),
    section('Action timeline', value('action')),
    section('Body performance system', [performance.motion, performance.notes].filter(Boolean).join(' ')),
    section('Facial / lipsync performance', performance.expression),
    section('Scene continuity', value('scene')),
    section('Camera movement', value('camera')),
    section('Lighting / color', value('light')),
    section('Physics and secondary motion', performance.physics),
    section('Style', value('style')),
    section('Critical details', value('details')),
    'Temporal rule: keep one continuous shot unless explicitly requested; preserve face, wardrobe, props, lighting direction, and spatial layout across all frames.',
    section('Avoid', value('constraints'))
  ].filter(Boolean);

  return lines.join('\n');
}

function buildPromptText() {
  const task = currentTask();
  const base = currentMode === 'image' ? buildImagePrompt(task) : buildVideoPrompt(task);
  const framework = selectedFramework();
  return framework ? `${base}\nFramework guidance (${framework.name}): ${framework.styleLine}` : base;
}

function scoreModel(model, task) {
  let score = 50;
  if (model.modes.includes(currentMode)) score += 20;
  if (model.best.includes(task.id)) score += 25;
  task.tags.forEach((tag) => {
    if (model.strengths.join(' ').toLowerCase().includes(tag)) score += 5;
  });
  if (model.weak.includes('needs-test')) score -= 20;
  return score;
}

function rankedModels() {
  const task = currentTask();
  return MODEL_ROUTES
    .filter((model) => model.modes.includes(currentMode))
    .map((model) => ({ ...model, score: scoreModel(model, task) }))
    .sort((a, b) => b.score - a.score);
}

function renderRoutes() {
  const models = rankedModels();
  $('routeOutput').innerHTML = models.map((model, index) => `
    <article class="route-card">
      <h4>${index + 1}. ${model.name} <span class="score">score ${model.score}</span></h4>
      <p><strong>適合：</strong>${model.strengths.join(' / ')}</p>
      <p><strong>注意：</strong>${model.weak}</p>
    </article>
  `).join('');
}

function adapterFacts() {
  const performance = performanceSections();
  return {
    task: currentTask().label,
    ratio: value('ratio'),
    duration: value('duration'),
    motionScale: currentMode === 'video' ? motionInstruction() : '',
    subject: value('subject'),
    action: value('action'),
    scene: value('scene'),
    camera: value('camera'),
    light: value('light'),
    style: value('style'),
    details: value('details'),
    constraints: value('constraints'),
    motion: performance.motion,
    expression: performance.expression,
    physics: performance.physics,
    notes: performance.notes
  };
}

function nonEmptyLines(lines) {
  return lines.filter(Boolean);
}

function imageAdapterPrompt(model, facts) {
  const performance = [facts.motion, facts.expression, facts.notes].filter(Boolean).join(' ');
  const physical = facts.physics;

  if (model.id === 'nova') {
    return nonEmptyLines([
      `Nova commercial visual prompt (${facts.ratio})`,
      section('Subject / product fidelity', facts.subject),
      section('Scene', facts.scene),
      section('Material / details', facts.details),
      section('Camera and lighting', [facts.camera, facts.light].filter(Boolean).join(' ')),
      section('Style', facts.style),
      section('Physical realism', physical),
      section('Avoid', facts.constraints || 'no watermark, no random text, no deformation')
    ]).join('\n');
  }

  if (model.id === 'seedream') {
    return nonEmptyLines([
      `Seedream 中文生圖 prompt，比例 ${facts.ratio}。`,
      section('主體鎖定', facts.subject),
      section('畫面/動作', facts.action),
      section('場景', facts.scene),
      section('構圖與光線', [facts.camera, facts.light].filter(Boolean).join('；')),
      section('表演/細節', [performance, facts.details, physical].filter(Boolean).join('；')),
      section('風格', facts.style),
      section('限制', facts.constraints)
    ]).join('\n');
  }

  if (model.id === 'gemini-image') {
    return nonEmptyLines([
      `Gemini Image layout prompt (${facts.ratio})`,
      section('Visual hierarchy', `primary subject: ${facts.subject}; main action/expression: ${facts.action}`),
      section('Spatial layout', [facts.scene, facts.camera].filter(Boolean).join(' ')),
      section('Lighting/color/materials', [facts.light, facts.details, physical].filter(Boolean).join(' ')),
      section('Performance', performance),
      section('Style', facts.style),
      section('Guardrails', facts.constraints || 'keep composition readable; do not invent text')
    ]).join('\n');
  }

  return nonEmptyLines([
    `GPT Image 2 clean visual prompt (${facts.ratio})`,
    section('Reference / identity lock', facts.subject),
    section('Visual scene', facts.scene),
    section('Action / expression', facts.action),
    section('Performance', performance),
    section('Camera / composition', facts.camera),
    section('Lighting / color', facts.light),
    section('Material / exact details', [facts.details, physical].filter(Boolean).join(' ')),
    section('Style', facts.style),
    section('Negative constraints', facts.constraints || 'no watermark, no extra limbs, no face drift, no random text')
  ]).join('\n');
}

function videoAdapterPrompt(model, facts, task) {
  const performance = [facts.motion, facts.notes].filter(Boolean).join(' ');
  const face = facts.expression;
  const physical = facts.physics;
  const continuity = 'one continuous shot, stable identity, stable wardrobe, stable props, stable spatial layout, no scene jump, no random cuts';

  if (model.id === 'veo') {
    return nonEmptyLines([
      `Veo cinematic prompt. Duration: ${facts.duration}; aspect ratio: ${facts.ratio}.`,
      section('Subject', facts.subject),
      section('One core action', facts.action),
      section('Performance', [performance, face].filter(Boolean).join(' ')),
      section('Setting', facts.scene),
      section('Camera', facts.camera),
      section('Lighting and style', [facts.light, facts.style].filter(Boolean).join(' ')),
      section('Physical realism', physical),
      section('Continuity', continuity),
      section('Avoid', facts.constraints)
    ]).join('\n');
  }

  if (model.id === 'grok-video') {
    const lipsyncNote = task.id === 'lipsync'
      ? 'Lipsync risk: do not assume audio-mouth coupling. Use visible speech acting: short phrase, restrained lip opening, jaw timing, breath prep, no exaggerated mouth shapes.'
      : 'Model risk: keep action simple and inspect the result before using as production output.';
    return nonEmptyLines([
      `Grok Video experimental prompt. ${lipsyncNote}`,
      section('Subject', facts.subject),
      section('Visible action timeline', facts.action),
      section('Facial / mouth acting', face || 'natural restrained expression; eyes react before mouth movement if speaking'),
      section('Body performance', performance),
      section('Scene / camera', [facts.scene, facts.camera].filter(Boolean).join(' ')),
      section('Physics', physical),
      section('Guardrails', [continuity, facts.constraints].filter(Boolean).join('; '))
    ]).join('\n');
  }

  if (model.id === 'kling') {
    return nonEmptyLines([
      `Kling video prompt. ${facts.duration}, ${facts.ratio}.`,
      section('Subject lock', facts.subject),
      section('Action path', facts.action),
      section('Camera path', facts.camera),
      section('Body / face performance', [performance, face].filter(Boolean).join(' ')),
      section('Scene and light', [facts.scene, facts.light].filter(Boolean).join(' ')),
      section('Physics constraints', physical),
      section('Avoid', [continuity, facts.constraints].filter(Boolean).join('; '))
    ]).join('\n');
  }

  return nonEmptyLines([
    `Seedance prompt. Duration: ${facts.duration}; aspect ratio: ${facts.ratio}; motion scale: ${facts.motionScale}.`,
    section('Subject lock', facts.subject),
    section('Timeline', facts.action),
    section('Body performance', performance),
    section('Facial / lipsync', face),
    section('Scene continuity', facts.scene),
    section('Camera', facts.camera),
    section('Lighting / style', [facts.light, facts.style].filter(Boolean).join(' ')),
    section('Physics and secondary motion', physical),
    section('Guardrails', [continuity, facts.constraints].filter(Boolean).join('; '))
  ]).join('\n');
}

function adapterPrompt(model, task) {
  const facts = adapterFacts();
  return currentMode === 'image'
    ? imageAdapterPrompt(model, facts)
    : videoAdapterPrompt(model, facts, task);
}

function renderAdapters() {
  const task = currentTask();
  const models = rankedModels();
  $('adapterOutput').innerHTML = models.map((model) => {
    const adapter = MODEL_ADAPTERS[model.id] || {};
    const prompt = adapterPrompt(model, task);
    const risk = adapter.risk ? `<p><strong>風險：</strong>${escapeHtml(adapter.risk)}</p>` : '';

    return `
      <article class="adapter-card">
        <h4>${escapeHtml(model.name)} <span class="score">score ${model.score}</span></h4>
        <p><strong>適合：</strong>${escapeHtml(adapter.bestUse || model.strengths.join(' / '))}</p>
        <p><strong>寫法：</strong>${escapeHtml(adapter.promptStyle || 'Use the canonical prompt with model-specific guardrails.')}</p>
        <p><strong>護欄：</strong>${escapeHtml(adapter.guardrails || model.weak)}</p>
        ${risk}
        <pre>${escapeHtml(prompt)}</pre>
      </article>
    `;
  }).join('');
}

function templateSearchText(template) {
  return [
    template.id,
    template.title,
    template.mode,
    template.task,
    template.bestModels.join(' '),
    template.useCase,
    template.qaFocus.join(' '),
    template.seoIntent
  ].join(' ').toLowerCase();
}

function filteredTemplates() {
  const query = value('templateSearch').toLowerCase();
  const modeFilter = value('templateModeFilter') || 'all';
  const taskFilter = value('templateTaskFilter') || 'all';

  return PROMPT_TEMPLATES.filter((template) => {
    const queryOk = !query || templateSearchText(template).includes(query);
    const modeOk = modeFilter === 'all' || template.mode === modeFilter;
    const taskOk = taskFilter === 'all' || template.task === taskFilter;
    return queryOk && modeOk && taskOk;
  });
}

function renderTemplates() {
  const templates = filteredTemplates();
  $('templateOutput').innerHTML = templates.length ? templates.map((template) => `
    <article class="template-card">
      <h4>${escapeHtml(template.id)} · ${escapeHtml(template.title)} <span class="score">${escapeHtml(template.mode)}</span></h4>
      <div class="case-meta">
        <span class="case-pill">${escapeHtml(template.task)}</span>
        ${template.bestModels.map((model) => `<span class="case-pill">${escapeHtml(model)}</span>`).join('')}
        ${template.qaFocus.slice(0, 4).map((focus) => `<span class="case-pill">${escapeHtml(focus)}</span>`).join('')}
      </div>
      <p><strong>用途：</strong>${escapeHtml(template.useCase)}</p>
      <p><strong>SEO：</strong>${escapeHtml(template.seoIntent)}</p>
      <button class="secondary-button apply-template" type="button" data-template-id="${escapeHtml(template.id)}">套用模板</button>
    </article>
  `).join('') : '<article class="template-card"><h4>沒有匹配模板</h4><p>調整搜索詞、模式或任務篩選。</p></article>';
}

function applyTemplate(templateId) {
  const template = PROMPT_TEMPLATES.find((item) => item.id === templateId);
  if (!template) return;

  if (currentMode !== template.mode) {
    updateMode(template.mode);
  }

  populateTasks();
  populateModels();
  setValue('taskType', template.task);

  ['subject', 'action', 'scene', 'camera', 'light', 'style', 'details', 'constraints', 'performanceNotes'].forEach((id) => setValue(id, ''));
  ['motionProfile', 'expressionProfile', 'physicsProfile'].forEach((id) => setValue(id, 'none'));
  Object.entries(template.defaults).forEach(([key, next]) => setValue(key, next));
  buildAll();
  updatePanel('builder');
}

function loadMemoryCards() {
  try {
    const parsed = JSON.parse(localStorage.getItem(MEMORY_STORAGE_KEY) || '[]');
    customMemoryCards = Array.isArray(parsed) ? parsed.filter((card) => card && card.id && card.type && card.title) : [];
  } catch (error) {
    customMemoryCards = [];
  }
}

function saveMemoryCards() {
  localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(customMemoryCards));
}

function allMemoryCards() {
  return [...BUILT_IN_MEMORY_CARDS, ...customMemoryCards];
}

function memorySearchText(card) {
  return [
    card.id,
    card.type,
    card.title,
    card.content,
    (card.tags || []).join(' ')
  ].join(' ').toLowerCase();
}

function filteredMemoryCards() {
  const query = value('memorySearch').toLowerCase();
  const typeFilter = value('memoryTypeFilter') || 'all';

  return allMemoryCards().filter((card) => {
    const queryOk = !query || memorySearchText(card).includes(query);
    const typeOk = typeFilter === 'all' || card.type === typeFilter;
    return queryOk && typeOk;
  });
}

function resetMemoryEditor() {
  setValue('memoryCardType', 'character');
  setValue('memoryTitle', '');
  setValue('memoryContent', '');
  setValue('memoryTags', '');
}

function saveMemoryCard() {
  const title = value('memoryTitle');
  const content = value('memoryContent');
  if (!title || !content) return;

  const card = {
    id: `mem_custom_${Date.now()}`,
    type: value('memoryCardType') || 'character',
    title,
    content,
    tags: value('memoryTags').split(',').map((tag) => tag.trim()).filter(Boolean),
    builtIn: false
  };

  customMemoryCards = [card, ...customMemoryCards];
  saveMemoryCards();
  resetMemoryEditor();
  renderMemoryCards();
}

function appendValue(id, next) {
  const existing = value(id);
  setValue(id, existing ? `${existing}\n${next}` : next);
}

function applyMemoryCard(cardId) {
  const card = allMemoryCards().find((item) => item.id === cardId);
  if (!card) return;

  const text = `${card.title}: ${card.content}`;
  if (card.type === 'character') appendValue('subject', text);
  if (card.type === 'scene') appendValue('scene', text);
  if (card.type === 'product') {
    appendValue('subject', text);
    appendValue('details', text);
  }
  if (card.type === 'wardrobe') appendValue('details', text);
  if (card.type === 'style') appendValue('style', text);

  buildAll();
  updatePanel('builder');
}

function deleteMemoryCard(cardId) {
  customMemoryCards = customMemoryCards.filter((card) => card.id !== cardId);
  saveMemoryCards();
  renderMemoryCards();
}

function renderMemoryCards() {
  const cards = filteredMemoryCards();
  $('memoryOutput').innerHTML = cards.length ? cards.map((card) => {
    const deleteButton = card.builtIn ? '' : `<button class="secondary-button delete-memory" type="button" data-memory-id="${escapeHtml(card.id)}">刪除</button>`;
    return `
      <article class="memory-card">
        <h4>${escapeHtml(card.title)} <span class="score">${escapeHtml(card.type)}${card.builtIn ? ' · built-in' : ''}</span></h4>
        <div class="case-meta">
          ${(card.tags || []).map((tag) => `<span class="case-pill">${escapeHtml(tag)}</span>`).join('')}
        </div>
        <p>${escapeHtml(card.content)}</p>
        <div class="actions">
          <button class="primary-button apply-memory" type="button" data-memory-id="${escapeHtml(card.id)}">套用到表單</button>
          ${deleteButton}
        </div>
      </article>
    `;
  }).join('') : '<article class="memory-card"><h4>沒有匹配記憶卡</h4><p>調整搜索詞或類型篩選，或新增一張自定義卡。</p></article>';
}

function testSearchText(scenario) {
  return [
    scenario.id,
    scenario.title,
    scenario.mode,
    scenario.task,
    scenario.model,
    scenario.risk,
    scenario.purpose,
    scenario.evidence,
    scenario.dimensions.map((item) => item.join(' ')).join(' ')
  ].join(' ').toLowerCase();
}

function filteredTestScenarios() {
  const query = value('testSearch').toLowerCase();
  const taskFilter = value('testTaskFilter') || 'all';
  const riskFilter = value('testRiskFilter') || 'all';

  return MODEL_TEST_SCENARIOS.filter((scenario) => {
    const queryOk = !query || testSearchText(scenario).includes(query);
    const taskOk = taskFilter === 'all' || scenario.task === taskFilter;
    const riskOk = riskFilter === 'all' || scenario.risk === riskFilter;
    return queryOk && taskOk && riskOk;
  });
}

function renderTestSummary() {
  const scenarios = filteredTestScenarios();
  const needsTestCount = scenarios.filter((scenario) => scenario.risk === 'needs-test').length;
  const next = scenarios.find((scenario) => scenario.risk === 'needs-test') || scenarios[0];

  return `
    <h4>測試矩陣 <span class="score">${scenarios.length} scenarios</span></h4>
    <p><strong>Needs-test：</strong>${needsTestCount}</p>
    <p><strong>下一個建議測試：</strong>${next ? `${escapeHtml(next.id)} · ${escapeHtml(next.title)}` : '沒有匹配場景'}</p>
    <p>升級模型信心需要至少 3 次成功 run，並保留 prompt、輸出、日期、模型和分數。</p>
  `;
}

function renderTestMatrix() {
  const scenarios = filteredTestScenarios();
  $('testSummary').innerHTML = renderTestSummary();
  $('testOutput').innerHTML = scenarios.length ? scenarios.map((scenario) => `
    <article class="test-card">
      <h4>${escapeHtml(scenario.id)} · ${escapeHtml(scenario.title)} <span class="score">${escapeHtml(scenario.risk)}</span></h4>
      <div class="case-meta">
        <span class="case-pill">${escapeHtml(scenario.mode)}</span>
        <span class="case-pill">${escapeHtml(scenario.task)}</span>
        <span class="case-pill">${escapeHtml(scenario.model)}</span>
        <span class="case-pill">threshold ${scenario.passThreshold}</span>
      </div>
      <p><strong>目的：</strong>${escapeHtml(scenario.purpose)}</p>
      <p><strong>評分：</strong>${escapeHtml(scenario.dimensions.map(([name, weight]) => `${name} ${weight}`).join(' / '))}</p>
      <p><strong>證據：</strong>${escapeHtml(scenario.evidence)}</p>
      <button class="primary-button apply-test" type="button" data-test-id="${escapeHtml(scenario.id)}">套用測試</button>
    </article>
  `).join('') : '<article class="test-card"><h4>沒有匹配測試</h4><p>調整搜索詞、任務或風險篩選。</p></article>';
}

function sourceSearchText(card) {
  return [
    card.id,
    card.title,
    card.area,
    card.status,
    card.priority,
    card.summary,
    card.insight,
    card.nextAction,
    ...(card.tags || []),
    ...(card.sources || [])
  ].join(' ').toLowerCase();
}

function filteredSourceCards() {
  const query = value('sourceSearch').toLowerCase();
  const area = value('sourceAreaFilter') || 'all';
  const status = value('sourceStatusFilter') || 'all';

  return SOURCE_RADAR_CARDS.filter((card) => {
    const queryOk = !query || sourceSearchText(card).includes(query);
    const areaOk = area === 'all' || card.area === area;
    const statusOk = status === 'all' || card.status === status;
    return queryOk && areaOk && statusOk;
  });
}

function renderSourceSummary(cards) {
  const statusCounts = SOURCE_RADAR_CARDS.reduce((acc, card) => {
    acc[card.status] = (acc[card.status] || 0) + 1;
    return acc;
  }, {});
  const highGaps = KNOWLEDGE_GAPS.filter((gap) => ['critical', 'high'].includes(gap.priority)).length;

  $('sourceSummary').innerHTML = `
    <h4>來源覆蓋 <span class="score">${cards.length}/${SOURCE_RADAR_CARDS.length}</span></h4>
    <p>按來源領域、吸收狀態和下一步任務追蹤知識整理進度。高優先級缺口：${highGaps}。</p>
    <div class="case-meta">
      ${Object.entries(statusCounts).map(([status, count]) => `<span class="case-pill">${escapeHtml(status)} · ${count}</span>`).join('')}
    </div>
  `;
}

function renderSources() {
  const cards = filteredSourceCards();
  renderSourceSummary(cards);

  $('sourceOutput').innerHTML = cards.length ? cards.map((card) => `
    <article class="source-card">
      <div class="card-topline">
        <span class="score">${escapeHtml(card.id)}</span>
        <span class="case-pill">${escapeHtml(card.area)}</span>
        <span class="case-pill">${escapeHtml(card.status)}</span>
        <span class="case-pill">priority · ${escapeHtml(card.priority)}</span>
      </div>
      <h4>${escapeHtml(card.title)}</h4>
      <p>${escapeHtml(card.summary)}</p>
      <p><strong>可復用結論：</strong>${escapeHtml(card.insight)}</p>
      <p><strong>下一步：</strong>${escapeHtml(card.nextAction)}</p>
      <details>
        <summary>來源路徑</summary>
        <ul>${card.sources.map((source) => `<li><code>${escapeHtml(source)}</code></li>`).join('')}</ul>
      </details>
    </article>
  `).join('') : '<article class="source-card"><h4>沒有匹配來源</h4><p>調整搜索詞、領域或狀態篩選。</p></article>';

  $('gapOutput').innerHTML = KNOWLEDGE_GAPS.map((gap) => `
    <article class="gap-card">
      <div class="card-topline">
        <span class="score">${escapeHtml(gap.id)}</span>
        <span class="case-pill">${escapeHtml(gap.area)}</span>
        <span class="case-pill">${escapeHtml(gap.priority)}</span>
        <span class="case-pill">${escapeHtml(gap.risk)}</span>
      </div>
      <h4>${escapeHtml(gap.title)}</h4>
      <p>${escapeHtml(gap.whyItMatters)}</p>
      <p><strong>下一步：</strong>${escapeHtml(gap.nextAction)}</p>
      <p><strong>完成標準：</strong>${escapeHtml(gap.doneWhen)}</p>
    </article>
  `).join('');
}

function applyTestScenario(scenarioId) {
  const scenario = MODEL_TEST_SCENARIOS.find((item) => item.id === scenarioId);
  if (!scenario) return;

  if (currentMode !== scenario.mode) {
    updateMode(scenario.mode);
  }

  populateTasks();
  populateModels();
  setValue('taskType', scenario.task);

  ['subject', 'action', 'scene', 'camera', 'light', 'style', 'details', 'constraints', 'performanceNotes'].forEach((id) => setValue(id, ''));
  ['motionProfile', 'expressionProfile', 'physicsProfile'].forEach((id) => setValue(id, 'none'));
  Object.entries(scenario.defaults).forEach(([key, next]) => setValue(key, next));
  setValue('targetModel', scenario.model);
  buildAll();
  updatePanel('builder');
}

function caseSearchText(card) {
  return [
    card.id,
    card.title,
    card.outcome,
    card.task,
    card.models.join(' '),
    card.problem,
    card.method,
    card.reusableRule,
    card.appMapping.join(' '),
    card.tags.join(' '),
    card.nextAction
  ].join(' ').toLowerCase();
}

function currentPromptCorpus() {
  return [
    currentTask().id,
    value('targetModel'),
    value('subject'),
    value('action'),
    value('scene'),
    value('camera'),
    value('light'),
    value('style'),
    value('details'),
    value('constraints'),
    value('performanceNotes'),
    value('motionProfile'),
    value('expressionProfile'),
    value('physicsProfile')
  ].join(' ').toLowerCase();
}

function caseMatchScore(card) {
  const corpus = currentPromptCorpus();
  let score = 0;
  if (card.task === currentTask().id) score += 5;
  if (card.models.includes(value('targetModel'))) score += 4;
  card.tags.forEach((tag) => {
    if (corpus.includes(tag.toLowerCase())) score += 1;
  });
  if (card.outcome === 'needs-test' && MODEL_ROUTES.find((model) => model.id === value('targetModel'))?.weak.includes('needs-test')) {
    score += 2;
  }
  return score;
}

function matchedCases(limit = 4) {
  return CASE_CARDS
    .map((card) => ({ ...card, matchScore: caseMatchScore(card) }))
    .filter((card) => card.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

function evaluateCurrentPrompt() {
  const task = currentTask();
  const strengths = [];
  const risks = [];
  const fixes = [];
  let score = 0;

  const award = (condition, points, passText, riskText, fixText) => {
    if (condition) {
      score += points;
      if (passText) strengths.push(passText);
    } else {
      if (riskText) risks.push(riskText);
      if (fixText) fixes.push(fixText);
    }
  };

  award(value('subject').length > 0, 15, '主體/身份已定義。', '主體缺失，模型會自行腦補人物或商品。', '補上主體、身份、外觀、reference lock。');
  award(value('scene').length > 0, 10, '場景已定義。', '場景缺失，畫面背景容易漂。', '補上地點、時代、空間層級和背景物。');
  award(value('camera').length > 0, 10, '鏡頭/構圖已定義。', '鏡頭缺失，構圖和視角不穩。', '補上景別、焦段、運鏡或構圖中心。');
  award(value('constraints').length > 0, 10, '已有禁止項/約束。', '缺少禁止項，容易出現水印、亂字、額外肢體或臉部漂移。', '至少加入 no watermark / no face drift / no random text / no extra limbs。');
  award(value('targetModel').length > 0, 10, '目標模型已選。', '沒有模型目標，無法做適配和風險判斷。', '選一個目標模型，或打開模型路由比較。');

  const requiredComplete = task.required.every((field) => value(field).length > 0);
  award(requiredComplete, 10, '任務必填欄位完整。', '任務必填欄位還不完整。', `補齊 ${task.required.join(', ')}。`);

  const selectedMotion = value('motionProfile') !== 'none';
  const selectedExpression = value('expressionProfile') !== 'none';
  const selectedPhysics = value('physicsProfile') !== 'none';
  const hasPerformance = selectedMotion || selectedExpression || selectedPhysics || value('performanceNotes').length > 0;
  const performanceTask = currentMode === 'video' && ['mv-shot', 'lipsync', 'dance-body', 'first-last-frame'].includes(task.id);
  award(!performanceTask || hasPerformance, 10, '表演/物理層已覆蓋當前視頻任務。', '視頻表演層不足，容易僵硬或只有運鏡沒有演技。', '選擇肢體、微表情/口型或物理 profile，並補表演說明。');

  award(rankedModels().length >= 3, 10, '已有多模型路由和模型導出可比較。', '模型適配不足。', '打開模型導出，對比至少 3 個模型版本。');

  const matched = matchedCases();
  if (matched.length) {
    score += 5;
    strengths.push(`已匹配 ${matched.length} 條歷史案例，可復用既有規則。`);
  } else {
    risks.push('目前沒有匹配案例，這可能是新模式或資料不足。');
    fixes.push('生成後把結果補成新案例卡，尤其記錄模型、prompt、失敗點和修正。');
  }

  const actionText = value('action');
  const hasTimeline = /(\d+\s*-\s*\d+\s*s)|(\d+\s*-\s*\d+\s*秒)|(\d+s)|(\d+秒)/i.test(actionText);
  if (currentMode === 'video' && !hasTimeline) {
    score -= 10;
    risks.push('視頻缺少時間線，模型可能把多個事件混在一起。');
    fixes.push('把動作拆成 0-3s / 3-6s / 6-8s。');
  }

  if (task.id === 'lipsync' && value('targetModel') === 'grok-video') {
    score -= 15;
    risks.push('Grok Video 口型目前是 needs-test，不能當可靠 lipsync 主力。');
    fixes.push('改用短台詞 + mouth/jaw/breath/timing 可見表演，或與 Seedance/Veo 做對照測試。');
  }

  if (task.id === 'product-photo' && !/reference|logo|material|材質|品牌|形狀|瓶|包裝/.test(`${value('subject')} ${value('details')} ${value('constraints')}`)) {
    score -= 10;
    risks.push('商品圖缺少 reference/material/logo/fidelity 約束。');
    fixes.push('補上 exact shape、Logo、材質、包裝尺寸、reference fidelity。');
  }

  if (value('physicsProfile') === 'tasteful-soft-body' && !/adult|成年|no vulgar|不低俗|tasteful|克制/.test(`${value('subject')} ${value('constraints')} ${value('performanceNotes')}`)) {
    score -= 10;
    risks.push('軟組織真實感缺少成年/克制/非低俗邊界。');
    fixes.push('補上 adult subject、tasteful framing、no vulgar framing、camera keeps face and full movement visible。');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    strengths,
    risks,
    fixes,
    matched
  };
}

function listItems(items, emptyText) {
  const source = items.length ? items : [emptyText];
  return `<ul>${source.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function renderEvaluation() {
  const result = evaluateCurrentPrompt();
  const matchedText = result.matched.length
    ? result.matched.map((card) => `${card.id} · ${card.title} (${card.outcome})`)
    : ['暫無匹配案例'];

  return `
    <h4>Prompt 評估 <span class="score">score ${result.score}/100</span></h4>
    <p><strong>優勢</strong></p>
    ${listItems(result.strengths, '暫無明顯優勢，先補核心欄位。')}
    <p><strong>風險</strong></p>
    ${listItems(result.risks, '未發現明顯高風險。')}
    <p><strong>修正建議</strong></p>
    ${listItems(result.fixes, '目前可直接進入模型導出或人工審查。')}
    <p><strong>匹配案例</strong></p>
    ${listItems(matchedText, '暫無匹配案例')}
  `;
}

function filteredCases() {
  const query = value('caseSearch').toLowerCase();
  const taskFilter = value('caseTaskFilter') || 'all';
  const outcomeFilter = value('caseOutcomeFilter') || 'all';

  return CASE_CARDS.filter((card) => {
    const queryOk = !query || caseSearchText(card).includes(query);
    const taskOk = taskFilter === 'all' || card.task === taskFilter;
    const outcomeOk = outcomeFilter === 'all' || card.outcome === outcomeFilter;
    return queryOk && taskOk && outcomeOk;
  });
}

function frameworkSearchText(framework) {
  return [
    framework.id,
    framework.name,
    framework.domain,
    ...framework.slots.map((slot) => `${slot.label} ${slot.hint}`),
    ...framework.cheatSheet.flatMap((group) => [group.group, ...group.words.flatMap((word) => [word.en, word.zh])]),
    ...(framework.lookupTables || []).flatMap((table) => [table.title, ...table.rows.map((row) => row.term)])
  ].join(' ').toLowerCase();
}

function renderFrameworks() {
  const logic = $('frameworkLogic');
  if (!logic) return;
  logic.innerHTML = `
    <h4>模型底層邏輯對照</h4>
    ${MODEL_LOGIC_NOTES.models.map((model) => `
      <p><strong>${escapeHtml(model.name)}</strong>（${escapeHtml(model.language)}）</p>
      <ul>${model.points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul>
    `).join('')}
    <h4>同一輸入的差異</h4>
    <ul>${MODEL_LOGIC_NOTES.examples.map((example) => `<li><code>${escapeHtml(example.input)}</code> — DALL-E：${escapeHtml(example.dalle)} MJ：${escapeHtml(example.mj)}</li>`).join('')}</ul>
    <h4>鏡頭焦段速查</h4>
    <ul>${LENS_GUIDE.map((lens) => `<li><strong>${escapeHtml(lens.range)}</strong>：${escapeHtml(lens.traits)}。適用：${escapeHtml(lens.scenes)}</li>`).join('')}</ul>
  `;

  const query = value('frameworkSearch').toLowerCase();
  const frameworks = PROMPT_FRAMEWORKS.filter((framework) => !query || frameworkSearchText(framework).includes(query));
  $('frameworkOutput').innerHTML = frameworks.length ? frameworks.map((framework) => `
    <article class="framework-card">
      <div class="card-topline">
        <span class="case-pill">${escapeHtml(framework.id.toUpperCase())}</span>
        <span class="case-pill">${escapeHtml(framework.domain)}</span>
        <span class="case-pill">適用：${framework.forModes.map((mode) => mode === 'image' ? '生圖' : '生視頻').join(' / ')}</span>
      </div>
      <h4>${escapeHtml(framework.name)}</h4>
      <ul class="slot-list">
        ${framework.slots.map((slot) => `<li><strong>${escapeHtml(slot.letter)}</strong> ${escapeHtml(slot.label)} — ${escapeHtml(slot.hint)}</li>`).join('')}
      </ul>
      <details>
        <summary>Before / After 對照與解析</summary>
        <p class="before-text">❌ ${escapeHtml(framework.before)}</p>
        <p class="after-text">🟢 ${escapeHtml(framework.after).replace(/\n/g, '<br>')}</p>
        <ul>${framework.analysis.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </details>
      ${(framework.lookupTables || []).map((table) => `
        <details>
          <summary>${escapeHtml(table.title)}</summary>
          <table class="lookup-table">
            <thead><tr><th>術語</th><th>說明</th><th>適用</th></tr></thead>
            <tbody>${table.rows.map((row) => `<tr><td>${escapeHtml(row.term)}</td><td>${escapeHtml(row.desc)}</td><td>${escapeHtml(row.when)}</td></tr>`).join('')}</tbody>
          </table>
        </details>
      `).join('')}
      ${framework.cheatSheet.map((group) => `
        <div class="cheat-group">
          <p class="cheat-head">${escapeHtml(group.group)} <span>→ ${escapeHtml(FIELD_LABELS[group.targetField] || group.targetField)}</span></p>
          <div class="chip-row">
            ${group.words.map((word) => `<button class="chip copy-word" type="button" data-word="${escapeHtml(word.en)}">${escapeHtml(word.en)} <span>${escapeHtml(word.zh)}</span></button>`).join('')}
          </div>
        </div>
      `).join('')}
      <div class="actions">
        <button class="ghost-button use-framework" type="button" data-framework-id="${framework.id}">在生成器使用此框架</button>
      </div>
    </article>
  `).join('') : '<p>沒有匹配的框架。</p>';
}

function renderCases() {
  $('evaluationOutput').innerHTML = renderEvaluation();
  const cases = filteredCases();
  $('caseOutput').innerHTML = cases.length ? cases.map((card) => `
    <article class="case-card">
      <h4>${escapeHtml(card.id)} · ${escapeHtml(card.title)} <span class="score">${escapeHtml(card.outcome)}</span></h4>
      <div class="case-meta">
        <span class="case-pill">${escapeHtml(card.task)}</span>
        ${card.models.map((model) => `<span class="case-pill">${escapeHtml(model)}</span>`).join('')}
        ${card.tags.slice(0, 5).map((tag) => `<span class="case-pill">${escapeHtml(tag)}</span>`).join('')}
      </div>
      <p><strong>問題：</strong>${escapeHtml(card.problem)}</p>
      <p><strong>方法：</strong>${escapeHtml(card.method)}</p>
      <p><strong>規則：</strong>${escapeHtml(card.reusableRule)}</p>
      <p><strong>下一步：</strong>${escapeHtml(card.nextAction)}</p>
    </article>
  `).join('') : '<article class="case-card"><h4>沒有匹配案例</h4><p>調整搜索詞、任務或結果篩選。</p></article>';
}

function currentFields() {
  return {
    subject: value('subject'),
    action: value('action'),
    scene: value('scene'),
    camera: value('camera'),
    light: value('light'),
    style: value('style'),
    details: value('details'),
    constraints: value('constraints'),
    ratio: value('ratio'),
    duration: value('duration'),
    motionScale: value('motionScale'),
    motionProfile: value('motionProfile'),
    expressionProfile: value('expressionProfile'),
    physicsProfile: value('physicsProfile'),
    performanceNotes: value('performanceNotes')
  };
}

function exportBundle() {
  const task = currentTask();
  const evaluation = evaluateCurrentPrompt();
  const qa = qaItems();
  const modelExports = rankedModels().map((model) => ({
    id: model.id,
    name: model.name,
    score: model.score,
    risk: MODEL_ADAPTERS[model.id]?.risk || model.weak,
    prompt: adapterPrompt(model, task)
  }));

  return {
    app: 'Media Prompt Forge',
    exportedAt: new Date().toISOString(),
    mode: currentMode,
    task: {
      id: task.id,
      label: task.label
    },
    targetModel: value('targetModel'),
    fields: currentFields(),
    memoryCards: {
      builtInCount: BUILT_IN_MEMORY_CARDS.length,
      customCount: customMemoryCards.length,
      customTitles: customMemoryCards.map((card) => card.title)
    },
    universalPrompt: buildPromptText(),
    modelExports,
    qa,
    evaluation: {
      score: evaluation.score,
      strengths: evaluation.strengths,
      risks: evaluation.risks,
      fixes: evaluation.fixes
    },
    matchedCases: evaluation.matched.map((card) => ({
      id: card.id,
      title: card.title,
      outcome: card.outcome,
      task: card.task,
      models: card.models,
      tags: card.tags,
      reusableRule: card.reusableRule,
      nextAction: card.nextAction
    }))
  };
}

function markdownList(items, emptyText) {
  const source = items.length ? items : [emptyText];
  return source.map((item) => `- ${item}`).join('\n');
}

function exportAsMarkdown(bundle) {
  const modelExports = bundle.modelExports.map((item) => [
    `### ${item.name} (${item.score})`,
    item.risk ? `Risk: ${item.risk}` : '',
    '```text',
    item.prompt,
    '```'
  ].filter(Boolean).join('\n')).join('\n\n');

  const qa = bundle.qa.map((item) => `- ${item.ok ? 'PASS' : 'WARN'}: ${item.title} — ${item.detail}`).join('\n');
  const cases = bundle.matchedCases.map((card) => `- ${card.id} · ${card.title} (${card.outcome}) — ${card.reusableRule}`).join('\n');

  return [
    '# Media Prompt Forge Export',
    '',
    '## Metadata',
    `- Exported at: ${bundle.exportedAt}`,
    `- Mode: ${bundle.mode}`,
    `- Task: ${bundle.task.label}`,
    `- Target model: ${bundle.targetModel}`,
    '',
    '## Inputs',
    '```json',
    JSON.stringify(bundle.fields, null, 2),
    '```',
    '',
    '## Universal Prompt',
    '```text',
    bundle.universalPrompt,
    '```',
    '',
    '## Model Exports',
    modelExports,
    '',
    '## QA Checklist',
    qa || '- No QA items.',
    '',
    '## Evaluation',
    `Score: ${bundle.evaluation.score}/100`,
    '',
    'Strengths:',
    markdownList(bundle.evaluation.strengths, 'No obvious strengths yet.'),
    '',
    'Risks:',
    markdownList(bundle.evaluation.risks, 'No major risks detected.'),
    '',
    'Fixes:',
    markdownList(bundle.evaluation.fixes, 'No fixes required before review.'),
    '',
    '## Matched Cases',
    cases || '- No matched cases.'
  ].join('\n');
}

function exportText() {
  const bundle = exportBundle();
  return value('exportFormat') === 'json'
    ? JSON.stringify(bundle, null, 2)
    : exportAsMarkdown(bundle);
}

function renderExport() {
  $('exportOutput').textContent = exportText();
}

function downloadExport() {
  const format = value('exportFormat') === 'json' ? 'json' : 'md';
  const filenameBase = (value('exportFilename') || 'media-prompt-forge-export').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '') || 'media-prompt-forge-export';
  const blob = new Blob([exportText()], { type: format === 'json' ? 'application/json' : 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filenameBase}.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function qaItems() {
  const task = currentTask();
  const checks = [];
  const required = [...new Set(['subject', ...task.required])];
  const selectedMotion = value('motionProfile') !== 'none';
  const selectedExpression = value('expressionProfile') !== 'none';
  const selectedPhysics = value('physicsProfile') !== 'none';
  const performanceText = `${value('action')} ${value('details')} ${value('performanceNotes')}`.toLowerCase();

  required.forEach((field) => {
    const ok = value(field).length > 0;
    checks.push({
      ok,
      title: ok ? `${field} 已填` : `${field} 缺失`,
      detail: ok ? '此欄位會進入最終 prompt。' : '缺少這項會讓模型自行腦補，容易漂移。'
    });
  });

  checks.push({
    ok: value('ratio').length > 0,
    title: '比例 / 畫幅',
    detail: `目前比例為 ${value('ratio') || '未設定'}。`
  });

  checks.push({
    ok: value('constraints').length > 0,
    title: '約束 / 禁止項',
    detail: value('constraints') ? '已提供限制條件。' : '建議至少限制水印、臉部漂移、文字亂生成、額外肢體。'
  });

  if (currentMode === 'video') {
    checks.push({
      ok: value('action').includes('s') || value('action').includes('秒') || value('action').length > 40,
      title: '視頻節拍',
      detail: '視頻 prompt 建議寫 0-3s / 3-6s 這類時間段，避免多事件混亂。'
    });
    checks.push({
      ok: value('camera').length > 0,
      title: '運鏡控制',
      detail: '視頻最好明確是固定鏡頭、推近、跟拍、搖鏡或手持。'
    });
    if (task.id === 'lipsync') {
      checks.push({
        ok: selectedExpression || /mouth|lip|jaw|breath|嘴|口型|下頜|呼吸|對白|台詞/.test(value('action') + value('details') + value('constraints') + value('performanceNotes')),
        title: '口型約束',
        detail: '口型鏡頭要描述 mouth / jaw / breath，限制自然嘴型、避免誇張張口，並保持臉部一致。'
      });
    }
    if (task.id === 'dance-body') {
      checks.push({
        ok: selectedMotion || /body|hand|arm|leg|hip|shoulder|kinetic|weight|rhythm|身體|手|腿|肩|重心|節奏|傳導/.test(performanceText),
        title: '肢體細節',
        detail: '舞蹈/肢體 prompt 要描述動作質感、重心、關節路徑、kinetic chain 和節奏。'
      });
      checks.push({
        ok: selectedPhysics || /hair|cloth|fabric|inertia|follow|髮|布料|衣料|慣性|隨動|回彈/.test(performanceText),
        title: '二級運動 / 物理隨動',
        detail: '舞蹈鏡頭需要髮絲、布料、軟組織或道具的慣性/延遲/回彈，否則容易僵硬。'
      });
    }
    if (task.id === 'mv-shot') {
      checks.push({
        ok: selectedExpression || /eye|gaze|lip|brow|breath|眼神|嘴角|眉|呼吸/.test(performanceText),
        title: 'MV 表演層',
        detail: 'MV 鏡頭最好有眼神、嘴角、呼吸或微表情，避免只有運鏡沒有演技。'
      });
    }
  }

  if (['storyboard', 'first-last-frame'].includes(task.id)) {
    checks.push({
      ok: selectedExpression || value('action').length > 30,
      title: '表情/動作可視化',
      detail: '分鏡與首尾幀最好把情緒寫成眉眼、嘴角、頭部和身體狀態。'
    });
  }

  if (value('physicsProfile') === 'tasteful-soft-body') {
    checks.push({
      ok: /adult|成年|no vulgar|不低俗|tasteful|克制/.test(`${value('subject')} ${value('constraints')} ${performanceText}`),
      title: '軟組織真實感安全邊界',
      detail: '這類提示應只用於成年角色和真實感 QA，並明確保持克制、非低俗 framing。'
    });
  }

  return checks;
}

function renderQa() {
  $('qaOutput').innerHTML = qaItems().map((item) => `
    <article class="check-card">
      <h4 class="${item.ok ? 'pass' : 'warn'}">${item.ok ? '通過' : '注意'} · ${item.title}</h4>
      <p>${item.detail}</p>
    </article>
  `).join('');
}

function classifyQuote(text) {
  const classes = AUDIT_RULES.tbs.classes;
  const words = text.split(/\s+/).filter(Boolean);
  if (/^\s*(step\s*\d|[#＃]?\d+\s*[.、:：])/i.test(text)) return classes[3];
  if (words.length > 8 || /[.。!！?？]/.test(text)) return classes[4];
  if (words.length <= 2 && text === text.toUpperCase()) return classes[0];
  if (words.length <= 5) return classes[1];
  return classes[2];
}

function auditPrompt(raw) {
  const junkHits = [];
  let cleaned = raw;
  AUDIT_RULES.junkTags.forEach((rule) => {
    const re = new RegExp(rule.pattern, 'gi');
    if (re.test(cleaned)) {
      junkHits.push(rule);
      cleaned = cleaned.replace(re, '');
    }
  });
  cleaned = cleaned
    .replace(/,\s*(?=,)/g, '')
    .replace(/(^|\n)\s*,\s*/g, '$1')
    .replace(/,\s*(\n|$)/g, '$1')
    .replace(/ {2,}/g, ' ');

  const lower = raw.toLowerCase();
  const conflictHits = AUDIT_RULES.conflicts
    .map((rule) => {
      const hitA = rule.sideA.find((word) => lower.includes(word.toLowerCase()));
      const hitB = rule.sideB.find((word) => lower.includes(word.toLowerCase()));
      return hitA && hitB ? { ...rule, hitA, hitB } : null;
    })
    .filter(Boolean);

  const quoted = [...raw.matchAll(/["“]([^"“”]{1,120})["”]/g)]
    .map((match) => match[1].trim())
    .filter((text) => text && /[A-Za-z0-9]/.test(text));
  const items = quoted.map((text) => ({ text, cls: classifyQuote(text) }));
  const total = items.reduce((sum, item) => sum + item.cls.score, 0);
  const budget = AUDIT_RULES.tbs.budget;
  let kept = [];
  if (total > budget) {
    let spent = 0;
    [...items].sort((a, b) => a.cls.score - b.cls.score).forEach((item) => {
      if (spent + item.cls.score <= budget) {
        spent += item.cls.score;
        kept.push(item.text);
      }
    });
  }

  return {
    junkHits,
    conflictHits,
    tbs: { items, total, budget, over: total > budget, kept, placeholders: AUDIT_RULES.tbs.placeholders },
    cleaned
  };
}

function distillPrompt(raw) {
  const audit = auditPrompt(raw);
  const removed = [];
  const importantPattern = /#[0-9a-fA-F]{3,8}|reference|logo|verbatim|exact|字|文字|品牌|產品|角色|face|wardrobe|material|camera|light|scene|subject|duration|ratio|16:9|9:16|1:1|"/;
  const agentPattern = /^(you are|system:|role:|act as|please act|workflow|step\s*\d+|critical|rules|instruction|developer|assistant|你是|作為|請你|規則|步驟|工作流|重要規則)/i;

  const kept = audit.cleaned
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      if (agentPattern.test(line) && !importantPattern.test(line)) {
        removed.push(line);
        return false;
      }
      return true;
    });

  const compact = kept
    .join('\n')
    .replace(/={3,}.*?={3,}/g, '')
    .replace(/\b(CRITICAL|IMPORTANT|MUST)\b:?/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const summaryParts = [];
  summaryParts.push(removed.length ? `已移除 ${removed.length} 行 agent-facing / workflow 語句。` : '未發現明顯 agent-facing 語句。');
  if (audit.junkHits.length) summaryParts.push(`已清除 ${audit.junkHits.length} 個垃圾標籤。`);
  if (audit.conflictHits.length) summaryParts.push(`檢出 ${audit.conflictHits.length} 組美學/動態衝突，見下方審計報告。`);
  if (audit.tbs.over) summaryParts.push(`文字預算 TBS ${audit.tbs.total} 分超過上限 ${audit.tbs.budget} 分。`);

  return {
    prompt: compact || '沒有可保留的 model-facing prompt。請加入可視化事實。',
    summary: summaryParts.join(' '),
    audit
  };
}

function renderAuditReport(audit) {
  const container = $('auditReport');
  if (!container) return;
  if (!audit) {
    container.innerHTML = '';
    return;
  }
  const junkSection = audit.junkHits.length ? `
    <div class="audit-section">
      <h4>垃圾標籤清洗 · ${audit.junkHits.length} 項</h4>
      <ul>${audit.junkHits.map((hit) => `<li><strong>${escapeHtml(hit.label)}</strong> — ${escapeHtml(hit.reason)}${hit.replaceWith ? `；建議改用：<code>${escapeHtml(hit.replaceWith)}</code>` : '（直接移除）'}</li>`).join('')}</ul>
    </div>` : '<div class="audit-section pass"><h4>垃圾標籤 · 通過</h4></div>';

  const conflictSection = audit.conflictHits.length ? `
    <div class="audit-section">
      <h4>美學 / 動態衝突 · ${audit.conflictHits.length} 組</h4>
      <ul>${audit.conflictHits.map((hit) => `<li><strong>${escapeHtml(hit.name)}</strong>（命中：${escapeHtml(hit.hitA)} × ${escapeHtml(hit.hitB)}）<br>原理：${escapeHtml(hit.principle)}<br>建議：${escapeHtml(hit.action)}</li>`).join('')}</ul>
    </div>` : '<div class="audit-section pass"><h4>美學 / 動態衝突 · 通過</h4></div>';

  let tbsSection;
  if (!audit.tbs.items.length) {
    tbsSection = '<div class="audit-section pass"><h4>文字預算 TBS · 無引號文字</h4></div>';
  } else {
    const itemList = audit.tbs.items.map((item) => `<li><code>${escapeHtml(item.text)}</code> — ${escapeHtml(item.cls.type)}（${item.cls.score} 分）</li>`).join('');
    const advice = audit.tbs.over
      ? `<p><strong>超標：</strong>建議只保留 ${audit.tbs.kept.length ? audit.tbs.kept.map((text) => `<code>${escapeHtml(text)}</code>`).join('、') : '最高優先級主標題'}，其餘替換為排版佔位符（如 <code>${escapeHtml(audit.tbs.placeholders[0])}</code>），避免模型注意力稀釋產生亂碼。</p>`
      : '<p>在預算內，可直接保留所有引號文字。</p>';
    tbsSection = `
      <div class="audit-section${audit.tbs.over ? '' : ' pass'}">
        <h4>文字預算 TBS · ${audit.tbs.total} / ${audit.tbs.budget} 分</h4>
        <ul>${itemList}</ul>
        ${advice}
      </div>`;
  }

  container.innerHTML = junkSection + conflictSection + tbsSection;
}

function buildAll() {
  $('promptOutput').textContent = buildPromptText();
  renderRoutes();
  renderAdapters();
  renderTemplates();
  renderMemoryCards();
  renderTestMatrix();
  renderSources();
  renderFrameworks();
  renderFrameworkHints();
  renderStyles();
  renderHistory();
  renderCases();
  renderExport();
  renderQa();
}

function loadExample() {
  const example = EXAMPLES[currentMode];
  Object.entries(example).forEach(([key, next]) => setValue(key, next));
  buildAll();
}

function clearForm() {
  ['subject', 'action', 'scene', 'camera', 'light', 'style', 'details', 'constraints', 'performanceNotes'].forEach((id) => setValue(id, ''));
  ['motionProfile', 'expressionProfile', 'physicsProfile'].forEach((id) => setValue(id, 'none'));
  buildAll();
}

async function copyText(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    const old = button.textContent;
    button.textContent = '已複製';
    setTimeout(() => { button.textContent = old; }, 1500);
  } catch (error) {
    button.textContent = '複製失敗';
    setTimeout(() => { button.textContent = '複製'; }, 1500);
  }
}

function bindEvents() {
  document.querySelectorAll('.seg-button').forEach((button) => {
    button.addEventListener('click', () => updateMode(button.dataset.mode));
  });
  document.querySelector('.tool-nav').addEventListener('click', (event) => {
    const button = event.target.closest('.nav-button');
    if (button) updatePanel(button.dataset.panel);
  });
  document.querySelectorAll('textarea, select, input').forEach((field) => {
    field.addEventListener('input', buildAll);
    field.addEventListener('change', buildAll);
  });
  $('buildPrompt').addEventListener('click', () => { buildAll(); saveHistoryEntry(); });
  $('loadExample').addEventListener('click', loadExample);
  $('clearForm').addEventListener('click', clearForm);
  $('templateOutput').addEventListener('click', (event) => {
    const button = event.target.closest('.apply-template');
    if (button) applyTemplate(button.dataset.templateId);
  });
  $('saveMemoryCard').addEventListener('click', saveMemoryCard);
  $('resetMemoryEditor').addEventListener('click', resetMemoryEditor);
  $('memoryOutput').addEventListener('click', (event) => {
    const applyButton = event.target.closest('.apply-memory');
    const deleteButton = event.target.closest('.delete-memory');
    if (applyButton) applyMemoryCard(applyButton.dataset.memoryId);
    if (deleteButton) deleteMemoryCard(deleteButton.dataset.memoryId);
  });
  $('testOutput').addEventListener('click', (event) => {
    const button = event.target.closest('.apply-test');
    if (button) applyTestScenario(button.dataset.testId);
  });
  $('copyExport').addEventListener('click', (event) => {
    copyText($('exportOutput').textContent, event.currentTarget);
  });
  $('downloadExport').addEventListener('click', downloadExport);
  $('copyPrompt').addEventListener('click', (event) => {
    const text = activePanel === 'distiller' ? $('distillOutput').textContent : $('promptOutput').textContent;
    copyText(text, event.currentTarget);
  });
  $('distillButton').addEventListener('click', () => {
    const result = distillPrompt(value('distillInput'));
    $('distillOutput').textContent = `${result.prompt}\n\n---\n${result.summary}`;
    renderAuditReport(result.audit);
  });
  $('frameworkOutput').addEventListener('click', (event) => {
    const copyButton = event.target.closest('.copy-word');
    if (copyButton) {
      copyText(copyButton.dataset.word, copyButton);
      return;
    }
    const useButton = event.target.closest('.use-framework');
    if (useButton) {
      setValue('frameworkSelect', useButton.dataset.frameworkId);
      updatePanel('builder');
      buildAll();
    }
  });
  $('frameworkHints').addEventListener('click', (event) => {
    const chip = event.target.closest('.framework-chip');
    if (chip) {
      appendToField(chip.dataset.target, chip.dataset.word);
      buildAll();
    }
  });
  $('historyOutput').addEventListener('click', (event) => {
    const target = event.target.closest('[data-history-id]');
    if (!target) return;
    const id = target.dataset.historyId;
    if (target.classList.contains('copy-history')) {
      const entry = historyEntries().find((item) => item.id === id);
      if (entry) copyText(entry.prompt, target);
    }
    if (target.classList.contains('restore-history')) restoreHistoryEntry(id);
    if (target.classList.contains('delete-history')) deleteHistoryEntry(id);
  });
  $('onboardingCard').addEventListener('click', (event) => {
    if (event.target.closest('#dismissOnboarding')) {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, '1');
      renderOnboarding();
    }
    if (event.target.closest('#onboardingTemplates')) updatePanel('templates');
    if (event.target.closest('#onboardingExample')) loadExample();
  });
  $('clearHistory').addEventListener('click', () => {
    if (historyEntries().length && window.confirm('確定清空全部歷史？此操作不可恢復。')) {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
      renderHistory();
    }
  });
  $('styleOutput').addEventListener('click', (event) => {
    const copyButton = event.target.closest('.copy-style');
    if (copyButton) {
      copyText(copyButton.dataset.text, copyButton);
      return;
    }
    const insertButton = event.target.closest('.insert-style');
    if (insertButton) {
      appendToField(insertButton.dataset.target, insertButton.dataset.text);
      buildAll();
    }
  });
}

function init() {
  populateNav();
  renderOnboarding();
  populateTasks();
  populateModels();
  populateProfiles();
  populateCaseFilters();
  populateTemplateFilters();
  populateMemoryControls();
  populateTestFilters();
  populateSourceFilters();
  populateFrameworkSelect();
  populateStyleFilters();
  loadMemoryCards();
  document.querySelectorAll('.video-only').forEach((node) => node.classList.add('is-hidden'));
  bindEvents();
  loadExample();
  updatePanel('builder');
}

init();
