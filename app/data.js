const TASKS = [
  { id: 'character-card', label: '角色卡 / 人物一致性', modes: ['image'], required: ['subject', 'style', 'details'], tags: ['character', 'identity'] },
  { id: 'storyboard', label: '分鏡 / Storyboard', modes: ['image', 'video'], required: ['subject', 'action', 'scene', 'camera'], tags: ['storyboard', 'shot'] },
  { id: 'first-last-frame', label: '首尾幀 / Keyframe', modes: ['image', 'video'], required: ['subject', 'action', 'scene', 'camera', 'constraints'], tags: ['keyframe', 'video'] },
  { id: 'product-photo', label: '商品圖 / Product Visual', modes: ['image'], required: ['subject', 'scene', 'details', 'constraints'], tags: ['product', 'fidelity'] },
  { id: 'aplus-page', label: 'A+ 詳情圖 / Infographic', modes: ['image'], required: ['subject', 'details', 'style', 'constraints'], tags: ['commerce', 'text'] },
  { id: 'mv-shot', label: 'MV 鏡頭 / Cinematic Shot', modes: ['video'], required: ['subject', 'action', 'scene', 'camera', 'light', 'style'], tags: ['music', 'motion'] },
  { id: 'lipsync', label: '口型 / 對白鏡頭', modes: ['video'], required: ['subject', 'action', 'camera', 'constraints'], tags: ['face', 'lipsync'] },
  { id: 'dance-body', label: '舞蹈 / 肢體表演', modes: ['video'], required: ['subject', 'action', 'camera', 'constraints'], tags: ['body', 'performance'] }
];

const MODEL_ROUTES = [
  { id: 'gpt-image-2', name: 'GPT Image 2', modes: ['image'], strengths: ['角色卡', '圖像編輯', '文字/Logo', '多參考'], weak: '成本較高；需要明確逐字文字和 reference lock。', best: ['character-card', 'first-last-frame', 'aplus-page'] },
  { id: 'nova', name: 'Nova', modes: ['image'], strengths: ['4K 商品圖', '人像質感', '參考圖保真', '商業攝影'], weak: '水墨/寫意弱；敏感詞需清洗；prompt 不宜超長。', best: ['product-photo', 'aplus-page'] },
  { id: 'seedream', name: 'Seedream', modes: ['image'], strengths: ['中文理解', '批量', '多參考', '國風備選'], weak: '模型名與權限可能變；需保留實測記錄。', best: ['character-card', 'storyboard'] },
  { id: 'gemini-image', name: 'Gemini Image', modes: ['image'], strengths: ['複雜構圖', '文檔配圖', '多輪', '國風可試'], weak: '不同通道 API 形態不一；文字精準度需 QA。', best: ['storyboard', 'aplus-page'] },
  { id: 'seedance', name: 'Seedance', modes: ['video'], strengths: ['中文視頻', '首尾幀', '節拍', '短片段動作'], weak: '動作過大容易漂；口型需專門約束。', best: ['first-last-frame', 'mv-shot', 'dance-body'] },
  { id: 'veo', name: 'Veo', modes: ['video'], strengths: ['電影鏡頭', '英文 cinematic prompt', '畫面質感'], weak: '需要乾淨英文 prompt；複雜多事件會失控。', best: ['storyboard', 'mv-shot'] },
  { id: 'grok-video', name: 'Grok Video', modes: ['video'], strengths: ['歷史 role 存在', '可能適合特定 POV'], weak: 'needs-test：口型未驗證穩定，不能作主力結論。', best: ['lipsync'] },
  { id: 'kling', name: 'Kling', modes: ['video'], strengths: ['視頻模型備選', '動作鏡頭可測'], weak: 'needs-test：需建立本項目實測卡。', best: ['dance-body', 'mv-shot'] }
];

const MOTION_PROFILES = [
  { id: 'none', label: '不加強', text: '', qaTags: [] },
  {
    id: 'laban-glide',
    label: 'Laban Glide · 優雅流動',
    text: 'BODY MOVEMENT QUALITY: Glide — Direct + Light + Sustained + Free. Effortless forward motion, continuous silk-smooth transitions, center of gravity seems to float, no abrupt stops.',
    qaTags: ['laban', 'weight', 'flow']
  },
  {
    id: 'laban-press',
    label: 'Laban Press · 壓迫控制',
    text: 'BODY MOVEMENT QUALITY: Press — Direct + Heavy + Sustained + Bound. Deliberate weight in every step, controlled body tension, spine vertical, shoulders level, every movement lands with authority.',
    qaTags: ['laban', 'weight', 'bound']
  },
  {
    id: 'laban-wring',
    label: 'Laban Wring · 內在拉扯',
    text: 'BODY MOVEMENT QUALITY: Wring — Indirect + Heavy + Sustained + Bound. Body twists against itself, opposing muscular directions, sustained tendon tension, internal struggle externalized.',
    qaTags: ['laban', 'tension']
  },
  {
    id: 'laban-float',
    label: 'Laban Float · 失焦漂浮',
    text: 'BODY MOVEMENT QUALITY: Float — Indirect + Light + Sustained + Free. Gravity feels reduced, limbs trail behind torso, gaze unfocused, shallow irregular breathing.',
    qaTags: ['laban', 'breath']
  },
  {
    id: 'dance-rnb',
    label: 'R&B 舞蹈 / 液體律動',
    text: 'Real human biomechanics, rhythm-driven slow body movement, core-driven kinetic chain, natural weight shift through pelvis and feet, connected shoulder-neck-torso-waist movement, upper-torso isolation, smooth body wave synced to the low bass beat.',
    qaTags: ['dance', 'kinetic-chain', 'rhythm']
  },
  {
    id: 'kinetic-chain',
    label: 'Kinetic Chain · 全身傳導',
    text: 'Kinetic chain starts from the core, travels through torso, shoulder and neck, then arms and hands; subtle delay between connected body parts, realistic inertia, rebound, and follow-through.',
    qaTags: ['kinetic-chain', 'inertia']
  }
];

const EXPRESSION_PROFILES = [
  { id: 'none', label: '不加強', text: '', qaTags: [] },
  {
    id: 'controlled-fury',
    label: '克制憤怒',
    text: 'Facial performance: furrowed inner brows pressed downward, sharp direct unblinking stare, lips tightly pursed, jawline tensed, cold controlled fury held under restraint.',
    qaTags: ['au4', 'jaw', 'breath']
  },
  {
    id: 'quiet-sadness',
    label: '安靜悲傷',
    text: 'Facial performance: inner eyebrows slightly gathered, downturned gaze, drooping eyelids, mouth corners down, slow fragile breathing, emotion stays quiet and internal.',
    qaTags: ['au1', 'au15', 'breath']
  },
  {
    id: 'tension-composure',
    label: '緊張但強裝鎮定',
    text: 'Facial performance: eyes widen for a fraction, lids tighten, lips press together, throat swallows once, shoulders stay still as she forces composure back into place.',
    qaTags: ['timing', 'jaw', 'breath']
  },
  {
    id: 'soft-shyness',
    label: '輕微害羞',
    text: 'Facial performance: eyes dodge downward, subtle warm micro-smile, cheeks softly flushed, head tilts slightly, gentle breath, expression remains restrained.',
    qaTags: ['gaze', 'smile', 'breath']
  },
  {
    id: 'hard-resolve',
    label: '沉著堅定',
    text: 'Facial performance: resolute unyielding gaze, calm straight lip line, stable jaw, chin lifts slightly, slow deep controlled breathing.',
    qaTags: ['gaze', 'jaw', 'breath']
  },
  {
    id: 'dissociation',
    label: '失神 / 呆滯',
    text: 'Facial performance: hollow vacant eyes, unfocused gaze, reduced blinking, relaxed facial muscles, emotionally disconnected delayed reaction.',
    qaTags: ['gaze', 'blink']
  },
  {
    id: 'lipsync-natural',
    label: '自然口型 / 對白',
    text: 'LIPSYNC PERFORMANCE: natural restrained mouth movement, lips part only as needed, jaw travels minimally, small consonant closures, visible inhale before the line, eyes react half a beat before the mouth starts, no exaggerated mouth shapes.',
    qaTags: ['lipsync', 'jaw', 'breath']
  }
];

const PHYSICS_PROFILES = [
  { id: 'none', label: '不加強', text: '', qaTags: [] },
  {
    id: 'gravity-inertia',
    label: '重力 / 慣性',
    text: 'Physics: gravity direction stays consistent; movement accelerates and decelerates naturally; secondary objects continue briefly after the body stops, then settle with damping.',
    qaTags: ['gravity', 'inertia']
  },
  {
    id: 'cloth-hair-follow',
    label: '布料 / 髮絲隨動',
    text: 'Physics: hair and fabric follow the body with a 0.2-0.4s delay, cloth folds follow gravity, fabric never clips through limbs, strands and hems settle after motion stops.',
    qaTags: ['cloth', 'hair', 'secondary-motion']
  },
  {
    id: 'liquid-tear',
    label: '淚水 / 液體',
    text: 'Physics: tears pool along the lower eyelid, one tear follows the cheek contour downward under gravity; liquid surfaces remain level and show natural ripples/refraction.',
    qaTags: ['liquid', 'gravity']
  },
  {
    id: 'optical-reflection',
    label: '反射 / 折射 / 眼神光',
    text: 'Optics: corneal catchlight stays visible, polished surfaces reflect figures like a slightly diffused mirror, glass and liquid create subtle refraction and caustic patterns.',
    qaTags: ['optics', 'reflection']
  },
  {
    id: 'tasteful-soft-body',
    label: '軟組織真實感（克制）',
    text: 'Tasteful soft-body biomechanics: natural soft-tissue inertia, breathing-driven thoracic motion, subtle rebound caused by body movement, fabric follows motion with slight delay, camera keeps face and full movement visible, no vulgar framing.',
    qaTags: ['soft-body', 'breath', 'tasteful']
  }
];

const MODEL_ADAPTERS = {
  'gpt-image-2': {
    bestUse: '角色一致性、圖像編輯、文字/Logo、需要嚴格參考鎖定的畫面。',
    promptStyle: '乾淨、直接、保留 reference/identity/text/material 的事實，不混入 workflow。',
    guardrails: 'Lock identity and reference details. Include exact text only when specified. Avoid extra labels, watermarks, and face drift.',
    risk: ''
  },
  nova: {
    bestUse: '商品圖、商業攝影、4K 人像和材質保真。',
    promptStyle: '短而硬的商業攝影 prompt，強調主體、材質、鏡頭、光線和平台限制。',
    guardrails: 'Keep concise. Prioritize product/subject fidelity, material realism, clean background, and no random text.',
    risk: ''
  },
  seedream: {
    bestUse: '中文理解、多參考、角色卡和分鏡備選。',
    promptStyle: '中文主導，明確主體、參考鎖定、構圖、風格和負面限制。',
    guardrails: 'Keep identity/reference and composition explicit. Avoid overlong mixed-language instructions.',
    risk: ''
  },
  'gemini-image': {
    bestUse: '複雜構圖、文檔配圖、多物件布局、概念視覺化。',
    promptStyle: '像 scene graph 一樣描述層級、空間位置、視覺重點和文字要求。',
    guardrails: 'Clarify layout hierarchy. Mark any text as exact/verbatim only when needed. Avoid ambiguous decorative copy.',
    risk: ''
  },
  seedance: {
    bestUse: '中文視頻、首尾幀、短片段、節拍和可控動作。',
    promptStyle: '簡潔時間線 + 單鏡頭連續性 + 身體/物理隨動 + 明確禁止跳剪。',
    guardrails: 'Use one continuous shot, simple readable action, stable face/wardrobe/props, no scene jump.',
    risk: ''
  },
  veo: {
    bestUse: '英文電影感鏡頭、質感、單事件情緒轉折。',
    promptStyle: 'Clean cinematic English: subject, one action, one camera move, lighting, duration, continuity.',
    guardrails: 'Avoid crowded multi-event prompts. Keep one emotional transition and one camera language.',
    risk: ''
  },
  'grok-video': {
    bestUse: '視頻備選與特定 POV 實驗，不作口型主力結論。',
    promptStyle: '可見口型表演與面部演技 fallback，而不是假設音頻-口型一定同步。',
    guardrails: 'For lipsync: use short phrase, visible mouth/jaw/breath timing, no exaggerated mouth shapes, no random talking.',
    risk: 'Needs-test: Grok Video lipsync is not treated as reliable until proven in this project.'
  },
  kling: {
    bestUse: '動作鏡頭、運鏡和物理隨動備選。',
    promptStyle: '清楚描述動作路徑、鏡頭路徑、物理約束、身份和場景連續性。',
    guardrails: 'Avoid complex scene jumps and impossible transformations. State camera path and secondary motion clearly.',
    risk: 'Needs-test: keep outputs auditable with case cards.'
  }
};

const MEMORY_STORAGE_KEY = 'mpf.memoryCards.v1';

const MEMORY_CARD_TYPES = [
  { id: 'character', label: '角色' },
  { id: 'scene', label: '場景' },
  { id: 'product', label: '商品' },
  { id: 'wardrobe', label: '服裝/道具' },
  { id: 'style', label: '風格' }
];

const BUILT_IN_MEMORY_CARDS = [
  {
    id: 'mem_builtin_character',
    type: 'character',
    title: 'Cinematic Female Character Lock',
    content: 'same adult female protagonist, consistent oval face, high cheekbones, expressive eyes, delicate lips, stable hairstyle, stable wardrobe silhouette, no face drift, no age drift',
    tags: ['identity', 'face', 'character'],
    builtIn: true
  },
  {
    id: 'mem_builtin_scene',
    type: 'scene',
    title: 'Noir Lounge Scene',
    content: 'private black marble lounge at rainy night, neon reflections on polished stone, blurred bottle wall in background, controlled low-key lighting, stable spatial layout',
    tags: ['noir', 'lounge', 'scene'],
    builtIn: true
  },
  {
    id: 'mem_builtin_product',
    type: 'product',
    title: 'Product Reference Lock',
    content: 'lock the exact product shape, logo placement, packaging proportions, cap shape, label color, material surface, no redesign, no random text',
    tags: ['product', 'reference-lock', 'logo'],
    builtIn: true
  },
  {
    id: 'mem_builtin_wardrobe',
    type: 'wardrobe',
    title: 'Wardrobe / Accessory Lock',
    content: 'wardrobe, jewelry, hairstyle, makeup, hand props and fabric material remain consistent across frames; preserve accessory shape and placement',
    tags: ['wardrobe', 'accessories', 'continuity'],
    builtIn: true
  },
  {
    id: 'mem_builtin_style',
    type: 'style',
    title: 'Modern Noir Visual Style',
    content: 'cinematic modern noir, ARRI Alexa 65 feeling, restrained contrast, warm key light, cool neon rim light, realistic skin texture, subtle film grain',
    tags: ['style', 'noir', 'cinematic'],
    builtIn: true
  }
];

const CASE_CARDS = [
  {
    id: 'C001',
    title: 'Character / Keyframe Pipeline',
    outcome: 'success',
    task: 'first-last-frame',
    models: ['gpt-image-2', 'seedance'],
    problem: '視頻多鏡頭角色容易漂，首尾幀若缺身份錨點會改臉、改髮型、改服裝。',
    method: '先人物卡，再 master board，再首尾幀；人物卡當 DNA anchor，總板鎖場景，首尾幀控制動作幅度。',
    reusableRule: '角色卡服務後續生成，不是海報；首尾差異越小，視頻越穩。',
    appMapping: ['生成器', '模型導出', 'QA 檢查'],
    tags: ['identity', 'keyframe', 'continuity', 'reference-lock'],
    nextAction: '做可填寫的 Character / Scene / Wardrobe memory cards。'
  },
  {
    id: 'C002',
    title: 'Nova Product Visuals',
    outcome: 'success',
    task: 'product-photo',
    models: ['nova', 'gpt-image-2'],
    problem: '商品圖若不傳 reference 或不鎖 exact shape，模型會重設計瓶身、Logo、材質和賣點。',
    method: 'reference image locking + product/material/logo constraints，prompt 以保真為最高優先級。',
    reusableRule: '商品圖不是自由創作，先保 shape/material/logo，再談氛圍。',
    appMapping: ['生成器', '模型路由', '模型導出', 'QA 檢查'],
    tags: ['product', 'reference-lock', 'material', 'logo', 'fidelity'],
    nextAction: '建立 product-specific QA 欄位：尺寸、Logo、材質、賣點、平台限制。'
  },
  {
    id: 'C003',
    title: 'A+ Page As Infographic',
    outcome: 'success',
    task: 'aplus-page',
    models: ['gpt-image-2', 'gemini-image'],
    problem: 'A+ 圖如果只寫漂亮產品照，會缺賣點、痛點、證據、對比和轉化結構。',
    method: '把 A+ 當信息圖渲染，分 hero、痛點、功能、證據、對比。',
    reusableRule: 'A+ 是商業信息壓縮任務，不是單純攝影任務。',
    appMapping: ['生成器', '模型導出', '案例庫'],
    tags: ['commerce', 'infographic', 'text', 'conversion', 'layout'],
    nextAction: '做 A+ 模板庫與 SEO 長尾頁。'
  },
  {
    id: 'C004',
    title: 'Prompt Pollution',
    outcome: 'mixed',
    task: 'storyboard',
    models: ['gpt-image-2', 'nova', 'seedream', 'gemini-image', 'seedance', 'veo', 'grok-video', 'kling'],
    problem: 'agent-facing rules、workflow、critical rules 直接進 model-facing prompt 會污染畫面。',
    method: '分離策略/規則與 model-facing visual prompt；只保留可視化事實、鏡頭、材質、限制。',
    reusableRule: '工具可以有內部 reasoning，但輸出 prompt 必須乾淨。',
    appMapping: ['Prompt Distiller', '模型導出'],
    tags: ['distillation', 'prompt-cleaning', 'workflow', 'model-facing'],
    nextAction: '增加策略 prompt / 模型 prompt 雙欄對照。'
  },
  {
    id: 'C005',
    title: 'Grok Lipsync Gap',
    outcome: 'needs-test',
    task: 'lipsync',
    models: ['grok-video', 'seedance', 'veo'],
    problem: '使用者反饋 Grok 沒有對口型；不能把 Grok 當可靠 lipsync 主力。',
    method: '暫時標記 Grok Video 為 needs-test；對口型任務使用 mouth/jaw/breath/timing 可見表演 fallback。',
    reusableRule: '未驗證模型不給確定結論；口型能力需要單獨實測卡。',
    appMapping: ['模型路由', '模型導出', 'QA 檢查', '案例庫'],
    tags: ['lipsync', 'grok', 'needs-test', 'jaw', 'breath', 'mouth'],
    nextAction: '建立 Grok/Seedance/Veo 同 prompt lipsync 對照測試。'
  },
  {
    id: 'C006',
    title: 'Chinese Aesthetic / Ink Style',
    outcome: 'mixed',
    task: 'storyboard',
    models: ['seedream', 'gemini-image', 'nova'],
    problem: 'Nova 容易把水墨/國風拉回 CG、遊戲原畫或商業攝影質感。',
    method: '國風由意境、媒介、筆觸、留白、國色、構圖層次建構；先選模型再寫 prompt。',
    reusableRule: '風格任務要先做模型路由，不能靠通用 prompt 硬推。',
    appMapping: ['模型路由', '模型導出', '案例庫'],
    tags: ['chinese-aesthetic', 'ink', 'model-routing', 'style'],
    nextAction: '做國風/水墨模型適配模板。'
  },
  {
    id: 'C007',
    title: 'VisualForge Document Illustration',
    outcome: 'success',
    task: 'storyboard',
    models: ['gemini-image', 'gpt-image-2'],
    problem: '文檔配圖和商品/角色圖混用會導致工具邏輯亂。',
    method: '文檔理解由 LLM 做，圖像 prompt 只負責生成；將文檔配圖作獨立任務類。',
    reusableRule: '文檔配圖不是商品圖，也不是角色卡，應該有專門 builder。',
    appMapping: ['Future Document Illustration Builder', '案例庫'],
    tags: ['document', 'illustration', 'visualforge', 'layout'],
    nextAction: '新增 document-illustration spec。'
  },
  {
    id: 'C008',
    title: 'Video First/Last Difference',
    outcome: 'success',
    task: 'first-last-frame',
    models: ['seedance', 'veo', 'kling'],
    problem: '首尾差異過大導致視頻跳場景、換臉、換服裝或突然切鏡。',
    method: '按 micro/small/medium/large 控制動作幅度；短時長使用 micro/small。',
    reusableRule: '時長越短，首尾差異越小；多事件要拆成多鏡頭。',
    appMapping: ['生成器', 'QA 檢查', '模型導出'],
    tags: ['video', 'keyframe', 'motion-scale', 'continuity'],
    nextAction: '增加 duration x motion-scale 自動建議。'
  },
  {
    id: 'C009',
    title: 'Character Sheet Layout',
    outcome: 'success',
    task: 'character-card',
    models: ['gpt-image-2', 'seedream', 'gemini-image'],
    problem: '角色卡若只是單張漂亮圖，不能支撐後續一致性。',
    method: '主視覺 + 三視圖 + 局部特寫 + 色卡 + 配飾 + 材質細節。',
    reusableRule: '角色卡要是 production bible，而不是單張海報。',
    appMapping: ['生成器', '模型導出', '案例庫'],
    tags: ['character', 'identity', 'sheet', 'wardrobe', 'accessories'],
    nextAction: '做角色卡布局模板和欄位化輸出。'
  },
  {
    id: 'C010',
    title: 'Dance / Body Knowledge Gap',
    outcome: 'mixed',
    task: 'dance-body',
    models: ['seedance', 'kling', 'veo'],
    problem: '肢體、胸部/軟組織、流體、微表情資料散在 AGY/Claude；prompt 若只寫自然舞蹈會僵硬。',
    method: '用 Laban、kinetic chain、breath、cloth/hair follow-through、tasteful soft-body realism 轉為可選 prompt profiles。',
    reusableRule: '高風險自然運動需要專門知識包與實測，不靠單一形容詞。',
    appMapping: ['表演與物理增強', 'QA 檢查', '模型導出', '案例庫'],
    tags: ['dance', 'body', 'kinetic-chain', 'soft-body', 'physics', 'microexpression'],
    nextAction: '建立 dance/body 模型對照實測卡。'
  }
];

const PROMPT_TEMPLATES = [
  {
    id: 'T001',
    title: 'Natural Lipsync Close-up',
    mode: 'video',
    task: 'lipsync',
    bestModels: ['seedance', 'veo'],
    useCase: '短台詞、低聲呢喃、MV 開口前後的自然口型。',
    qaFocus: ['mouth/jaw/breath', 'no exaggerated mouth shapes', 'face identity'],
    seoIntent: 'AI lipsync prompt template',
    defaults: {
      targetModel: 'seedance',
      ratio: '16:9',
      duration: '8 seconds',
      motionScale: 'micro',
      motionProfile: 'none',
      expressionProfile: 'lipsync-natural',
      physicsProfile: 'optical-reflection',
      subject: '同一位成年角色，臉部身份保持一致，近景對白鏡頭，眼神穩定看向鏡頭。',
      action: '0-1s 安靜吸氣；1-4s 說出一句很短的低聲台詞；4-6s 嘴唇自然閉合，眼神保留情緒。',
      scene: '安靜室內夜景，背景簡潔，沒有多餘人物。',
      camera: '85mm close-up, shallow depth of field, focus stays on eyes and mouth.',
      light: 'soft key light, small corneal catchlight, gentle rim light.',
      style: 'cinematic intimate dialogue, realistic skin texture.',
      details: 'mouth, jaw, breath and throat movement must stay natural and restrained.',
      constraints: 'no exaggerated mouth shapes, no random talking, no subtitles, no face morph, no watermark.'
    }
  },
  {
    id: 'T002',
    title: 'R&B Dance Body Performance',
    mode: 'video',
    task: 'dance-body',
    bestModels: ['seedance', 'kling', 'veo'],
    useCase: '克制、時尚、可公開的慢節奏 R&B 肢體律動。',
    qaFocus: ['kinetic chain', 'weight shift', 'cloth/hair follow-through', 'tasteful framing'],
    seoIntent: 'AI dance video prompt template',
    defaults: {
      targetModel: 'seedance',
      ratio: '9:16',
      duration: '15 seconds',
      motionScale: 'medium',
      motionProfile: 'dance-rnb',
      expressionProfile: 'soft-shyness',
      physicsProfile: 'tasteful-soft-body',
      subject: '同一位成年時尚舞者，服裝合體，臉部身份保持一致。',
      action: '0-3s 肩頸慢速啟動；3-8s 核心帶動上半身水波律動；8-12s 重心從左腳轉到右腳；12-15s 手伸向鏡頭完成循環。',
      scene: '夜間公寓或小型舞台，背景乾淨，有城市燈光虛化。',
      camera: 'one continuous handheld shot, camera keeps face and full movement visible.',
      light: 'warm soft room light with cool city rim light.',
      style: 'real phone camera realism, tasteful fashion MV feeling.',
      details: 'hair and fabric follow movement with 0.2s delay; breathing-driven thoracic motion stays natural.',
      constraints: 'adult subject, tasteful framing, no vulgar framing, no scene jump, no body deformation, no watermark.'
    }
  },
  {
    id: 'T003',
    title: 'First / Last Frame Continuity',
    mode: 'video',
    task: 'first-last-frame',
    bestModels: ['seedance', 'veo'],
    useCase: '短視頻首尾幀差異控制，避免跳場景、換臉、換服裝。',
    qaFocus: ['identity continuity', 'motion scale', 'no scene jump'],
    seoIntent: 'AI video first last frame prompt',
    defaults: {
      targetModel: 'seedance',
      ratio: '16:9',
      duration: '5 seconds',
      motionScale: 'small',
      motionProfile: 'kinetic-chain',
      expressionProfile: 'tension-composure',
      physicsProfile: 'gravity-inertia',
      subject: '同一位角色，髮型、服裝、道具和臉部身份完全不變。',
      action: '0-2s 保持初始姿態；2-5s 只完成一個小幅動作，視線從道具移到鏡頭。',
      scene: '同一個室內場景，光線方向和物件位置不變。',
      camera: 'locked-off medium close-up, no camera cut.',
      light: 'consistent key light and rim light across the full clip.',
      style: 'cinematic realism, stable continuity.',
      details: 'only eyes, hand and breath change slightly; clothing and props stay fixed.',
      constraints: 'no scene jump, no face morph, no wardrobe change, no extra fingers, no subtitles.'
    }
  },
  {
    id: 'T004',
    title: 'Product Photo Reference Lock',
    mode: 'image',
    task: 'product-photo',
    bestModels: ['nova', 'gpt-image-2'],
    useCase: '商品主圖、商業攝影、材質/Logo/包裝保真。',
    qaFocus: ['reference fidelity', 'logo', 'exact shape', 'material'],
    seoIntent: 'AI product photo prompt template',
    defaults: {
      targetModel: 'nova',
      ratio: '4:5',
      motionProfile: 'none',
      expressionProfile: 'none',
      physicsProfile: 'optical-reflection',
      subject: '參考圖中的同一款商品，形狀、比例、Logo、瓶身/包裝結構必須完全一致。',
      action: '靜物商品主圖，產品正面朝向鏡頭，賣點清晰但不要亂生成文字。',
      scene: '乾淨商業攝影棚背景，少量道具襯托產品用途。',
      camera: '70mm product photography, centered composition, crisp edges.',
      light: 'large softbox reflection, controlled highlights, clean shadow.',
      style: 'premium commercial product photography, realistic material.',
      details: 'exact logo placement, exact cap shape, exact label color, material surface and reflections.',
      constraints: 'no random text, no redesigned logo, no shape change, no watermark, no deformation.'
    }
  },
  {
    id: 'T005',
    title: 'A+ Infographic Hero',
    mode: 'image',
    task: 'aplus-page',
    bestModels: ['gpt-image-2', 'gemini-image'],
    useCase: '亞馬遜/電商 A+ 賣點首圖和功能信息圖。',
    qaFocus: ['text discipline', 'hierarchy', 'conversion logic'],
    seoIntent: 'Amazon A+ content prompt',
    defaults: {
      targetModel: 'gpt-image-2',
      ratio: '16:9',
      motionProfile: 'none',
      expressionProfile: 'none',
      physicsProfile: 'optical-reflection',
      subject: '同一款商品作為主角，保留真實形狀、材質、Logo 和包裝比例。',
      action: 'A+ 首屏信息圖：左側 hero product，右側 3 個功能賣點，底部一條使用場景證據。',
      scene: '乾淨電商詳情頁視覺背景，留白充足。',
      camera: 'front-facing product layout, readable infographic hierarchy.',
      light: 'bright commercial lighting, subtle material reflections.',
      style: 'premium ecommerce infographic, clean editorial layout.',
      details: '只使用指定文案；賣點需要短句；圖標簡潔；產品最大最清晰。',
      constraints: 'no random text, no fake brand, no clutter, no watermark, no product deformation.'
    }
  },
  {
    id: 'T006',
    title: 'Character Production Sheet',
    mode: 'image',
    task: 'character-card',
    bestModels: ['gpt-image-2', 'seedream', 'gemini-image'],
    useCase: '後續多圖/視頻一致性的角色 DNA 卡。',
    qaFocus: ['identity', 'hair', 'face', 'wardrobe', 'accessories'],
    seoIntent: 'AI character sheet prompt',
    defaults: {
      targetModel: 'gpt-image-2',
      ratio: '16:9',
      motionProfile: 'none',
      expressionProfile: 'hard-resolve',
      physicsProfile: 'optical-reflection',
      subject: '同一位角色，明確臉型、髮型、眼睛、膚色、身形、服裝和配飾。',
      action: '角色設定板：主視覺 + 正面/側面/背面三視圖 + 眼睛/髮型/配飾/衣料細節。',
      scene: '乾淨 production bible 背景，淺灰分區。',
      camera: 'wide character design board, orthographic side panels.',
      light: 'neutral studio lighting, material highlights controlled.',
      style: 'cinematic realistic character sheet, production-ready.',
      details: 'Face / Hair / Eyes / Wardrobe / Accessories / Palette sections.',
      constraints: 'no face drift, no extra limbs, no random brand text, no cartoon, no watermark.'
    }
  },
  {
    id: 'T007',
    title: 'Cinematic MV Shot',
    mode: 'video',
    task: 'mv-shot',
    bestModels: ['seedance', 'veo'],
    useCase: '8 秒 MV 近景情緒鏡頭，眼神、嘴角、運鏡和光線同步。',
    qaFocus: ['performance layer', 'camera rhythm', 'no random singing mouth'],
    seoIntent: 'AI music video prompt template',
    defaults: {
      targetModel: 'seedance',
      ratio: '16:9',
      duration: '8 seconds',
      motionScale: 'small',
      motionProfile: 'laban-glide',
      expressionProfile: 'lipsync-natural',
      physicsProfile: 'cloth-hair-follow',
      subject: '同一位主角，髮型、服裝、配飾保持一致，坐在夜間室內場景。',
      action: '0-3s 低頭看道具；3-6s 緩慢抬眼看向鏡頭；6-8s 嘴唇微張像要唱出第一句。',
      scene: '雨夜私人酒廊，窗外霓虹反射，背景簡潔。',
      camera: '85mm close-up, slow dolly push-in, focus stays on eyes and lips.',
      light: 'warm key light with cool neon rim light.',
      style: 'cinematic MV stillness, modern noir, restrained emotion.',
      details: 'eye change happens before mouth movement; hair and fabric follow with slight delay.',
      constraints: 'no scene jump, no face morph, no exaggerated singing mouth, no subtitles, no watermark.'
    }
  },
  {
    id: 'T008',
    title: 'Xianxia Establishing Shot',
    mode: 'image',
    task: 'storyboard',
    bestModels: ['seedream', 'gemini-image'],
    useCase: '國風仙俠大場景建置，冷暖對撞、體積光、物理重量感。',
    qaFocus: ['anti-CG materials', 'scale', 'atmospheric depth'],
    seoIntent: 'xianxia AI prompt template',
    defaults: {
      targetModel: 'seedream',
      ratio: '16:9',
      motionProfile: 'none',
      expressionProfile: 'none',
      physicsProfile: 'optical-reflection',
      subject: '遠景中的主角站在巨大風化石台上，人物很小但輪廓清楚。',
      action: '極遠景建置鏡頭，展示龐大仙俠山門、白色花樹、遠處深紅寒緋櫻形成冷暖對撞。',
      scene: '高山雲霧、風化木石、巨型懸崖、晨光穿透濃霧。',
      camera: 'extreme wide establishing shot, immense scale, deep atmospheric perspective.',
      light: 'early morning light piercing dense fog, powerful Tyndall effect.',
      style: 'cinematic Chinese fantasy, physical material weight, no cheap CG.',
      details: 'weathered stone and wood textures, warm silver palette, red blossom contrast.',
      constraints: 'no plastic CG, no over-saturated game art, no floating architecture, no watermark.'
    }
  },
  {
    id: 'T009',
    title: 'Seedance 15 秒五段分鏡',
    mode: 'video',
    task: 'storyboard',
    bestModels: ['seedance'],
    useCase: '15 秒短片的標準五段時間軸：開場→發展→高潮→轉折→收尾，每段含景別與運鏡。',
    qaFocus: ['每段必含景別+運鏡', '動作寫慢不寫快', '面部與場景跨段一致', '片段銜接方式明確'],
    seoIntent: 'Seedance storyboard timeline prompt template',
    defaults: {
      targetModel: 'seedance',
      ratio: '16:9',
      duration: '15 seconds',
      motionScale: 'small',
      motionProfile: 'none',
      expressionProfile: 'none',
      physicsProfile: 'cloth-hair-follow',
      subject: '【風格】電影級寫實風格，15 秒，16:9 橫屏，溫柔治癒氛圍。主角：25 歲女性，高馬尾，丹鳳眼，冷白皮，白色漢服，神情柔和，面部特徵保持一致。',
      action: '0-3 秒：遠景開場建立場景，鏡頭緩慢推近；3-6 秒：中景，鏡頭橫移引入主體動作；6-10 秒：近景跟鏡頭，核心動作緩慢連貫展開；10-13 秒：特寫，情緒轉折，背景緩慢虛化；13-15 秒：拉鏡頭至全景收尾，漸變轉場。',
      scene: '櫻花林，清晨薄霧，花瓣飄落，空氣中有塵埃浮動，地面有柔和倒影，前景花枝/中景主體/背景遠山分層。',
      camera: '每段標注景別（遠景/中景/近景/特寫/全景）與運鏡（推/橫移/跟/拉/漸變），運鏡速度適中，構圖主體位置一致。',
      light: '晨光逆光 + 柔和輪廓光，暖色調，光源方向和強度保持穩定，無曝光閃爍。',
      style: '電影感，膠片質感，日系治癒。',
      details: '雲層緩慢移動、花瓣飄落軌跡自然、髮絲與裙擺隨動。',
      constraints: '面部特徵保持一致不扭曲；動作流暢連貫無卡頓無瞬移；肢體運動符合物理規律不反關節；鏡頭平滑無抖動；場景元素位置固定不閃爍；陰影投射方向一致。'
    }
  }
];

const MODEL_TEST_SCENARIOS = [
  {
    id: 'S001',
    title: 'Grok Lipsync Risk Probe',
    mode: 'video',
    task: 'lipsync',
    model: 'grok-video',
    risk: 'needs-test',
    purpose: 'Verify whether Grok can align visible mouth/jaw/breath motion with one short spoken line.',
    dimensions: [
      ['Mouth timing', 30],
      ['Jaw restraint', 20],
      ['Identity', 20],
      ['No random talking', 20],
      ['Repeatability', 10]
    ],
    passThreshold: 80,
    evidence: '3/3 runs must show mouth timing inside the intended phrase window.',
    defaults: {
      targetModel: 'grok-video',
      ratio: '16:9',
      duration: '8 seconds',
      motionScale: 'micro',
      motionProfile: 'none',
      expressionProfile: 'lipsync-natural',
      physicsProfile: 'optical-reflection',
      subject: '同一位成年角色，臉部身份保持一致，近景對白測試。',
      action: '0-1s 安靜吸氣；1-4s 說出一句很短的低聲台詞；4-6s 嘴唇自然閉合並停止說話。',
      scene: '簡潔室內背景，沒有其他人物和干擾物。',
      camera: '85mm close-up, focus locked on eyes, mouth and jaw.',
      light: 'soft key light, clear corneal catchlight.',
      style: 'realistic close-up video test, neutral cinematic look.',
      details: 'visible mouth, jaw, breath and throat timing must be inspectable.',
      constraints: 'no exaggerated mouth shapes, no random talking, no subtitles, no face morph, no watermark.'
    }
  },
  {
    id: 'S002',
    title: 'Seedance Lipsync Baseline',
    mode: 'video',
    task: 'lipsync',
    model: 'seedance',
    risk: 'medium',
    purpose: 'Establish a baseline for short visible speech acting.',
    dimensions: [['Mouth timing', 25], ['Jaw restraint', 20], ['Identity', 20], ['Emotion continuity', 20], ['Artifacts', 15]],
    passThreshold: 78,
    evidence: 'At least 2/3 runs keep mouth movement restrained and time-bounded.',
    defaults: {
      targetModel: 'seedance',
      ratio: '16:9',
      duration: '8 seconds',
      motionScale: 'micro',
      motionProfile: 'none',
      expressionProfile: 'lipsync-natural',
      physicsProfile: 'optical-reflection',
      subject: '同一位成年角色，臉部身份保持一致，近景口型基準測試。',
      action: '0-1s 吸氣；1-4s 說一句短台詞；4-8s 停止說話，只保留眼神和呼吸。',
      scene: '安靜室內背景，構圖乾淨。',
      camera: 'close-up, mouth and eyes both visible.',
      light: 'soft cinematic lighting with visible catchlight.',
      style: 'realistic restrained dialogue test.',
      details: 'mouth movement should start after breath prep and stop after the phrase.',
      constraints: 'no random talking, no exaggerated mouth shapes, no subtitles, no watermark.'
    }
  },
  {
    id: 'S003',
    title: 'Dance / Body Physics Probe',
    mode: 'video',
    task: 'dance-body',
    model: 'seedance',
    risk: 'needs-test',
    purpose: 'Compare stiffness, kinetic chain, cloth/hair follow-through, and tasteful soft-body realism.',
    dimensions: [['Kinetic chain', 25], ['Weight shift', 20], ['Secondary motion', 20], ['Identity', 15], ['Tasteful framing', 20]],
    passThreshold: 76,
    evidence: 'No model is trusted until at least 3 clips are scored side-by-side.',
    defaults: PROMPT_TEMPLATES.find((template) => template.id === 'T002').defaults
  },
  {
    id: 'S004',
    title: 'Product Reference Fidelity',
    mode: 'image',
    task: 'product-photo',
    model: 'nova',
    risk: 'low',
    purpose: 'Test whether product shape, logo, packaging and material survive generation.',
    dimensions: [['Shape fidelity', 30], ['Logo fidelity', 25], ['Material', 20], ['Composition', 15], ['Artifact control', 10]],
    passThreshold: 85,
    evidence: 'Any logo/shape redesign is a fail unless redesign was requested.',
    defaults: PROMPT_TEMPLATES.find((template) => template.id === 'T004').defaults
  },
  {
    id: 'S005',
    title: 'First / Last Frame Continuity',
    mode: 'video',
    task: 'first-last-frame',
    model: 'seedance',
    risk: 'medium',
    purpose: 'Test whether small motion preserves identity, wardrobe, props and scene layout.',
    dimensions: [['Identity', 25], ['Scene continuity', 25], ['Action completion', 20], ['Artifact control', 20], ['Repeatability', 10]],
    passThreshold: 80,
    evidence: 'Scene jump or face morph is a hard fail.',
    defaults: PROMPT_TEMPLATES.find((template) => template.id === 'T003').defaults
  },
  {
    id: 'S006',
    title: 'Character Sheet Consistency',
    mode: 'image',
    task: 'character-card',
    model: 'gpt-image-2',
    risk: 'low',
    purpose: 'Test whether a character sheet preserves face, hair, wardrobe, accessories and layout.',
    dimensions: [['Face consistency', 25], ['Layout completeness', 25], ['Wardrobe/accessories', 20], ['Text discipline', 15], ['Style fit', 15]],
    passThreshold: 82,
    evidence: 'Missing side/back views or face drift lowers score below usable.',
    defaults: PROMPT_TEMPLATES.find((template) => template.id === 'T006').defaults
  }
];

const EXAMPLES = {
  image: {
    taskType: 'character-card',
    targetModel: 'gpt-image-2',
    ratio: '16:9',
    motionProfile: 'none',
    expressionProfile: 'hard-resolve',
    physicsProfile: 'optical-reflection',
    subject: '同一位黑髮女性主角，冷白膚色，銀色細耳飾，紅色絲質上衣，眼神冷靜但壓抑，五官與髮型必須保持一致。',
    action: '中性表情，正面主視覺，旁邊包含正面、側面、背面三視圖與眼睛、耳飾、衣料細節。',
    performanceNotes: '主視覺保持沉著堅定的眼神；眼睛需要有乾淨 catchlight，耳飾與真絲高光保持一致。',
    scene: '乾淨的角色設定板背景，淺灰紙面，細網格分區，電影前期設計稿質感。',
    camera: '16:9 wide character design board, main portrait on the left, detail panels on the right, clean orthographic views.',
    light: 'soft studio lighting, neutral color temperature, controlled highlights on silk fabric and earrings.',
    style: 'cinematic character design sheet, premium production bible, realistic editorial rendering, no anime.',
    details: 'Face / Hair / Eyes / Body / Wardrobe / Accessories 分欄；底部色卡；所有文字只作小標籤，不要亂寫品牌。',
    constraints: 'no watermark, no extra limbs, no face drift, no cartoon, no manga, no cheap game splash art.'
  },
  video: {
    taskType: 'mv-shot',
    targetModel: 'seedance',
    ratio: '16:9',
    duration: '8 seconds',
    motionScale: 'small',
    motionProfile: 'laban-glide',
    expressionProfile: 'lipsync-natural',
    physicsProfile: 'cloth-hair-follow',
    subject: '同一位黑髮女性主角，銀色細耳飾，紅色絲質上衣，坐在黑色大理石酒廊吧台前。',
    action: '0-3s 她低頭看酒杯；3-6s 緩慢抬眼看向鏡頭；6-8s 嘴唇微張像要唱出第一句歌詞，右手輕輕收緊酒杯。',
    performanceNotes: '眼神先於嘴型半拍開始變化；肩頸和手指動作都保持克制，髮絲與衣料在抬頭後延遲 0.2 秒跟隨。',
    scene: '雨夜私人酒廊，窗外霓虹在黑色大理石上反射，遠處有模糊酒瓶牆。',
    camera: '85mm close-up, slow dolly push-in, shallow depth of field, focus stays on eyes and lips.',
    light: 'warm key light from camera left, cool blue neon rim light from window, low-key noir contrast.',
    style: 'cinematic MV stillness, ARRI Alexa 65, modern noir, restrained emotional tension.',
    details: '保持耳飾、髮型、上衣、杯子位置一致；嘴型自然，眼神變化細微；玻璃杯水珠和大理石反射要穩。',
    constraints: 'no scene jump, no face morph, no exaggerated singing mouth, no extra fingers, no camera shake, no subtitles, no watermark.'
  }
};

const SOURCE_RADAR_CARDS = [
  {
    id: 'SRC001',
    title: 'Image Generation Knowledge Audit',
    area: 'image',
    status: 'ingested',
    priority: 'high',
    summary: '生圖模型、角色卡、商品圖、A+、國風、VisualForge 和 prompt craft 的高層地圖。',
    insight: '已轉成模型路由、任務模板、商品/角色/A+ 模板和 prompt commons。',
    sources: ['/Users/yinweiqi/Desktop/media_knowledge_audit_20260609/02_IMAGE_GENERATION_KNOWLEDGE_MAP.md'],
    nextAction: '補充 MJ/SD 類模型的公開模板頁與可驗收 QA。',
    tags: ['image', 'model-route', 'prompt-craft']
  },
  {
    id: 'SRC002',
    title: 'Video Production Knowledge Audit',
    area: 'video',
    status: 'ingested',
    priority: 'high',
    summary: '視頻製作、分鏡、首尾幀、模型路由、失敗模式和驗收流程的主索引。',
    insight: '已轉成視頻 builder、Seedance/Veo/Kling 路由、測試矩陣和 QA。',
    sources: ['/Users/yinweiqi/Desktop/video_knowledge_audit_20260609/VIDEO_PRODUCTION_KNOWLEDGE_MAP.md'],
    nextAction: '把實際輸出視頻和評分結果歸檔成 evidence cards。',
    tags: ['video', 'storyboard', 'qa']
  },
  {
    id: 'SRC003',
    title: 'alexG GPT Image 2 Frame Pipeline',
    area: 'methodology',
    status: 'ingested',
    priority: 'high',
    summary: '人物卡、總板、首尾幀、reference lock 和幀圖生產線方法。',
    insight: '已成為 character-card、first-last-frame、identity lock 和 export bundle 的核心規則。',
    sources: ['/Users/yinweiqi/Desktop/alexG/ai-video-storyboard/10-Prompt工程/GPT_Image2_帧图生产线.md'],
    nextAction: '補一個 reference asset schema，讓人物/場景/服裝/商品卡可以被項目化保存。',
    tags: ['gpt-image-2', 'keyframe', 'identity']
  },
  {
    id: 'SRC004',
    title: 'Motion, FACS, Physics System',
    area: 'performance',
    status: 'ingested',
    priority: 'high',
    summary: '肢體、Laban、FACS、口型、重力、布料、流體、反射、慣性等可視化語彙。',
    insight: '已轉成 body/microexpression/physics/lipsync prompt profiles 和 QA。',
    sources: [
      '/Users/yinweiqi/Desktop/alexG/ai-video-storyboard/02-表演系统/肢体语言系统.md',
      '/Users/yinweiqi/Desktop/alexG/ai-video-storyboard/02-表演系统/FACS完整AU映射表.md',
      '/Users/yinweiqi/Desktop/alexG/ai-video-storyboard/06-物理系统/物理常态规则.md'
    ],
    nextAction: '用同一測試矩陣對比 Seedance/Kling/Veo 的肢體與物理穩定性。',
    tags: ['laban', 'facs', 'physics']
  },
  {
    id: 'SRC005',
    title: 'Antigravity Dance And Soft-Body Experiments',
    area: 'performance',
    status: 'partial',
    priority: 'high',
    summary: 'Seedance 舞蹈、音頻、一鏡到底、軟組織真實感和防僵硬實操腳本。',
    insight: '已吸收為克制 soft-body biomechanics、kinetic chain、cloth/hair follow-through 語言。',
    sources: [
      '/Users/yinweiqi/.gemini/antigravity-cli/brain/451bda5b-daa7-49d0-ae8c-b1f145353b56/scratch/run_dance_generation_v4.py',
      '/Users/yinweiqi/.gemini/antigravity-cli/brain/451bda5b-daa7-49d0-ae8c-b1f145353b56/scratch/generate_video_jiggle.py'
    ],
    nextAction: '提取 3-5 個可公開的 dance/body 模板，避免私密或低俗表述。',
    tags: ['dance', 'seedance', 'soft-body']
  },
  {
    id: 'SRC006',
    title: 'Antigravity Prompt Methodology Masterbook',
    area: 'methodology',
    status: 'ingested',
    priority: 'high',
    summary: 'prompt_methodology_masterbook.md、food_prompt_methodology.md 和 prompt filter optimizer 類資料。',
    insight: '已轉成 7 個領域框架（框架指南面板 + Builder 框架感知）、鏡頭焦段表、清洗器三階段審計（垃圾標籤 / 美學動態衝突 / TBS 文字預算）。',
    sources: [
      '/Users/yinweiqi/.gemini/antigravity-ide/brain/408d6cae-f380-424c-8a0c-36c2976a3ee9/prompt_methodology_masterbook.md',
      '/Users/yinweiqi/.gemini/antigravity-ide/scratch/prompt-encyclopedia-llm/prompt_filter_optimizer.md'
    ],
    nextAction: '後續把 food_prompt_methodology 等剩餘檔案按需補充進框架庫。',
    tags: ['prompt_methodology_masterbook', 'distiller', 'filter']
  },
  {
    id: 'SRC007',
    title: 'toapis Image Video Grok Tests',
    area: 'api',
    status: 'needs-test',
    priority: 'high',
    summary: 'test_toapis_image.py、test_toapis_video.py、test_toapis_grok_video.py 類腳本顯示 toapis/Grok 接入線索。',
    insight: '適合規劃 provider connector，但不能把未驗證口型能力寫成產品承諾。',
    sources: [
      '/Users/yinweiqi/.gemini/antigravity-ide/brain/408d6cae-f380-424c-8a0c-36c2976a3ee9/scratch/test_toapis_image.py',
      '/Users/yinweiqi/.gemini/antigravity-ide/brain/408d6cae-f380-424c-8a0c-36c2976a3ee9/scratch/test_toapis_video.py',
      '/Users/yinweiqi/.gemini/antigravity-ide/brain/408d6cae-f380-424c-8a0c-36c2976a3ee9/scratch/test_toapis_grok_video.py'
    ],
    nextAction: '另建 provider connector spec：本地配置、服務端代理、禁止前端暴露 key、任務狀態與錯誤模型。',
    tags: ['toapis', 'grok-video', 'api']
  },
  {
    id: 'SRC008',
    title: 'Prompt Engine And Storyboard Previs',
    area: 'video',
    status: 'partial',
    priority: 'medium',
    summary: 'prompt_engine.py、prompt_dashboard.html、storyboard_previs.md、12-panel/keyframe prompt engine 等素材。',
    insight: '可補強鏡頭級 prompt 編譯器、分鏡預覽和多鏡頭一致性。',
    sources: ['/Users/yinweiqi/.gemini/antigravity-cli/brain/451bda5b-daa7-49d0-ae8c-b1f145353b56/prompt_engine.py'],
    nextAction: '抽出 prompt 編譯流程，做成 shot-pack builder spec。',
    tags: ['prompt-engine', 'storyboard', 'keyframe']
  },
  {
    id: 'SRC009',
    title: 'Seedance Storyboard Template Packs',
    area: 'template',
    status: 'ingested',
    priority: 'medium',
    summary: 'Seedance 2.0 分镜提示词生成专家、分鏡表格、短視頻腳本表和 AI 視頻模板資料包。',
    insight: '已轉成 SEEDANCE 分鏡框架（八模塊+景別/運鏡速查表）、模板庫 T009、公開 SEO 頁。',
    sources: ['/Users/yinweiqi/Desktop/人物卡 2/分镜运镜提示词＋AI指令整理/分镜提示词合集/Seedance 2.0 分镜提示词生成专家.md'],
    nextAction: '同目錄 300+電影風格.csv 與 300 條分鏡 xlsx 留給 bulk-template-mining spec。',
    tags: ['Seedance 2.0 分镜提示词生成专家', 'template', 'seo']
  },
  {
    id: 'SRC013',
    title: 'Cinematic Style Prompt CSV (300)',
    area: 'template',
    status: 'ingested',
    priority: 'medium',
    summary: '《300+电影风格提示词.csv》：影視風格/畫面質感/燈光色調/攝影手法/平台風格 5 類 × 60 條。',
    insight: '已由 scripts/gen_styles_data.py 生成 app/styles_data.js，落地為風格庫面板 + public/styles.html SEO 頁。',
    sources: ['/Users/yinweiqi/Desktop/人物卡 2/分镜运镜提示词＋AI指令整理/分镜提示词合集/300+电影风格提示词.csv'],
    nextAction: '同目錄 XLSX 組合矩陣與即夢 700+ 指令合集待偵察（bulk-template-mining 候選）。',
    tags: ['cinematic-style', 'csv', 'style-library']
  },
  {
    id: 'SRC010',
    title: 'Product And Ecommerce Prompt Files',
    area: 'image',
    status: 'partial',
    priority: 'medium',
    summary: '機車手套、勞力士、白底亞馬遜、商品 detail/video showcase 等商品實操提示詞。',
    insight: '可補 product fidelity、platform constraints、A+ 信息圖和商品視頻 builder。',
    sources: [
      '/Users/yinweiqi/Desktop/机车手套_AI自适应_prompt.txt',
      '/Users/yinweiqi/Desktop/rolex_ai_adaptive_prompt.txt',
      '/Users/yinweiqi/Desktop/红色上衣白底_亚马逊_prompt.txt'
    ],
    nextAction: '把商品圖模板拆成主圖、場景圖、A+、短視頻四個子任務。',
    tags: ['product', 'amazon', 'a-plus']
  },
  {
    id: 'SRC011',
    title: 'MatrixForge And OPCMF Video Lab',
    area: 'productization',
    status: 'partial',
    priority: 'medium',
    summary: 'Video Lab、prompt assets、video director、image intent、prompt distillation 和工具箱產品化參考。',
    insight: '可作架構參考，但新項目不回填到舊 repo。',
    sources: [
      '/Users/yinweiqi/Desktop/MatrixForge_United/internal/modules/video_lab/video_director.go',
      '/Users/yinweiqi/Desktop/opcmf/docs/architecture/prompt-distillation-method.md'
    ],
    nextAction: '提煉成 provider/job/asset 的架構藍圖，不複製舊實現。',
    tags: ['matrixforge', 'videolab', 'architecture']
  },
  {
    id: 'SRC012',
    title: 'AILB Media And API Docs',
    area: 'api',
    status: 'partial',
    priority: 'high',
    summary: 'ailb-media skill、Seedream/Gemini Image API、providers 路由和資產庫經驗。',
    insight: '未來要接 API 時應走服務端代理或本地私有模式，不能在 public 前端放 key。',
    sources: [
      '/Users/yinweiqi/workspace/company-skills/ailb-media/SKILL.md',
      '/Users/yinweiqi/Desktop/AILB_API_文档/03_seedream.md',
      '/Users/yinweiqi/Desktop/AILB_API_文档/11_gemini_image.md'
    ],
    nextAction: '建立 API connector blueprint，拆清本地版、公開版、付費版的邊界。',
    tags: ['ailb', 'seedream', 'gemini-image', 'asset-library']
  }
];

const KNOWLEDGE_GAPS = [
  {
    id: 'GAP001',
    title: 'Grok Lipsync Benchmark',
    area: 'video',
    priority: 'critical',
    risk: 'needs-test',
    whyItMatters: '用戶已指出 Grok 沒有對口型，產品不能把它列為可靠 lipsync 模型。',
    nextAction: '用同一角色、同一句短台詞、同一鏡頭，對比 Grok/Seedance/Veo/Kling，每個模型至少 3 次。',
    doneWhen: '有評分表、輸出證據、失敗模式和路由結論。',
    tags: ['grok-video', 'lipsync', 'benchmark']
  },
  {
    id: 'GAP002',
    title: 'toapis / AILB Provider Connector Blueprint',
    area: 'api',
    priority: 'high',
    risk: 'security',
    whyItMatters: '後續要從提示詞工具箱進化為生成工作台，但 public 前端不能暴露 API key。',
    nextAction: '設計本地私有模式、服務端代理模式、任務隊列、錯誤回放和成本日誌。',
    doneWhen: '有 connector spec、接口草圖、錯誤模型和隱私邊界。',
    tags: ['toapis', 'ailb', 'provider']
  },
  {
    id: 'GAP003',
    title: 'Reference Asset Schema',
    area: 'productization',
    priority: 'high',
    risk: 'workflow',
    whyItMatters: '角色卡、場景卡、商品圖、首尾幀都需要可重用資產錨點。',
    nextAction: '定義 asset metadata：type、model、prompt、source image、usage rights、identity lock、QA notes。',
    doneWhen: 'bundle export 和 memory card 都能引用 asset id。',
    tags: ['asset-library', 'memory-card', 'reference-lock']
  },
  {
    id: 'GAP004',
    title: 'Prompt Provenance Labels',
    area: 'methodology',
    priority: 'medium',
    risk: 'quality',
    whyItMatters: '同一 prompt 可能來自模板、案例、記憶卡、人工輸入和模型 adapter，需要知道來源。',
    nextAction: '為 export bundle 增加 provenance section。',
    doneWhen: '匯出內容可追溯每個 prompt block 的來源。',
    tags: ['provenance', 'export', 'audit']
  },
  {
    id: 'GAP005',
    title: 'SEO Template Cluster Expansion',
    area: 'template',
    priority: 'medium',
    risk: 'growth',
    whyItMatters: '公開站變現依賴長尾模板頁，但目前只有少量模板頁。',
    nextAction: '從 source radar 中的模板包抽 10 個 public pages。',
    doneWhen: '至少 10 個可索引模板頁，且能回流 app。',
    tags: ['seo', 'template', 'growth']
  },
  {
    id: 'GAP006',
    title: 'Evidence Archive For Model Claims',
    area: 'video',
    priority: 'high',
    risk: 'trust',
    whyItMatters: '模型能力必須從「感覺好用」變成有測試、分數和樣例。',
    nextAction: '建立 evidence card 格式：model、prompt、reference、output path、score、failure notes。',
    doneWhen: '測試矩陣每個場景至少有一張 evidence card。',
    tags: ['evidence', 'scorecard', 'model-test']
  }
];

const MODEL_LOGIC_NOTES = {
  models: [
    {
      name: 'DALL-E 3 / GPT Image',
      language: '自然語言描述',
      points: [
        '擅長理解連貫句子與語境，後台會把短提示詞重寫成幾百字詳細描述。',
        '像向畫家口述畫面一樣寫，不要寫代碼式標籤。',
        '避雷：不要堆 8k / hyper-realistic / trending on artstation，會誘發蠟像感渲染圖；用具體物理細節（35mm film grain、visible skin pores）代替「寫實」。'
      ]
    },
    {
      name: 'Midjourney',
      language: '結構化短語 + 參數',
      points: [
        '偏好具體名詞、風格形容詞與相機型號（如 Hasselblad）。',
        '強依賴後綴參數：--ar 寬高比、--style raw 降低預設美化、--stylize 0-1000 藝術化程度、--chaos 0-100 多樣性。',
        '要故事感必須手動補背景與光影描述，不會像 DALL-E 自動擴寫。'
      ]
    }
  ],
  examples: [
    {
      input: 'A cat',
      dalle: '自動擴寫成有故事感的畫面（窗台、秋葉、晨光、鬍鬚）。',
      mj: '直接生成藝術質感的貓但缺故事背景，需手動補光影與環境。'
    },
    {
      input: '8k, hyper-realistic, masterpiece, portrait of a man',
      dalle: '被垃圾標籤誤導，生成皮膚完美的蠟像感 3D 塑料假人。',
      mj: '生成修圖過度的商業廣告肖像，缺乏人文紀實感。'
    },
    {
      input: 'Candid close-up, 35mm film grain, visible skin pores, Rembrandt side lighting',
      dalle: '精準還原皮膚紋理毛孔與自然明暗，高水準真實照片。',
      mj: '膠片質感、細節纖毫畢現、大師級光影的寫實肖像。'
    }
  ]
};

const LENS_GUIDE = [
  { range: '14mm - 18mm 超廣角', traits: '張力透視畸變、深景深、宏大空間感', scenes: '自然風光（WIND）、粗獷建築（SPACE）、科幻巨型都市（VOID）' },
  { range: '24mm - 35mm 廣角', traits: '保留環境背景的人文視角、強故事感', scenes: '紀實人像、室內全景、街頭攝影' },
  { range: '50mm 標準', traits: '最接近人眼視角、無畸變、平實親切', scenes: '室內家居、日常人像、桌上美食特寫' },
  { range: '85mm - 105mm 中焦', traits: '經典肖像焦段、壓縮背景、奶油虛化', scenes: '人像特寫（FACE）、食物或產品商業擺拍（PROD）' },
  { range: '135mm - 200mm 長焦', traits: '強背景壓縮、景深極淺、主體背景徹底剝離', scenes: '野生動物、壓縮的遠處山峰' }
];

const PROMPT_FRAMEWORKS = [
  {
    id: 'plate',
    name: 'PLATE 美食框架',
    domain: '美食與餐飲攝影',
    forModes: ['image'],
    slots: [
      { letter: 'P', label: 'Product 主體', hint: '食物精確組成與擺盤：半熟蛋黃流動的拉麵、帶焦痕的厚切和牛' },
      { letter: 'L', label: 'Layout & Location 場景', hint: '容器與背景桌面：啞光板岩盤、胡桃木桌面、背景模糊的紅酒杯' },
      { letter: 'A', label: 'Angle & Lens 角度', hint: '斜45度 Hero Shot 適合漢堡蛋糕；俯視 flat-lay 適合沙拉多碟' },
      { letter: 'T', label: 'Texture & State 質感', hint: '水分溫度表面狀態：condensation 冷凝水珠、steam rising 熱氣' },
      { letter: 'E', label: 'Energy & Lighting 光影', hint: '高檔餐廳用 moody side-light；早午餐用 soft window light' }
    ],
    styleLine: 'Commercial food photography: replace abstract adjectives with physical states (steam rising, condensation droplets, glistening glaze), 45-degree hero shot or overhead flat-lay, shallow depth of field, warm side spotlight creating dramatic shadows.',
    before: 'A plate of delicious chocolate cake, realistic, food photography, 8k, detailed',
    after: 'Macro close-up shot of a molten chocolate lava cake on a matte black ceramic plate. Rich liquid chocolate flows out from the center, topped with a single fresh raspberry and a delicate dusting of powdered sugar. Rustic dark walnut table background. Steam rising slightly. Shot at a 45-degree angle, shallow depth of field, warm side spotlight creating dramatic shadows, commercial food photography style.',
    analysis: [
      '抽象的 delicious / realistic 換成動態描述（liquid chocolate flows out）與物理特徵（powdered sugar、raspberry）。',
      'matte black ceramic plate + dark walnut table 構建高檔視覺對比。',
      'warm side spotlight + shallow depth of field 替代無效 8k 標籤，消除塑料感。'
    ],
    cheatSheet: [
      { group: '主體質感', targetField: 'subject', words: [
        { en: 'crispy golden crust', zh: '金黃焦脆外皮' },
        { en: 'glistening glaze', zh: '閃亮淋醬' },
        { en: 'oozing yolk', zh: '流沙蛋黃' },
        { en: 'tender medium-rare center', zh: '柔嫩三分熟核心' }
      ] },
      { group: '容器背景', targetField: 'scene', words: [
        { en: 'handcrafted stoneware bowl', zh: '手工粗陶碗' },
        { en: 'brushed copper pan', zh: '拉絲銅鍋' },
        { en: 'linen napkin', zh: '亞麻餐巾' },
        { en: 'scattered rosemary leaves', zh: '散落迷迭香葉' }
      ] },
      { group: '動態狀態', targetField: 'action', words: [
        { en: 'steam wisps rising', zh: '裊裊升騰熱氣' },
        { en: 'condensation droplets on a cold glass', zh: '冷飲杯冷凝水珠' },
        { en: 'delicate wine reduction drizzle', zh: '紅酒還原汁淋醬' }
      ] }
    ]
  },
  {
    id: 'face',
    name: 'FACE 人像框架',
    domain: '真人與肖像攝影',
    forModes: ['image', 'video'],
    slots: [
      { letter: 'F', label: 'Format & Medium 媒介', hint: '定義物理相片類型：35mm film photograph、candid photo；避開 photorealistic' },
      { letter: 'A', label: 'Actor & Attributes 角色', hint: '年齡、服飾、表情，特別是皮膚瑕疵：pores 毛孔、laugh lines 笑紋、freckles 雀斑' },
      { letter: 'C', label: 'Camera & Technique 鏡頭', hint: '85mm lens、50mm prime lens、shallow depth of field' },
      { letter: 'E', label: 'Environment & Lighting 環境光影', hint: 'Rembrandt lighting 側光、自然散射光、背景融入' }
    ],
    styleLine: 'Candid photographic portrait, not CGI: 35mm film grain, natural skin texture with visible pores, imperfect human details, 50mm or 85mm prime lens, shallow depth of field, soft Rembrandt or diffused natural daylight, authentic color grading.',
    before: 'A beautiful girl, 18 years old, photorealistic, super details, 8k, trending on artstation',
    after: 'A candid portrait of a young woman in her late teens, taken on a bustling, out-of-focus city street corner. She has natural skin texture with visible pores and light freckles across her nose. A wispy strand of hair falls slightly over her eyes, showing a soft, neutral expression. Shot on a 50mm lens with shallow depth of field, 35mm film grain, soft diffused natural daylight from the overcast sky, authentic color grading.',
    analysis: [
      'beautiful 這種主觀詞換成客觀狀態與神態（neutral expression、wispy strand of hair）。',
      '刻意加入 visible pores / light freckles，強迫模型調用真實皮膚紋理訓練集，移除蠟像感。',
      '35mm film grain + soft diffused natural daylight 提供寫實膠片顆粒與自然光。'
    ],
    cheatSheet: [
      { group: '面部細節', targetField: 'subject', words: [
        { en: 'fine wrinkles around the eyes', zh: '眼角細紋' },
        { en: 'subtle graying stubble', zh: '隱約灰色胡茬' },
        { en: 'natural skin sheen', zh: '自然皮膚光澤' },
        { en: 'imperfect teeth alignment', zh: '非完美整齊牙齒' }
      ] },
      { group: '衣著神態', targetField: 'action', words: [
        { en: 'chunky knit wool sweater', zh: '粗針織羊毛衣' },
        { en: 'looking slightly away from the camera', zh: '視線微偏離鏡頭' },
        { en: 'in mid-conversation', zh: '交談瞬間' }
      ] },
      { group: '光影格調', targetField: 'light', words: [
        { en: 'soft Rembrandt lighting', zh: '柔和倫勃朗三角光' },
        { en: 'golden hour rim-light', zh: '黃金時刻輪廓光' },
        { en: 'hazy backlight', zh: '朦朧逆光' }
      ] }
    ]
  },
  {
    id: 'space',
    name: 'SPACE 空間框架',
    domain: '建築與室內空間',
    forModes: ['image'],
    slots: [
      { letter: 'S', label: 'Structure & Style 結構風格', hint: '極簡主義、清水混凝土粗獷主義 Brutalism、北歐日式 Japandi' },
      { letter: 'P', label: 'Position & Perspective 透視', hint: '兩點透視 two-point perspective、廣角、鳥瞰 bird’s-eye view' },
      { letter: 'A', label: 'Anchor Materials 材質', hint: 'bare concrete 清水混凝土、terrazzo 水磨石、brushed brass 黃銅拉絲、warm oak 溫暖橡木' },
      { letter: 'C', label: 'Cohesion of Colors 色彩', hint: '冷灰色系、莫蘭迪色系、中性大地色調' },
      { letter: 'E', label: 'Energy & Lighting 光影', hint: '天井斑駁陽光、線條光、暮色金色光芒' }
    ],
    styleLine: 'Architectural photography: two-point perspective with straight vertical lines, anchor materials creating warm-cool contrast (bare concrete with warm oak), morning sunlight casting long soft shadows, architectural digest style.',
    before: 'Living room design, modern style, realistic render, 8k, v-ray',
    after: 'Wide-angle interior photograph of a modern Japandi living room. Features bare concrete walls, warm oak furniture, and a low-profile linen sofa. A tall fiddle-leaf fig plant stands in a terracotta pot. Two-point perspective, sharp focus. Bright morning sunlight filters through large floor-to-ceiling windows, casting long, soft shadows on the polished concrete floor, architectural digest style.',
    analysis: [
      '去除 realistic render / v-ray 渲染器標籤，改用 interior photograph + architectural digest style 引導真實照片數據。',
      'two-point perspective 保證縱向牆面線條垂直平行，去除廣角邊角畸變。',
      'bare concrete × warm oak 冷暖對比 + 長柔影營造空間進深。'
    ],
    cheatSheet: [
      { group: '結構元素', targetField: 'scene', words: [
        { en: 'soaring double-height ceiling', zh: '挑高雙倍天花板' },
        { en: 'exposed wooden rafters', zh: '裸露木質椽木' },
        { en: 'cantilevered floating staircase', zh: '懸臂懸浮樓梯' }
      ] },
      { group: '高檔材質', targetField: 'details', words: [
        { en: 'ribbed frosted glass', zh: '條紋磨砂玻璃' },
        { en: 'honed travertine tile', zh: '啞光洞石瓷磚' },
        { en: 'matte black steel frames', zh: '啞光黑鋼框' }
      ] },
      { group: '光照光影', targetField: 'light', words: [
        { en: 'slanted shadows from window frames', zh: '窗框傾斜陰影' },
        { en: 'glowing concealed light strips', zh: '暗藏發光燈帶' },
        { en: 'warm wash illumination', zh: '暖色洗牆光' }
      ] }
    ]
  },
  {
    id: 'prod',
    name: 'PROD 商拍框架',
    domain: '產品與電商商拍',
    forModes: ['image'],
    slots: [
      { letter: 'P', label: 'Product & Packaging 產品包裝', hint: '磨砂玻璃瓶、金屬拉絲瓶蓋，強調容器光澤' },
      { letter: 'R', label: 'Representative Background 背景', hint: '懸浮水滴、粗糙水泥底座、波紋亞克力板' },
      { letter: 'O', label: 'Optics & Angle 光學視角', hint: '微距特寫、refracted light 折射光、rim light 邊緣光' },
      { letter: 'D', label: 'Direction of Light 布光', hint: '三點布光、high-key 高調光、或戲劇性陰影' }
    ],
    styleLine: 'Commercial studio product shot: macro lens sharp focus, three-point lighting with a bright rim light separating the product silhouette from the background, tactile stone pedestal, refracted light caustic patterns, water droplets for freshness.',
    before: 'Perfume bottle, professional photography, studio light, clean background',
    after: 'Professional commercial studio shot of a frosted amber glass serum bottle, standing on a wet, rough basalt stone pedestal. Water droplets cling to the bottle. Background features a soft-focused pastel peach background with refracted light caustic patterns on the surface. Sharp focus, macro lens style. Studio three-point lighting with a bright rim light highlighting the bottle’s elegant silhouette.',
    analysis: [
      'clean background 具體化為帶折射焦散光斑的粉桃色背景。',
      'basalt stone pedestal + water droplets 創造真實觸覺對比。',
      'rim light 勾勒瓶身輪廓，是玻璃瓶與暗背景分離的關鍵商業技術。'
    ],
    cheatSheet: [
      { group: '產品質感', targetField: 'subject', words: [
        { en: 'translucent colored glass', zh: '半透明彩色玻璃' },
        { en: 'brushed anodized aluminum', zh: '拉絲陽極氧化鋁' },
        { en: 'embossed metallic foil lettering', zh: '壓花金屬箔字' }
      ] },
      { group: '背景道具', targetField: 'scene', words: [
        { en: 'rough-hewn travertine block', zh: '粗鑿洞石磚' },
        { en: 'gently rippling water surface', zh: '微波水面' },
        { en: 'floating air bubbles', zh: '懸浮氣泡' }
      ] },
      { group: '光學效果', targetField: 'light', words: [
        { en: 'dramatic light refraction', zh: '強烈光線折射' },
        { en: 'prismatic rainbow light dispersion', zh: '稜鏡彩虹分光' },
        { en: 'soft shadow gradients', zh: '柔和漸變陰影' }
      ] }
    ]
  },
  {
    id: 'wind',
    name: 'WIND 風光框架',
    domain: '風光與自然攝影',
    forModes: ['image', 'video'],
    slots: [
      { letter: 'W', label: 'Weather & Atmosphere 天氣大氣', hint: 'Tyndall effect 耶穌光、morning mist 晨霧、暴風雨前夕' },
      { letter: 'I', label: 'Image Composition 構圖', hint: '三分法、leading lines 對角引導、mirror reflection 水面倒影' },
      { letter: 'N', label: 'Nature’s Time & Seasons 時間季節', hint: 'blue hour 藍調、golden hour 黃金時刻、秋葉、冬霜' },
      { letter: 'D', label: 'Depth & Lenses 焦段濾鏡', hint: '14mm 超廣角、long exposure 長曝光絲綢水流、polarizing filter 偏振鏡' }
    ],
    styleLine: 'Landscape photography: golden or blue hour, Tyndall light beams through atmosphere, mirror reflection on water, long exposure silky water texture, ultra-wide 14mm lens, deep depth of field, high contrast.',
    before: 'Beautiful forest lake, mountain in background, sun rays, realistic, landscape',
    after: 'Landscape photograph of a misty pine forest in the Swiss Alps during the autumn golden hour. Rays of Tyndall light beam through the forest canopy, illuminating rising fog. A crystal clear alpine lake in the foreground perfectly mirrors the colorful foliage and distant snow-capped mountain peaks. Long exposure water texture. Shot on an ultra-wide 14mm lens, deep depth of field, high contrast.',
    analysis: [
      'beautiful / sun rays 換成最具大氣質感的 Tyndall 光束穿透林冠。',
      'mirror reflection + long exposure water texture 讓前景湖水呈絲綢般靜謐。',
      'ultra-wide 14mm 提供視覺衝擊的遠景透視，雪山更宏偉。'
    ],
    cheatSheet: [
      { group: '大氣特效', targetField: 'light', words: [
        { en: 'wispy morning valley fog', zh: '山谷裊裊晨霧' },
        { en: 'dramatic incoming storm clouds', zh: '壓境暴風雨雲' },
        { en: 'dusty sunbeams', zh: '帶塵埃陽光束' }
      ] },
      { group: '地貌景觀', targetField: 'scene', words: [
        { en: 'jagged snow-capped peaks', zh: '崎嶇雪峰' },
        { en: 'dense alpine evergreen canopy', zh: '高山常綠林冠' },
        { en: 'moss-covered basalt rocks', zh: '青苔玄武岩' }
      ] },
      { group: '拍攝參數', targetField: 'camera', words: [
        { en: 'polarizing filter to remove glare', zh: '偏振鏡消眩光' },
        { en: 'ND filter long exposure', zh: '減光鏡長曝光' },
        { en: 'infinite hyperfocal distance', zh: '超焦距對焦' }
      ] }
    ]
  },
  {
    id: 'art',
    name: 'ART 插畫框架',
    domain: '動漫與插畫風格',
    forModes: ['image'],
    slots: [
      { letter: 'A', label: 'Aesthetic & School 風格流派', hint: 'Ghibli watercolor、Makoto Shinkai、retro cyberpunk、claymation 黏土' },
      { letter: 'R', label: 'Render & Textures 渲染筆觸', hint: 'watercolor wash 水彩暈染、impasto 厚塗、clean vector lines 向量線條' },
      { letter: 'T', label: 'Theme & Palette 主題配色', hint: 'macaron pastel 馬卡龍、vibrant neon 高飽和霓虹、duotone 雙色調' }
    ],
    styleLine: 'Stylized illustration: name the exact school (Ghibli watercolor / Makoto Shinkai / retro cel anime), specify brush texture (watercolor wash, visible paper grain) and an explicit color palette, hand-drawn look with soft glow effect.',
    before: 'Anime girl, train station, shinkai makoto style, high quality',
    after: 'Beautiful anime illustration in the style of Makoto Shinkai. A lonely girl stands on a train platform under a vast, cinematic summer sky filled with fluffy cumulus clouds and radiating sunset light beams. Vivid blue and orange color palette. Soft glow effect, hand-drawn look, masterfully detailed background.',
    analysis: [
      'high quality 具體化為畫家標誌性光影：radiating sunset light beams + fluffy cumulus clouds。',
      '明確指定新海誠式 vivid blue and orange 配色。',
      'hand-drawn look + soft glow 避免線條生硬的數位向量感。'
    ],
    cheatSheet: [
      { group: '畫風流派', targetField: 'style', words: [
        { en: 'vintage 90s hand-cel anime aesthetic', zh: '復古90年代賽璐珞' },
        { en: 'classic Ghibli tempera painting', zh: '經典吉卜力蛋彩' },
        { en: 'minimalist line-art illustration', zh: '極簡線條插畫' }
      ] },
      { group: '筆觸質感', targetField: 'details', words: [
        { en: 'visible textured paper grain', zh: '可見紙張紋理' },
        { en: 'rough charcoal sketch strokes', zh: '粗糙炭筆筆觸' },
        { en: 'smooth airbrush gradients', zh: '平滑噴槍漸變' }
      ] },
      { group: '色彩色調', targetField: 'light', words: [
        { en: 'analog retro color grading', zh: '模擬復古調色' },
        { en: 'highly saturated pastel neon', zh: '高飽和馬卡龍霓虹' },
        { en: 'monochromatic ink wash', zh: '單色水墨暈染' }
      ] }
    ]
  },
  {
    id: 'void',
    name: 'VOID 科幻框架',
    domain: '科幻與概念設計',
    forModes: ['image', 'video'],
    slots: [
      { letter: 'V', label: 'Vehicle & Vessel 載具機械', hint: '星際戰艦、外骨骼、發光賽博義體接口' },
      { letter: 'O', label: 'Out-of-this-world Terrain 異界地貌', hint: 'twin moons 雙子月、bioluminescent flora 發光孢子森林、巨型浮岩' },
      { letter: 'I', label: 'Illumination & Energy 發光能量', hint: 'holographic display 全息、neon reflection 霓虹倒影、激光束' },
      { letter: 'D', label: 'Dramatic Scale 宏大比例', hint: 'megastructure 巨構 + tiny silhouette 微小人影襯托宏偉' }
    ],
    styleLine: 'Sci-fi concept art: dramatic scale contrast with a tiny lone figure for scale, volumetric lighting, rain-slicked asphalt reflecting neon, alien terrain elements in the sky, cinematic epic mood.',
    before: 'Sci-fi city, giant spaceship, cyber, neon lights',
    after: 'Sci-fi concept art of a colossal futuristic city gateway. A tiny lone traveler stands in the foreground, looking at the towering carbon-fiber arches glowing with blue energy lines. Rain-slicked wet asphalt reflecting neon signs. Twin giant gas planets visible in the dusty indigo night sky. Cinematic scale, volumetric lighting, epic mood.',
    analysis: [
      'towering arches × tiny lone traveler 的場景對照瞬間建立史詩比例感。',
      'neon lights 換成寫實光學反射：雨濕瀝青反射霓虹招牌。',
      'volumetric lighting + 靛藍夜空氣態行星營造沉浸異星氛圍。'
    ],
    cheatSheet: [
      { group: '科幻元素', targetField: 'subject', words: [
        { en: 'cybernetic nerve interface connectors', zh: '神經接口連接器' },
        { en: 'massive orbital elevator cable', zh: '軌道電梯纜繩' },
        { en: 'plasma exhaust trails', zh: '等離子尾跡' }
      ] },
      { group: '異界景色', targetField: 'scene', words: [
        { en: 'desolate crimson iron-oxide dunes', zh: '紅褐氧化鐵沙丘' },
        { en: 'floating heavy magnetic ore islands', zh: '浮空磁石島' },
        { en: 'towering bioluminescent glowing fungi', zh: '發光巨型真菌' }
      ] },
      { group: '氛圍特效', targetField: 'light', words: [
        { en: 'retro-futurism analog look', zh: '復古未來主義' },
        { en: 'volumetric searchlight beams', zh: '體積探照燈束' },
        { en: 'distressed metallic erosion textures', zh: '斑駁金屬侵蝕' }
      ] }
    ]
  },
  {
    id: 'seedance-storyboard',
    name: 'SEEDANCE 分鏡框架',
    domain: 'AI 視頻分鏡 / 時間軸提示詞',
    forModes: ['video'],
    slots: [
      { letter: '1', label: '風格定位', hint: '【風格】主風格 + 秒數 + 畫幅 + 整體氛圍，第一行快速定基調' },
      { letter: '2', label: '主體描述', hint: '追求穩和精：身份+外貌+服飾+表情+穩定性約束，忌空泛形容詞' },
      { letter: '3', label: '場景環境', hint: '追求空間深度：定位+時間天氣+交互細節，前景/中景/背景分層' },
      { letter: '4', label: '動作行為', hint: '追求慢和連貫：動詞優先+狀態描述，寫慢不寫快，避免多步驟動作' },
      { letter: '5', label: '鏡頭語言', hint: '景別+運鏡+角度+速度+焦點，寫得越細越好' },
      { letter: '6', label: '光影氛圍', hint: '逆光/側光/倫勃朗光/體積光/丁達爾效應 + 暖冷色調' },
      { letter: '7', label: '風格參考', hint: '電影感/導演風格（王家衛、諾蘭、宮崎駿）/藝術風格/年代質感' },
      { letter: '8', label: '約束詞', hint: '主體/場景/動作/鏡頭/光影五類穩定性約束' }
    ],
    styleLine: 'Timeline rule: every time segment must state a shot size (wide/full/medium/close-up/extreme close-up) and a camera move or transition (push-in/pull-out/pan/track/hard cut/fade/dissolve); write motion slow and continuous, avoid multi-step actions; keep face identity, scene elements, light direction and framing consistent across segments.',
    before: '一個女孩在櫻花樹下跳舞，唯美，高清，電影感',
    after: '【風格】電影級寫實風格，15 秒，16:9 橫屏，溫柔治癒氛圍\n【時間軸】0-3 秒：遠景，櫻花林全貌，鏡頭緩慢推近，花瓣飄落，少女背影靜立；3-6 秒：中景，鏡頭橫移，少女抬手接住一片花瓣，裙擺隨風輕擺；6-10 秒：近景跟鏡頭，她開始緩慢旋轉，動作連貫流暢，髮絲自然飄動；10-13 秒：特寫，臉部微笑，眼神柔和，背景虛化成粉色光斑；13-15 秒：拉鏡頭至全景收尾，漸變轉場，她停在原地仰望花瓣雨\n【約束】面部特徵保持一致、動作流暢無瞬移、鏡頭平滑無抖動、光源方向穩定',
    analysis: [
      '第一行【風格】快速鎖定基調：風格+秒數+畫幅+氛圍。',
      '每段時間軸必帶景別與運鏡，畫面描述具體（花瓣、裙擺、髮絲）。',
      '動作全部寫慢（緩慢推近、緩慢旋轉），高速動作易導致畫面崩壞。',
      '尾部用五類穩定性約束鎖住主體/動作/鏡頭/光影。'
    ],
    cheatSheet: [
      { group: '身份外貌（穩和精）', targetField: 'subject', words: [
        { en: '丹鳳眼，眼角微微上翹', zh: '眼型' },
        { en: '冷白皮，皮膚紋理清晰', zh: '膚色質感' },
        { en: '高馬尾，髮絲分明', zh: '髮型' },
        { en: '劍眉，眉峰高挑', zh: '眉形' },
        { en: '面部特徵保持一致，不扭曲', zh: '穩定性約束' }
      ] },
      { group: '場景交互細節', targetField: 'scene', words: [
        { en: '飄落的櫻花', zh: '動態元素' },
        { en: '空氣中有塵埃浮動', zh: '空氣質感' },
        { en: '地面有倒影', zh: '反射層次' },
        { en: '清晨薄霧', zh: '時間天氣' },
        { en: '深夜霓虹', zh: '時間天氣' },
        { en: '前景花枝、中景主體、背景遠山', zh: '空間分層' }
      ] },
      { group: '運鏡組合', targetField: 'camera', words: [
        { en: '遠景開場，鏡頭緩慢推近', zh: '開場' },
        { en: '中景橫移跟隨', zh: '發展' },
        { en: '近景跟鏡頭', zh: '跟隨' },
        { en: '360 度環繞拍攝', zh: '炫技' },
        { en: '航拍俯瞰', zh: '宏觀' },
        { en: '慢動作升格', zh: '強調' },
        { en: '背景緩慢虛化', zh: '焦點' },
        { en: '拉鏡頭收尾，漸變轉場', zh: '收尾' }
      ] },
      { group: '穩定性約束', targetField: 'constraints', words: [
        { en: '動作流暢連貫無卡頓無瞬移', zh: '動作' },
        { en: '肢體運動符合物理規律不反關節', zh: '物理' },
        { en: '鏡頭平滑無抖動，運鏡速度適中', zh: '鏡頭' },
        { en: '場景元素位置固定，背景不閃爍', zh: '場景' },
        { en: '光源方向和強度保持穩定', zh: '光影' },
        { en: '構圖主體位置一致不跑出畫面', zh: '構圖' }
      ] }
    ],
    lookupTables: [
      {
        title: '景別速查',
        rows: [
          { term: '遠景', desc: '展現廣闊空間，環境為主', when: '開場建立場景' },
          { term: '全景', desc: '人物全身，環境完整', when: '展示人物與環境關係' },
          { term: '中景', desc: '人物膝蓋以上', when: '日常對話、動作展示' },
          { term: '近景', desc: '人物胸部以上', when: '表情變化、情緒傳遞' },
          { term: '特寫', desc: '臉部/局部細節', when: '強調情緒、關鍵物品' },
          { term: '主觀視角', desc: '角色第一人稱視角', when: '沉浸感、緊張感' }
        ]
      },
      {
        title: '運鏡 / 轉場速查',
        rows: [
          { term: '推鏡頭', desc: '攝像機向前推進', when: '強調主體、靠近' },
          { term: '拉鏡頭', desc: '攝像機向後拉遠', when: '展示環境、遠離' },
          { term: '搖鏡頭', desc: '攝像機左右/上下搖動', when: '展示環境、跟隨' },
          { term: '移鏡頭', desc: '攝像機橫向移動', when: '展示空間、跟隨' },
          { term: '跟鏡頭', desc: '攝像機跟隨主體移動', when: '跟隨運動' },
          { term: '環繞', desc: '圍繞主體 360 度旋轉', when: '展示主體、炫酷' },
          { term: '升降', desc: '攝像機上升/下降', when: '展示高度變化' },
          { term: '硬切', desc: '直接切換', when: '節奏緊張' },
          { term: '漸變', desc: '淡入淡出', when: '情緒過渡' },
          { term: '疊化', desc: '畫面重疊過渡', when: '時間流逝' },
          { term: '黑場轉場', desc: '黑屏過渡', when: '場景轉換' },
          { term: '升格', desc: '慢動作', when: '強調動作' },
          { term: '降格', desc: '快動作', when: '時間壓縮' }
        ]
      }
    ]
  }
];

const AUDIT_RULES = {
  junkTags: [
    { pattern: '\\b8k\\b', label: '8k', reason: '誘發低質感渲染圖與塑料感', replaceWith: '35mm film grain' },
    { pattern: 'hyper-?realistic', label: 'hyper-realistic', reason: '誘發蠟像感假人', replaceWith: 'candid photo, visible skin pores' },
    { pattern: '\\bmasterpiece\\b', label: 'masterpiece', reason: '無效堆砌詞，稀釋注意力', replaceWith: null },
    { pattern: 'trending on artstation', label: 'trending on artstation', reason: '誘發遊戲渲染風而非攝影感', replaceWith: null },
    { pattern: '\\bv-?ray\\b', label: 'v-ray', reason: '渲染器標籤誘發 CGI 塑料感', replaceWith: 'interior photograph, architectural digest style' },
    { pattern: 'realistic render(?:ing)?', label: 'realistic render', reason: '渲染器語彙與真實照片數據集衝突', replaceWith: 'photograph' },
    { pattern: 'photo-?realistic', label: 'photorealistic', reason: '抽象詞無效，應改具體物理細節', replaceWith: 'visible skin pores, natural skin texture' },
    { pattern: '\\bsuper details?\\b', label: 'super details', reason: '無效堆砌詞', replaceWith: null },
    { pattern: '\\bbest quality\\b', label: 'best quality', reason: '無效堆砌詞', replaceWith: null },
    { pattern: '\\bultra[- ]?detailed\\b', label: 'ultra-detailed', reason: '無效堆砌詞', replaceWith: null }
  ],
  conflicts: [
    {
      id: 'wabi-vs-3d', phase: 1, name: '侘寂/禪意 × 3D立體高光字',
      sideA: ['wabi-sabi', 'wabi sabi', 'zen', 'washi', '侘寂', '禪意'],
      sideB: ['3d-extruded', '3d extruded', 'heavy bevel', '3d text', 'glossy text', '3d立體'],
      principle: '粗糙紙張（和紙棉紙）物理上無光且平面，3D 立體字在訓練集中關聯塑料金屬高光',
      action: '把 3D 字降維為 flat minimalist / serif debossed（二維扁平或壓印字）'
    },
    {
      id: 'film-vs-cgi', phase: 1, name: '復古膠片 × CGI 渲染感',
      sideA: ['film grain', '35mm', 'candid', 'retro film', 'kodak', '膠片'],
      sideB: ['v-ray', 'vray', 'cgi', 'octane render', 'unreal engine', '3d render'],
      principle: '膠片顆粒與 CGI 渲染光澤互斥，混用產生不倫不類的質感',
      action: '刪除渲染器標籤，保留 candid camera photo / 35mm film grain'
    },
    {
      id: 'brutalist-vs-gold', phase: 1, name: '粗野主義 × 奢華金飾',
      sideA: ['brutalist', 'brutalism', 'bare concrete', '粗野主義'],
      sideB: ['gold foil', 'luxury filigree', 'gold filigree', 'gilded ornament', '金箔', '奢華金'],
      principle: '二者不可共存於同一區塊',
      action: '以粗野為主則金飾降維為啞光鐵灰；以奢華為主則混凝土改 polished marble/travertine'
    },
    {
      id: 'serene-vs-motion', phase: 2, name: '靜謐人文 × 動態模糊/放射光',
      sideA: ['serene', 'calm', 'quiet', 'peaceful', 'tranquil', '靜謐', '寧靜'],
      sideB: ['motion blur', 'radial burst', 'radial light burst', 'speed lines', '動態模糊', '放射光'],
      principle: '靜態儀式感場景需要淺景深與自然散射光，運動特效摧毀寧靜進深感',
      action: '刪除 motion blur / radial burst，改用 natural sunbeam rays（自然陽光斜射）'
    },
    {
      id: 'flat-vs-volumetric', phase: 2, name: '扁平插畫 × 體積光/立體陰影',
      sideA: ['flat vector', 'flat illustration', 'flat 2d', 'flat design', '扁平'],
      sideB: ['volumetric lighting', 'volumetric light', 'chiaroscuro', '體積光'],
      principle: '扁平化插畫中不應出現體積光',
      action: '把 volumetric lighting 改為 flat 2D color blocking（平鋪色塊）'
    }
  ],
  tbs: {
    budget: 6,
    classes: [
      { type: '主品牌詞', score: 2, hint: '如 "KURA"、"SONG"' },
      { type: '大標題', score: 3, hint: '如 "18 HOUR SLOW BREW"' },
      { type: '小標題/副標題', score: 4, hint: '如 "Curated Simplicity"' },
      { type: '步驟說明', score: 5, hint: '如 "1. Pour, 2. Add"' },
      { type: '評價/段落文字', score: 6, hint: '如 "Smoothest I have had."' }
    ],
    placeholders: ['typographical placeholder lines', 'indecipherable clean technical lettering', 'lorem ipsum text lines']
  }
};

const NAV_GROUPS = [
  { label: '創作', panels: [
    { id: 'builder', label: '生成器' },
    { id: 'distiller', label: '清洗器' },
    { id: 'templates', label: '模板庫' },
    { id: 'memory', label: '記憶卡' },
    { id: 'history', label: '歷史' }
  ] },
  { label: '知識', panels: [
    { id: 'frameworks', label: '框架指南' },
    { id: 'styles', label: '風格庫' },
    { id: 'routes', label: '模型路由' },
    { id: 'cases', label: '案例庫' },
    { id: 'sources', label: '知識雷達' }
  ] },
  { label: '質檢與導出', panels: [
    { id: 'adapters', label: '模型導出' },
    { id: 'tests', label: '測試矩陣' },
    { id: 'qa', label: 'QA 檢查' },
    { id: 'export', label: '匯出' }
  ] }
];

const HISTORY_STORAGE_KEY = 'mpf_prompt_history_v1';
const HISTORY_LIMIT = 50;

export {
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
  HISTORY_STORAGE_KEY,
  HISTORY_LIMIT,
  MODEL_LOGIC_NOTES,
  LENS_GUIDE,
  PROMPT_FRAMEWORKS,
  AUDIT_RULES
};
