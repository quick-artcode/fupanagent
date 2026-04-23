const models = [
  { id: "gpt-4o", name: "GPT-4o", desc: "多模态理解", tag: "适合录音复盘" },
  { id: "gpt-4.1", name: "GPT-4.1", desc: "结构化分析", tag: "适合深度总结" },
  { id: "claude-35", name: "Claude 3.5", desc: "长文本整理", tag: "适合逐字稿梳理" }
];

const root = document.getElementById("root");

const state = {
  screen: "home",
  selectedModel: "gpt-4o",
  activeSheet: "",
  audioFile: "",
  jdText: "",
  resumeText: "",
  isAnalyzing: false,
  scoreValue: 86,
  scoreLabel: "推荐得分"
};

let analyzingTimers = [];

function setState(patch) {
  Object.assign(state, patch);
  renderApp();
}

function clearAnalyzingTimers() {
  analyzingTimers.forEach((id) => window.clearTimeout(id));
  analyzingTimers = [];
}

function canAnalyze() {
  return Boolean(state.audioFile && (state.jdText.trim() || state.resumeText.trim()));
}

function setSelectedModel(modelId) {
  setState({ selectedModel: modelId, activeSheet: "" });
}

function startPreviewAnalysis() {
  if (!canAnalyze()) {
    setState({ activeSheet: "input" });
    return;
  }

  clearAnalyzingTimers();
  setState({ isAnalyzing: true, scoreLabel: "分析中", screen: "loading" });

  const nextScore =
    state.selectedModel === "gpt-4o"
      ? 88
      : state.selectedModel === "gpt-4.1"
        ? 91
        : 87;

  analyzingTimers.push(
    window.setTimeout(() => {
      setState({ scoreValue: nextScore, scoreLabel: "初步结果" });
    }, 900)
  );

  analyzingTimers.push(
    window.setTimeout(() => {
      setState({ isAnalyzing: false, scoreLabel: "推荐得分", screen: "report" });
    }, 1900)
  );
}

function renderTopBar() {
  return `
    <div class="top-bar">
      <div class="top-left">
        <div class="brand-mini"></div>
        <div>
          <p class="tiny-label">AI Interview Review</p>
          <h1>面试复盘 Agent</h1>
        </div>
      </div>
    </div>
  `;
}

function renderModelPicker() {
  return `
    <section class="stack-section">
      <div class="section-head">
        <span>模型选择</span>
      </div>
      <div class="model-picker">
        ${models
          .map(
            (model) => `
              <button
                class="model-card ${state.selectedModel === model.id ? "active" : ""}"
                data-model-id="${model.id}"
                type="button"
              >
                <div class="model-card-top">
                  <strong>${model.name}</strong>
                  <em>${model.desc}</em>
                </div>
                <small>${model.tag}</small>
              </button>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderHeroCard() {
  const activeModel = models.find((item) => item.id === state.selectedModel) || models[0];
  return `
    <section class="hero-card hero-card-refined single-page">
      <div class="ambient-blur blur-a"></div>
      <div class="ambient-blur blur-b"></div>
      <div class="hero-badge">Single Page Demo</div>
      <h2>把录音、岗位要求和简历信息压缩进一页完成复盘</h2>

      <div class="hero-visual short ${state.isAnalyzing ? "analyzing" : ""}">
        <div class="hero-orb"></div>
        <div class="hero-wave back"></div>
        <div class="hero-wave front"></div>
        <div class="scan-line"></div>
        <div class="signal-card signal-main">
          <strong>${activeModel.name}</strong>
          <span>${activeModel.desc}</span>
        </div>
        <div class="signal-card signal-sub">
          <strong>${state.scoreValue}</strong>
          <span>${state.scoreLabel}</span>
        </div>
      </div>

      <div class="hero-mini-stats">
        <span>${state.audioFile ? "已上传录音" : "待上传录音"}</span>
        <span>${state.jdText.trim() ? "已填 JD" : "待填 JD"}</span>
        <span>${state.resumeText.trim() ? "已填简历" : "待填简历"}</span>
      </div>

      <div class="hero-inline-actions">
        <button class="ghost-btn" data-action="nav" data-target="history" type="button">历史记录</button>
        <button class="primary-btn inline" data-action="nav" data-target="upload" type="button">开始复盘</button>
      </div>
    </section>
  `;
}

function renderHistoryCard() {
  return `
    <section class="stack-section">
      <div class="section-head">
        <span>历史记录</span>
      </div>
      <article class="feature-panel">
        <div class="feature-row">
          <strong>第三轮模拟</strong>
          <span>86 分</span>
        </div>
        <div class="feature-row">
          <strong>第二轮模拟</strong>
          <span>81 分</span>
        </div>
        <div class="feature-row">
          <strong>首轮模拟</strong>
          <span>78 分</span>
        </div>
      </article>
    </section>
  `;
}

function renderUploadPage() {
  return `
    ${renderTopBar()}
    <section class="stack-section">
      <div class="section-head">
        <span>上传配置</span>
      </div>
      <label class="upload-block">
        <input hidden id="audioInput" type="file" accept=".mp3,.wav,.m4a" />
        <span class="upload-caption">面试录音</span>
        <strong>${state.audioFile || "点击上传音频文件"}</strong>
        <small>支持 mp3 / wav / m4a</small>
      </label>

      <div class="sheet-field">
        <label for="jdInput">JD 信息</label>
        <textarea id="jdInput" placeholder="粘贴岗位 JD，帮助系统理解考察标准。">${escapeHtml(state.jdText)}</textarea>
      </div>

      <div class="sheet-field">
        <label for="resumeInput">简历信息</label>
        <textarea id="resumeInput" placeholder="粘贴简历或项目背景，帮助系统做更准确的评价。">${escapeHtml(state.resumeText)}</textarea>
      </div>

      <div class="sheet-tip ${canAnalyze() ? "ready" : ""}">
        ${canAnalyze() ? "资料已就绪，可以开始复盘。" : "请上传音频，并填写 JD 或简历中的至少一项。"}
      </div>
    </section>

    <div class="hero-inline-actions page-actions">
      <button class="ghost-btn" data-action="nav" data-target="home" type="button">返回首页</button>
      <button class="primary-btn inline" data-action="start-preview" type="button">${state.isAnalyzing ? "分析中..." : "开始分析"}</button>
    </div>
  `;
}

function renderHistoryPage() {
  return `
    ${renderTopBar()}
    <section class="stack-section">
      <div class="section-head">
        <span>历史记录</span>
      </div>
      <article class="feature-panel">
        <div class="feature-row">
          <strong>第三轮模拟</strong>
          <span>项目深挖 · 86 分</span>
        </div>
        <div class="feature-row">
          <strong>第二轮模拟</strong>
          <span>简历追问 · 81 分</span>
        </div>
        <div class="feature-row">
          <strong>首轮模拟</strong>
          <span>项目总览 · 78 分</span>
        </div>
      </article>
    </section>
    <div class="hero-inline-actions page-actions">
      <button class="ghost-btn" data-action="nav" data-target="home" type="button">返回首页</button>
    </div>
  `;
}

function renderLoadingPage() {
  return `
    ${renderTopBar()}
    <section class="loading-page">
      <div class="loader-core"></div>
      <h2>正在分析本次面试</h2>
      <p>系统正在处理录音、对齐岗位要求并生成结构化复盘。</p>
      <div class="loading-steps">
        <div class="loading-step active"><span></span><strong>音频转写中</strong></div>
        <div class="loading-step active"><span></span><strong>知识检索中</strong></div>
        <div class="loading-step"><span></span><strong>结构化评分中</strong></div>
      </div>
    </section>
  `;
}

function renderReportPage() {
  const activeModel = models.find((item) => item.id === state.selectedModel) || models[0];
  return `
    ${renderTopBar()}
    <section class="stack-section">
      <div class="section-head">
        <span>复盘结果</span>
      </div>
      <article class="hero-card report-card">
        <div class="report-head">
          <div>
            <p class="tiny-label">AI Model</p>
            <h2>${activeModel.name}</h2>
          </div>
          <div class="report-score">${state.scoreValue}</div>
        </div>
        <p>回答结构完整，项目亮点真实，建议继续加强商业化表达和技术细节边界。</p>
        <div class="report-tags">
          <span>7维能力评估</span>
          <span>逐字稿批改</span>
          <span>结构化建议</span>
        </div>
      </article>

      <article class="feature-panel">
        <div class="feature-row">
          <strong>上传录音</strong>
          <span>${state.audioFile || "未上传"}</span>
        </div>
        <div class="feature-row">
          <strong>JD 信息</strong>
          <span>${state.jdText.trim() ? "已填写" : "未填写"}</span>
        </div>
        <div class="feature-row">
          <strong>简历信息</strong>
          <span>${state.resumeText.trim() ? "已填写" : "未填写"}</span>
        </div>
      </article>
    </section>
    <div class="hero-inline-actions page-actions">
      <button class="ghost-btn" data-action="nav" data-target="home" type="button">返回首页</button>
      <button class="primary-btn inline" data-action="nav" data-target="history" type="button">查看历史</button>
    </div>
  `;
}

function renderModelSheet() {
  return `
    <div class="sheet-mask" data-action="close-sheet">
      <div class="bottom-sheet" onclick="event.stopPropagation()">
        <div class="sheet-handle"></div>
        <div class="sheet-header">
          <h3>选择 AI 模型</h3>
          <button class="text-link" data-action="close-sheet" type="button">关闭</button>
        </div>
        <div class="sheet-model-list">
          ${models
            .map(
              (model) => `
                <button class="sheet-model-item ${state.selectedModel === model.id ? "active" : ""}" data-model-id="${model.id}" type="button">
                  <div>
                    <strong>${model.name}</strong>
                    <p>${model.desc}</p>
                  </div>
                  <span>${model.tag}</span>
                </button>
              `
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function renderInputSheet() {
  return `
    <div class="sheet-mask" data-action="close-sheet">
      <div class="bottom-sheet input-sheet" onclick="event.stopPropagation()">
        <div class="sheet-handle"></div>
        <div class="sheet-header">
          <h3>输入资料</h3>
          <button class="text-link" data-action="close-sheet" type="button">关闭</button>
        </div>

        <label class="upload-block">
          <input hidden id="audioInput" type="file" accept=".mp3,.wav,.m4a" />
          <span class="upload-caption">面试录音</span>
          <strong>${state.audioFile || "点击上传音频文件"}</strong>
          <small>支持 mp3 / wav / m4a</small>
        </label>

        <div class="sheet-field">
          <label for="jdInput">JD 信息</label>
          <textarea id="jdInput" placeholder="粘贴岗位 JD，帮助系统理解考察标准。">${escapeHtml(state.jdText)}</textarea>
        </div>

        <div class="sheet-field">
          <label for="resumeInput">简历信息</label>
          <textarea id="resumeInput" placeholder="粘贴简历或项目背景，帮助系统做更准确的评价。">${escapeHtml(state.resumeText)}</textarea>
        </div>

        <div class="sheet-footer">
          <span class="sheet-tip ${canAnalyze() ? "ready" : ""}">
            ${canAnalyze() ? "资料已就绪，可以开始复盘。" : "请上传音频，并填写 JD 或简历中的至少一项。"}
          </span>
        </div>
      </div>
    </div>
  `;
}

function renderSheet() {
  if (state.activeSheet === "models") return renderModelSheet();
  if (state.activeSheet === "input") return renderInputSheet();
  return "";
}

function renderHomePage() {
  return `
    ${renderTopBar()}
    ${renderModelPicker()}
    ${renderHeroCard()}
    ${renderHistoryCard()}
  `;
}

function renderScreen() {
  if (state.screen === "upload") return renderUploadPage();
  if (state.screen === "history") return renderHistoryPage();
  if (state.screen === "loading") return renderLoadingPage();
  if (state.screen === "report") return renderReportPage();
  return renderHomePage();
}

function renderApp() {
  root.innerHTML = `
    <div class="mobile-shell">
      <div class="phone-frame compact-page">
        <div class="status-bar">
          <span>9:41</span>
          <span>5G</span>
        </div>
        <main class="app-screen single-page-layout">
          ${renderScreen()}
        </main>
      </div>
      ${renderSheet()}
    </div>
  `;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

document.addEventListener("click", (event) => {
  const modelButton = event.target.closest("[data-model-id]");
  if (modelButton) {
    setSelectedModel(modelButton.dataset.modelId);
    return;
  }

  const actionNode = event.target.closest("[data-action]");
  if (!actionNode) return;

  const action = actionNode.dataset.action;
  const sheet = actionNode.dataset.sheet;

  if (action === "open-sheet") {
    setState({ activeSheet: sheet });
    return;
  }

  if (action === "nav") {
    setState({ screen: actionNode.dataset.target });
    return;
  }

  if (action === "close-sheet") {
    setState({ activeSheet: "" });
    return;
  }

  if (action === "start-preview") {
    startPreviewAnalysis();
  }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "audioInput") {
    setState({ audioFile: event.target.files?.[0]?.name || "" });
  }
});

document.addEventListener("input", (event) => {
  if (event.target.id === "jdInput") {
    setState({ jdText: event.target.value });
    return;
  }
  if (event.target.id === "resumeInput") {
    setState({ resumeText: event.target.value });
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.activeSheet) {
    setState({ activeSheet: "" });
  }
});

renderApp();
