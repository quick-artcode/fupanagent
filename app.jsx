const { useEffect, useMemo, useState } = React;

const abilityData = [
  { label: "业务感知", score: 88 },
  { label: "技术理解", score: 79 },
  { label: "逻辑思维", score: 90 },
  { label: "沟通表达", score: 84 },
  { label: "产品落地", score: 93 },
  { label: "商业思维", score: 74 },
  { label: "创新能力", score: 81 }
];

const iterationData = [
  { stage: "首轮", accuracy: 78, match: 69 },
  { stage: "二轮", accuracy: 86, match: 81 },
  { stage: "三轮", accuracy: 94, match: 92 }
];

const transcriptAnnotations = [
  {
    id: "mark-1",
    type: "red",
    text: "我们主要是做了一个 Agent，然后用户觉得还不错，效果提升也挺大。",
    detail:
      "问题类型：红线 - 量化与归因缺失\n错误原因：没有说明用户是谁、效果提升如何衡量。\n标准表达：补充“7维能力评估体系覆盖90%+ PM面试高频考察维度，用户满意度提升45%”。\n改进建议：采用“问题-方案-结果-复盘”四段式回答。"
  },
  {
    id: "mark-2",
    type: "yellow",
    text: "RAG 这块我们就接了知识库，然后模型自己判断。",
    detail:
      "问题类型：黄线 - 技术表达空泛\n错误原因：缺少检索召回、重排、判断边界等关键设计点。\n标准表达：说明通过知识库检索、提示词约束和双模型协同提升判断准确率。\n改进建议：明确“先召回岗位标准，再由Scout标注风险点，Coach输出结构化评分”。"
  },
  {
    id: "mark-3",
    type: "yellow",
    text: "后来我们又优化了几轮，所以准确率就上来了。",
    detail:
      "问题类型：黄线 - 迭代过程不具体\n错误原因：没交代每轮优化动作与验证结果。\n标准表达：三轮迭代分别优化提示词、知识库检索逻辑和评分校准机制。\n改进建议：配合“78%提升到94%”给出对应措施。"
  },
  {
    id: "mark-4",
    type: "red",
    text: "简历解析基本没什么问题，反正系统都能识别。",
    detail:
      "问题类型：红线 - 绝对化表达\n错误原因：使用“都能识别”这类措辞容易被追问真实性。\n标准表达：简历解析准确率达92%，并通过字段纠错和模板补全提升稳定性。\n改进建议：多用带边界的指标，少用绝对词。"
  },
  {
    id: "mark-5",
    type: "yellow",
    text: "整体来说这个项目就是帮助用户更快准备面试。",
    detail:
      "问题类型：黄线 - 用户价值描述单薄\n错误原因：没有把“更快”具体化。\n标准表达：帮助用户自动识别知识错误、定位答题薄弱点、生成针对性建议，平均减少50%的面试准备时间。\n改进建议：把价值拆成效率、精准度、满意度三层来讲。"
  }
];

const historyRecords = [
  {
    id: "r3",
    title: "第三轮模拟 / 项目深挖场景",
    date: "2026-02-18 20:30",
    score: 86,
    summary: "落地强，商业化表达仍有提升空间"
  },
  {
    id: "r2",
    title: "第二轮模拟 / 简历追问场景",
    date: "2026-02-02 19:00",
    score: 81,
    summary: "结构更清晰，技术解释仍偏浅"
  },
  {
    id: "r1",
    title: "首轮模拟 / 项目总览场景",
    date: "2026-01-15 21:15",
    score: 78,
    summary: "经历真实，但量化表达不足"
  }
];

function App() {
  const [screen, setScreen] = useState("home");
  const [reportTab, setReportTab] = useState("overview");
  const [showHelp, setShowHelp] = useState(false);
  const [audioFile, setAudioFile] = useState("");
  const [jdText, setJdText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [progressStep, setProgressStep] = useState(-1);
  const [filter, setFilter] = useState("all");
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [radarAnimated, setRadarAnimated] = useState(false);

  const canAnalyze = audioFile && (jdText.trim() || resumeText.trim());
  const completion = Math.round((abilityData.reduce((sum, item) => sum + item.score, 0) / abilityData.length) * 10) / 10;

  useEffect(() => {
    if (screen !== "loading") {
      return undefined;
    }

    setProgressStep(0);
    const timeouts = [0, 900, 1800, 2700].map((delay, index) =>
      window.setTimeout(() => setProgressStep(index), delay)
    );
    const done = window.setTimeout(() => {
      setScreen("report");
      setReportTab("overview");
      setRadarAnimated(true);
    }, 4200);

    return () => {
      timeouts.forEach(window.clearTimeout);
      window.clearTimeout(done);
    };
  }, [screen]);

  useEffect(() => {
    if (screen === "report") {
      const timer = window.setTimeout(() => setRadarAnimated(true), 120);
      return () => window.clearTimeout(timer);
    }
    setRadarAnimated(false);
    return undefined;
  }, [screen, reportTab]);

  const filteredAnnotations = useMemo(() => {
    if (filter === "all") {
      return transcriptAnnotations;
    }
    return transcriptAnnotations.filter((item) => item.type === filter);
  }, [filter]);

  const transcriptHtml = useMemo(() => {
    return transcriptAnnotations
      .map((item) => {
        const hidden = filter !== "all" && item.type !== filter;
        const active = selectedAnnotation?.id === item.id;
        return `
          <button
            class="transcript-mark ${item.type} ${hidden ? "hidden" : ""} ${active ? "active" : ""}"
            data-id="${item.id}"
            type="button"
          >
            ${item.text}
          </button>
        `;
      })
      .join("<span class='transcript-bridge'>面试官继续追问后，你补充说</span>");
  }, [filter, selectedAnnotation]);

  const selectedDetail =
    selectedAnnotation?.detail ||
    "请选择一段高亮内容，右侧会同步展示问题类型、错误原因、知识库标准答案和改进建议。";

  function navigate(nextScreen) {
    if (nextScreen === "report") {
      setReportTab("overview");
    }
    if (nextScreen === "transcript") {
      setReportTab("transcript");
    }
    setScreen(nextScreen);
  }

  function resetForm() {
    setAudioFile("");
    setJdText("");
    setResumeText("");
  }

  function startAnalysis() {
    if (!canAnalyze) {
      return;
    }
    setProgressStep(-1);
    setScreen("loading");
  }

  return (
    <>
      <div className="web-shell">
        <header className="hero-header">
          <div className="brand-block">
            <div className="brand-mark">
              <span className="brand-dot"></span>
              <span className="brand-wave"></span>
            </div>
            <div>
              <p className="eyebrow">React Web Prototype</p>
              <h1>AI产品经理面试复盘 Agent</h1>
            </div>
          </div>
          <div className="header-actions">
            <button className="ghost-button" type="button" onClick={() => setShowHelp(true)}>
              使用说明
            </button>
          </div>
        </header>

        <section className="intro-strip">
          <div className="intro-copy">
            <span className="badge">面向产品经理面试场景</span>
            <h2>把“答得怎么样”变成一套可以展示、可以追溯、可以提升的 Web 复盘体验</h2>
            <p>
              这版升级为 React Web 端原型，围绕你的项目经历补了完整报告视图、图表表达和动画节奏，
              更适合作为作品集 demo 或面试展示稿的雏形。
            </p>
          </div>
          <div className="hero-metrics">
            <MetricPill value="45%" label="满意度提升" />
            <MetricPill value="92%" label="简历解析准确率" />
            <MetricPill value="94%" label="回答判断准确率" />
            <MetricPill value="50%" label="准备时间减少" />
          </div>
        </section>

        <main className="workspace">
          <section className="preview-surface">
            <div className="surface-glow glow-1"></div>
            <div className="surface-glow glow-2"></div>

            {screen === "home" && <HomeScreen onNavigate={navigate} />}

            {screen === "upload" && (
              <UploadScreen
                audioFile={audioFile}
                jdText={jdText}
                resumeText={resumeText}
                canAnalyze={canAnalyze}
                onAudioChange={setAudioFile}
                onJdChange={setJdText}
                onResumeChange={setResumeText}
                onReset={resetForm}
                onAnalyze={startAnalysis}
                onBack={() => navigate("home")}
              />
            )}

            {screen === "loading" && (
              <LoadingScreen progressStep={progressStep} onHelp={() => setShowHelp(true)} />
            )}

            {screen === "report" && (
              <ReportScreen
                reportTab={reportTab}
                onTabChange={setReportTab}
                onNavigate={navigate}
                radarAnimated={radarAnimated}
                completion={completion}
              />
            )}

            {screen === "transcript" && (
              <TranscriptScreen
                filter={filter}
                filteredAnnotations={filteredAnnotations}
                selectedDetail={selectedDetail}
                transcriptHtml={transcriptHtml}
                onFilterChange={(nextFilter) => {
                  setFilter(nextFilter);
                  setSelectedAnnotation(null);
                }}
                onSelectAnnotation={(id) => {
                  const hit = transcriptAnnotations.find((item) => item.id === id);
                  setSelectedAnnotation(hit || null);
                }}
                onBack={() => navigate("report")}
              />
            )}

            {screen === "history" && <HistoryScreen onNavigate={navigate} />}
          </section>

          <aside className="right-rail">
            <div className="rail-card spotlight">
              <span className="notes-tag">产品亮点映射</span>
              <h3>这版 Web 原型强化了“能讲项目”这件事</h3>
              <ul>
                <li>首页强调 7 维能力评估、RAG 批改和双模型协同。</li>
                <li>上传页呈现多模态输入与表单校验，贴合流程设计。</li>
                <li>报告页用雷达图、柱状图、折线图、分数环展示结果。</li>
                <li>逐字稿页保留红黄线批改的核心差异化体验。</li>
              </ul>
            </div>

            <div className="rail-card stats-board">
              <h3>指标看板</h3>
              <MiniBarChart data={iterationData} />
            </div>

            <div className="rail-card flow-card">
              <h3>核心流程</h3>
              <div className="flow-line">
                <FlowNode title="音频转写" subtitle="多模态输入" />
                <FlowNode title="RAG检索" subtitle="岗位标准对齐" />
                <FlowNode title="Scout侦察" subtitle="风险点标注" />
                <FlowNode title="Coach评分" subtitle="结构化输出" />
              </div>
            </div>
          </aside>
        </main>
      </div>

      {showHelp && (
        <HelpModal
          onClose={() => setShowHelp(false)}
          items={[
            "点击“开始复盘”进入上传配置页，上传音频并补充 JD 或简历信息。",
            "点击“开始分析”后，会按转写、检索、侦察批注、深度评分 4 步做加载动画。",
            "结果页可以切换总览、改进建议、历史对比、逐字稿建议。",
            "逐字稿页支持红线 / 黄线筛选，并查看对应问题原因与参考改法。"
          ]}
        />
      )}
    </>
  );
}

function HomeScreen({ onNavigate }) {
  return (
    <div className="screen active">
      <div className="home-hero-card">
        <div className="logo-stage">
          <div className="logo-orb"></div>
          <div className="logo-grid"></div>
          <div className="mountain-layer back"></div>
          <div className="mountain-layer front"></div>
          <div className="pulse-ring ring-1"></div>
          <div className="pulse-ring ring-2"></div>
        </div>
        <div className="hero-copy">
          <h2>让失分点被看见，让进步路径被记录</h2>
          <p>
            针对产品经理面试复盘中“大模型反馈笼统、失分点难定位、能力评估难量化”的问题，设计并落地基于
            RAG 驱动的智能复盘 Agent。
          </p>
        </div>
      </div>

      <div className="feature-grid">
        <FeatureCard title="7维能力评估" desc="覆盖业务感知、技术理解、逻辑思维、沟通表达、产品落地、商业思维、创新能力。" />
        <FeatureCard title="RAG精准批改" desc="对齐 PM 面试题库和岗位标准，识别知识硬伤与答题空洞。" />
        <FeatureCard title="双模型协同" desc="Scout 定位风险点，Coach 输出评分、评级和建议。" />
        <FeatureCard title="全流程闭环" desc="音频转写、简历/JD 解析、报告输出、历史对比一站完成。" />
      </div>

      <div className="cta-group">
        <button className="primary-button wide" type="button" onClick={() => onNavigate("upload")}>
          开始复盘
        </button>
        <button className="ghost-button wide" type="button" onClick={() => onNavigate("history")}>
          历史记录
        </button>
      </div>
    </div>
  );
}

function UploadScreen({
  audioFile,
  jdText,
  resumeText,
  canAnalyze,
  onAudioChange,
  onJdChange,
  onResumeChange,
  onReset,
  onAnalyze,
  onBack
}) {
  return (
    <div className="screen active">
      <div className="screen-heading">
        <h2>上传配置页</h2>
        <button className="link-button" type="button" onClick={onBack}>
          返回首页
        </button>
      </div>

      <div className="upload-stack">
        <label className="upload-card interactive">
          <input
            hidden
            type="file"
            accept=".mp3,.wav,.m4a"
            onChange={(event) => onAudioChange(event.target.files?.[0]?.name || "")}
          />
          <span className="upload-title">音频文件上传</span>
          <span className="upload-subtitle">支持拖拽上传，建议使用 mp3 / wav / m4a，时长 5 - 40 分钟</span>
          <strong className="upload-file">{audioFile || "未选择文件"}</strong>
        </label>

        <div className="dual-card">
          <div className="input-card">
            <label>JD 文本输入 / 文件粘贴</label>
            <textarea
              rows="5"
              value={jdText}
              onChange={(event) => onJdChange(event.target.value)}
              placeholder="例如：高级产品经理，负责 AI 面试复盘产品策略、流程设计、指标优化。"
            />
          </div>

          <div className="input-card">
            <label>简历文本输入 / 个人背景</label>
            <textarea
              rows="5"
              value={resumeText}
              onChange={(event) => onResumeChange(event.target.value)}
              placeholder="例如：负责 RAG 面试复盘 Agent，从 0 到 1 设计 7 维评估体系并推动三轮迭代。"
            />
          </div>
        </div>

        <div className={`smart-hint ${canAnalyze ? "ready" : "muted"}`}>
          {canAnalyze
            ? "资料已就绪：系统将结合音频、JD 与简历信息，生成结构化面试复盘报告。"
            : "提示：请至少上传音频，并填写 JD 或简历中的任意一项。"}
        </div>

        <div className="action-row">
          <button className="primary-button" type="button" disabled={!canAnalyze} onClick={onAnalyze}>
            开始分析
          </button>
          <button className="secondary-button" type="button" onClick={onReset}>
            重置
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen({ progressStep, onHelp }) {
  const steps = [
    {
      title: "音频转文字中",
      desc: "识别问答边界，提取项目亮点、风险点和追问节点。"
    },
    {
      title: "知识库匹配检索中",
      desc: "对齐 PM 面试题库、岗位标准、项目方法论案例。"
    },
    {
      title: "Scout 模型前置侦察批注中",
      desc: "标记红线知识错误、黄线表达空洞和黑话堆砌。"
    },
    {
      title: "Coach 模型深度评估打分中",
      desc: "生成 7 维评分、综合评级和改进建议。"
    }
  ];

  return (
    <div className="screen active">
      <div className="screen-heading">
        <h2>分析加载页</h2>
        <span className="loading-tag">AI Analyzing</span>
      </div>
      <div className="progress-list">
        {steps.map((step, index) => {
          const status = progressStep > index ? "complete" : progressStep === index ? "active" : "";
          return (
            <div className={`progress-item ${status}`} key={step.title}>
              <div className="step-indicator"></div>
              <div className="step-content">
                <strong>{step.title}</strong>
                <span>{step.desc}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="analysis-wave"></div>
      <button className="text-button centered" type="button" onClick={onHelp}>
        使用说明
      </button>
    </div>
  );
}

function ReportScreen({ reportTab, onTabChange, onNavigate, radarAnimated, completion }) {
  return (
    <div className="screen active">
      <div className="screen-heading">
        <h2>结果总览页</h2>
        <button className="link-button" type="button" onClick={() => onNavigate("home")}>
          重新开始
        </button>
      </div>

      <div className="tab-row">
        {[
          ["overview", "总览"],
          ["advice", "改进建议"],
          ["history", "历史对比"],
          ["transcript", "逐字稿建议"]
        ].map(([id, label]) => (
          <button
            key={id}
            className={`tab-button ${reportTab === id ? "active" : ""}`}
            type="button"
            onClick={() => onTabChange(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {reportTab === "overview" && (
        <div className="report-content">
          <div className="report-grid top">
            <ScoreRing score={86} />
            <div className="summary-card">
              <p className="card-label">面试概况</p>
              <h3>A- 级回答，结构完整，亮点充分</h3>
              <p>
                场景聚焦“产品经理面试复盘 Agent”项目深挖。你能说清核心痛点、方案闭环与结果指标，但商业思维和技术理解还可以更锋利。
              </p>
              <div className="summary-chips">
                <span>满意度提升 45%</span>
                <span>解析准确率 92%</span>
                <span>判断准确率 94%</span>
              </div>
            </div>
          </div>

          <div className="report-grid bottom">
            <div className="chart-card">
              <div className="card-title-row">
                <div>
                  <p className="card-label">能力雷达</p>
                  <h3>7 维能力量化评估</h3>
                </div>
                <span className="chart-note">综合均分 {completion}</span>
              </div>
              <RadarChart data={abilityData} animated={radarAnimated} />
            </div>

            <div className="chart-card">
              <div className="card-title-row">
                <div>
                  <p className="card-label">维度对比</p>
                  <h3>能力柱状分布</h3>
                </div>
              </div>
              <AbilityBars data={abilityData} />
            </div>
          </div>

          <div className="insight-grid">
            <InsightCard kind="positive" title="优势维度" desc="产品落地、逻辑思维和业务感知表现突出，能够把项目路径、迭代动作和指标结果连起来。" />
            <InsightCard kind="warning" title="待提升维度" desc="商业思维和技术理解仍偏描述型，建议补充 ROI、系统边界与判断依据。" />
            <InsightCard kind="neutral" title="核心一句话结论" desc="这是一个有真实项目积累、方案扎实、但量化表达还可以更强的回答。" />
          </div>
        </div>
      )}

      {reportTab === "advice" && (
        <div className="detail-stack">
          <DetailCard
            title="建议 1：把项目亮点从“做了什么”升级成“为什么有效”"
            desc="建议补充 7 维评估体系覆盖率、用户满意度提升、判断准确率优化之间的因果链，让回答更像完整产品策略。"
          />
          <DetailCard
            title="建议 2：加强技术理解表达的抓手"
            desc="在提到 RAG、提示词优化、知识库检索时，明确检索召回、重排逻辑和评分边界，减少被追问时的卡顿。"
          />
          <DetailCard
            title="建议 3：提前准备高频追问模板"
            desc="围绕“为什么能从78%提升到94%”“如何定义评分准确率”准备结构化回答，形成可复用的项目讲述模板。"
          />
        </div>
      )}

      {reportTab === "history" && (
        <div className="chart-card">
          <div className="card-title-row">
            <div>
              <p className="card-label">迭代效果</p>
              <h3>三轮优化表现变化</h3>
            </div>
          </div>
          <TrendChart data={iterationData} />
        </div>
      )}

      {reportTab === "transcript" && (
        <div className="detail-card">
          <h3>逐字稿批改入口</h3>
          <p>系统识别出 3 处红线问题和 4 处黄线问题，可进一步查看上下文、原因分析和参考改法。</p>
          <button className="primary-button" type="button" onClick={() => onNavigate("transcript")}>
            查看逐字稿批改
          </button>
        </div>
      )}
    </div>
  );
}

function TranscriptScreen({
  filter,
  selectedDetail,
  transcriptHtml,
  onFilterChange,
  onSelectAnnotation,
  onBack
}) {
  return (
    <div className="screen active">
      <div className="screen-heading">
        <h2>逐字稿批改页</h2>
        <button className="link-button" type="button" onClick={onBack}>
          返回报告
        </button>
      </div>

      <div className="transcript-layout">
        <div className="transcript-panel">
          <div
            className="transcript-copy"
            dangerouslySetInnerHTML={{ __html: `候选人回答摘录：${transcriptHtml}。整体回答真实，但部分表达还可以更精准、更量化。` }}
            onClick={(event) => {
              const target = event.target.closest("[data-id]");
              if (target) {
                onSelectAnnotation(target.dataset.id);
              }
            }}
          />
        </div>

        <div className="annotation-panel">
          <div className="annotation-header">
            <span>批注详情区</span>
            <small>点击左侧高亮文本查看详情</small>
          </div>
          <div className="annotation-detail">{selectedDetail}</div>
        </div>
      </div>

      <div className="filter-row">
        {[
          ["all", "全部批注"],
          ["red", "仅看红线"],
          ["yellow", "仅看黄线"]
        ].map(([id, label]) => (
          <button
            key={id}
            className={`filter-button ${filter === id ? "active" : ""}`}
            type="button"
            onClick={() => onFilterChange(id)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function HistoryScreen({ onNavigate }) {
  return (
    <div className="screen active">
      <div className="screen-heading">
        <h2>历史记录页</h2>
        <button className="link-button" type="button" onClick={() => onNavigate("home")}>
          返回首页
        </button>
      </div>

      <div className="history-list">
        {historyRecords.map((record) => (
          <button className="history-card button-reset" type="button" key={record.id} onClick={() => onNavigate("report")}>
            <div>
              <h3>{record.title}</h3>
              <p>
                时间：{record.date} ｜ 总分：{record.score} ｜ 核心结论：{record.summary}
              </p>
            </div>
            <strong>{record.score}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}

function RadarChart({ data, animated }) {
  const centerX = 170;
  const centerY = 160;
  const radius = 108;
  const points = data.map((item, index) => {
    const angle = (-Math.PI / 2) + (Math.PI * 2 * index) / data.length;
    const outerX = centerX + Math.cos(angle) * radius;
    const outerY = centerY + Math.sin(angle) * radius;
    const valueX = centerX + Math.cos(angle) * radius * (item.score / 100);
    const valueY = centerY + Math.sin(angle) * radius * (item.score / 100);
    const labelX = centerX + Math.cos(angle) * (radius + 28);
    const labelY = centerY + Math.sin(angle) * (radius + 28);
    return { ...item, outerX, outerY, valueX, valueY, labelX, labelY };
  });

  const polygonPoints = points.map((point) => `${point.valueX},${point.valueY}`).join(" ");
  const outerPolygon = points.map((point) => `${point.outerX},${point.outerY}`).join(" ");

  return (
    <svg viewBox="0 0 340 320" className="radar-svg" aria-label="能力雷达图">
      <defs>
        <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(42, 162, 255, 0.55)" />
          <stop offset="100%" stopColor="rgba(245, 184, 62, 0.3)" />
        </linearGradient>
      </defs>
      <polygon points={outerPolygon} className="radar-grid outer" />
      <polygon
        points={points.map((point) => `${centerX + (point.outerX - centerX) * 0.7},${centerY + (point.outerY - centerY) * 0.7}`).join(" ")}
        className="radar-grid mid"
      />
      <polygon
        points={points.map((point) => `${centerX + (point.outerX - centerX) * 0.4},${centerY + (point.outerY - centerY) * 0.4}`).join(" ")}
        className="radar-grid inner"
      />

      {points.map((point) => (
        <g key={point.label}>
          <line x1={centerX} y1={centerY} x2={point.outerX} y2={point.outerY} className="radar-axis" />
          <text x={point.labelX} y={point.labelY} className="radar-label">
            {point.label}
          </text>
        </g>
      ))}

      <polygon
        points={polygonPoints}
        className={`radar-area ${animated ? "animated" : ""}`}
        style={{ transformOrigin: `${centerX}px ${centerY}px` }}
      />

      {points.map((point) => (
        <circle key={`${point.label}-dot`} cx={point.valueX} cy={point.valueY} r="4.5" className="radar-dot" />
      ))}
    </svg>
  );
}

function AbilityBars({ data }) {
  return (
    <div className="bar-list">
      {data.map((item, index) => (
        <div className="bar-item" key={item.label} style={{ animationDelay: `${index * 0.08}s` }}>
          <div className="bar-meta">
            <span>{item.label}</span>
            <strong>{item.score}</strong>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${item.score}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TrendChart({ data }) {
  const width = 620;
  const height = 280;
  const padding = 40;
  const max = 100;

  const makePoints = (key) =>
    data
      .map((item, index) => {
        const x = padding + (index * (width - padding * 2)) / (data.length - 1);
        const y = height - padding - ((item[key] / max) * (height - padding * 2));
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <div className="trend-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="trend-svg" aria-label="趋势图">
        {[20, 40, 60, 80].map((value) => {
          const y = height - padding - ((value / max) * (height - padding * 2));
          return <line key={value} x1={padding} y1={y} x2={width - padding} y2={y} className="trend-grid" />;
        })}

        <polyline points={makePoints("accuracy")} className="trend-line accuracy" />
        <polyline points={makePoints("match")} className="trend-line match" />

        {data.map((item, index) => {
          const x = padding + (index * (width - padding * 2)) / (data.length - 1);
          const yAccuracy = height - padding - ((item.accuracy / max) * (height - padding * 2));
          const yMatch = height - padding - ((item.match / max) * (height - padding * 2));

          return (
            <g key={item.stage}>
              <circle cx={x} cy={yAccuracy} r="5" className="trend-point accuracy" />
              <circle cx={x} cy={yMatch} r="5" className="trend-point match" />
              <text x={x} y={height - 10} className="trend-label">
                {item.stage}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="trend-legend">
        <span><i className="legend-dot accuracy"></i>回答判断准确率</span>
        <span><i className="legend-dot match"></i>JD岗位匹配度</span>
      </div>
    </div>
  );
}

function ScoreRing({ score }) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="score-ring-card">
      <svg viewBox="0 0 160 160" className="score-ring">
        <circle cx="80" cy="80" r={radius} className="score-ring-bg" />
        <circle
          cx="80"
          cy="80"
          r={radius}
          className="score-ring-progress"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="score-ring-content">
        <span>综合得分</span>
        <strong>{score}</strong>
      </div>
    </div>
  );
}

function MiniBarChart({ data }) {
  return (
    <div className="mini-chart">
      {data.map((item) => (
        <div className="mini-row" key={item.stage}>
          <span>{item.stage}</span>
          <div className="mini-track">
            <div className="mini-fill blue" style={{ width: `${item.accuracy}%` }}></div>
          </div>
          <strong>{item.accuracy}%</strong>
        </div>
      ))}
    </div>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <article className="feature-card">
      <h3>{title}</h3>
      <p>{desc}</p>
    </article>
  );
}

function InsightCard({ kind, title, desc }) {
  return (
    <article className={`insight-card ${kind}`}>
      <h3>{title}</h3>
      <p>{desc}</p>
    </article>
  );
}

function DetailCard({ title, desc }) {
  return (
    <article className="detail-card">
      <h3>{title}</h3>
      <p>{desc}</p>
    </article>
  );
}

function MetricPill({ value, label }) {
  return (
    <div className="metric-pill">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function FlowNode({ title, subtitle }) {
  return (
    <div className="flow-node">
      <div className="flow-dot"></div>
      <div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
    </div>
  );
}

function HelpModal({ onClose, items }) {
  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>使用说明</h2>
          <button className="text-button" type="button" onClick={onClose}>
            关闭
          </button>
        </div>
        <div className="modal-content">
          {items.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
