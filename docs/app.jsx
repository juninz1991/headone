/* global React, ReactDOM */
const { useEffect, useRef, useState } = React;
const { motion } = window.framerMotion || { motion: { div: (p)=>React.createElement("div", p) } };

// ========================= CONFIG =========================
const TOKEN_KEY = "headone_jwt";
const STORE_KEY = "headone_store_v1";
const DEMO_PASS = "headone-demo";

function uid(){ return `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function loadStore(){
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || { jobs:[], reports:[], keys:{} }; }
  catch { return { jobs:[], reports:[], keys:{} }; }
}
function saveStore(s){ localStorage.setItem(STORE_KEY, JSON.stringify(s)); }
function mask(str){ if(!str) return ""; return str.length>8 ? str.slice(0,4)+"…"+str.slice(-4) : str; }
function twSwitch(active){
  return "px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 " +
         (active ? "bg-emerald-600/20 text-emerald-300 border-emerald-400/40"
                 : "bg-black/40 text-slate-400 border-emerald-400/20");
}

// ========================= ÍCONES =========================
const Icon = {
  Shield:(p)=>(<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>),
  Sparkles:(p)=>(<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5L12 3zM19 14l.8 1.7L21.5 17l-1.7.7L19 19.5l-.7-1.8L16.5 17l1.8-1.3L19 14z"/></svg>),
  Terminal:(p)=>(<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M7 8l4 4-4 4M11 16h6"/><rect x="3" y="4" width="18" height="16" rx="2"/></svg>),
  Zap:(p)=>(<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>),
  Plug:(p)=>(<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 7v4M15 7v4M7 11h10M12 15v7"/></svg>),
  Cpu:(p)=>(<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="8" y="8" width="8" height="8"/><path d="M4 10v4M20 10v4M10 4h4M10 20h4"/></svg>),
  Settings:(p)=>(<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"/></svg>),
  Bot:(p)=>(<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="4" y="8" width="16" height="10" rx="2"/><circle cx="12" cy="6" r="3"/></svg>),
  User:(p)=>(<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="7" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>),
  Loader:(p)=>(<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" className={(p.className||"")+" animate-spin"}><path d="M21 12a9 9 0 1 1-9-9"/></svg>),
  Download:(p)=>(<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>)
};

// ========================= COMPONENTES BASE =========================
function NeonCard({ title, icon, children }){
  return (
    <div className="rounded-2xl border border-emerald-400/20 bg-black/30 p-4 shadow-neon">
      <div className="flex items-center gap-2 mb-3">{icon}<h3 className="text-sm tracking-wide text-emerald-300">{title}</h3></div>
      {children}
    </div>
  );
}
function Cmd({ cmd, desc }){
  return (
    <div className="mb-2">
      <div className="font-mono text-[12.5px] text-emerald-300">$ {cmd}</div>
      <div className="text-xs text-slate-400">{desc}</div>
    </div>
  );
}
function MessageBubble({ role, content }){
  const isUser = role === "user";
  return (
    <div className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && <div className="shrink-0 w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 grid place-content-center"><Icon.Bot className="w-4 h-4 text-emerald-300"/></div>}
      <div className={`${isUser ? "bg-emerald-600/20 border-emerald-400/30" : "bg-black/40 border-emerald-400/20"} border rounded-2xl px-4 py-3 max-w-[90%] lg:max-w-[80%] text-sm leading-relaxed shadow-neon`}>
        <pre className="whitespace-pre-wrap font-mono text-[13px]">{content}</pre>
      </div>
      {isUser && <div className="shrink-0 w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 grid place-content-center"><Icon.User className="w-4 h-4 text-emerald-300"/></div>}
    </div>
  );
}
function Input({ label, value, setValue, placeholder, type="text" }){
  return (
    <label className="grid">
      <span className="text-xs text-slate-400 mb-1">{label}</span>
      <input value={value} onChange={e=>setValue(e.target.value)} placeholder={placeholder}
             type={type} className="bg-black/50 border border-emerald-400/30 rounded-xl px-4 py-3" />
    </label>
  );
}

// ========================= LOGIN =========================
function Login({ onOk }){
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  function submit(e){
    e.preventDefault();
    setErr("");
    if(pass !== DEMO_PASS){ setErr("Senha inválida (dica: headone-demo)"); return; }
    localStorage.setItem(TOKEN_KEY, JSON.stringify({ email, at: Date.now() }));
    onOk();
  }

  return (
    <div className="min-h-screen bg-[#0a0d10] text-slate-200 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-emerald-400/30 bg-black/40 p-6 shadow-[0_0_20px_rgba(16,185,129,.15)]">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 grid place-content-center">
              <Icon.Shield className="w-4 h-4 text-emerald-300" />
            </div>
            <Icon.Sparkles className="absolute -right-2 -top-2 w-4 h-4 text-emerald-400/80" />
          </div>
          <div>
            <div className="text-emerald-300 font-semibold tracking-wide">HeadOne</div>
            <div className="text-xs text-emerald-400/60">Autonomous Recon · Safe Exploit · Report</div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <Input label="E-mail" value={email} setValue={setEmail} placeholder="seu@email.com" />
          <Input label="Senha (demo)" value={pass} setValue={setPass} placeholder="headone-demo" type="password" />
          {err && <div className="text-red-400 text-sm">{err}</div>}
          <button className="w-full px-4 py-3 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white border border-emerald-400/30">
            Entrar
          </button>
        </form>

        <div className="text-xs text-slate-400 mt-4">Acesso de demonstração • use a senha <b>headone-demo</b></div>
      </div>
    </div>
  );
}

// ========================= LANDING (HOME) =========================
function Home({ onEnter }){
  const hasToken = !!localStorage.getItem(TOKEN_KEY);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,.12),transparent_60%)] text-slate-200 flex flex-col">
      {/* Hero */}
      <header className="sticky top-0 z-20 glass border-b border-emerald-400/20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 grid place-content-center">
                <Icon.Shield className="w-4 h-4 text-emerald-300" />
              </div>
              <Icon.Sparkles className="absolute -right-2 -top-2 w-4 h-4 text-emerald-400/80" />
            </div>
            <div>
              <div className="text-emerald-300 font-semibold tracking-wide">HeadOne</div>
              <div className="text-xs text-emerald-400/60">Pentest com IA</div>
            </div>
          </div>
          <nav className="ml-auto flex items-center gap-2 text-xs">
            <a href="#/home" className="px-3 py-1.5 rounded-lg border border-emerald-400/20 hover:bg-emerald-500/10">Início</a>
            {!hasToken && <a href="#/login" className="px-3 py-1.5 rounded-lg border border-emerald-400/20 hover:bg-emerald-500/10">Login</a>}
            {hasToken && <a href="#/app" className="px-3 py-1.5 rounded-lg border border-emerald-400/20 hover:bg-emerald-500/10">Dashboard</a>}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-emerald-300 leading-tight">
          🛡️ HeadOne — Pentest AI
        </h1>
        <p className="mt-4 text-slate-300 max-w-3xl">
          Pentests mais <b>rápidos</b>, <b>contínuos</b> e <b>acessíveis</b> com IA.
          Integra Subfinder, httpx, Nmap e Nuclei, com <b>modo assistido</b> (humano-no-loop),
          <b>governança</b> e <b>relatórios executivos</b> prontos.
        </p>
        <div className="mt-6 flex gap-3">
          {!hasToken ? (
            <button onClick={()=>onEnter("login")}
              className="px-6 py-3 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white border border-emerald-400/30">
              Entrar no Sistema
            </button>
          ) : (
            <button onClick={()=>onEnter("app")}
              className="px-6 py-3 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white border border-emerald-400/30">
              Ir para Dashboard
            </button>
          )}
          <a href="#contato" className="px-6 py-3 rounded-xl border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/10">
            Falar com Comercial
          </a>
        </div>
      </section>

      {/* Por que IA */}
      <section className="max-w-6xl mx-auto px-6 py-8 grid md:grid-cols-3 gap-6">
        <NeonCard title="🚀 Velocidade" icon={<Icon.Zap className="w-4 h-4 text-emerald-300" />}>
          <p className="text-sm text-slate-300/90">
            Automação de recon e varreduras com IA. Menos tempo de execução, respostas mais rápidas.
          </p>
        </NeonCard>
        <NeonCard title="🧠 Precisão + Governança" icon={<Icon.Settings className="w-4 h-4 text-emerald-300" />}>
          <p className="text-sm text-slate-300/90">
            Modo assistido confirma ações intrusivas. Logs e memória para auditoria e repetibilidade.
          </p>
        </NeonCard>
        <NeonCard title="💸 Custo Acessível" icon={<Icon.Cpu className="w-4 h-4 text-emerald-300" />}>
          <p className="text-sm text-slate-300/90">
            Híbrido IA + humano reduz esforço operacional. Preços competitivos sem perder qualidade.
          </p>
        </NeonCard>
      </section>

      {/* Como funciona */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-xl text-emerald-300 mb-3">Como funciona</h2>
        <ol className="grid md:grid-cols-3 gap-4 text-sm">
          <li className="border border-emerald-400/20 rounded-xl p-4 bg-black/30">
            <b>1) Solicitação</b><br/>
            Você define alvo, escopo e ferramentas. O HeadOne cria um job na fila.
          </li>
          <li className="border border-emerald-400/20 rounded-xl p-4 bg-black/30">
            <b>2) Execução Assistida</b><br/>
            Fluxo IA + automações (Subfinder, httpx, Nmap, Nuclei) com confirmação humana.
          </li>
          <li className="border border-emerald-400/20 rounded-xl p-4 bg-black/30">
            <b>3) Relatório</b><br/>
            Sumário Executivo + Técnico, evidências e recomendações priorizadas.
          </li>
        </ol>
      </section>

      {/* Planos exemplo */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <h2 className="text-xl text-emerald-300 mb-3">Planos (exemplo PtaaS)</h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="border border-emerald-400/20 rounded-xl p-4 bg-black/30">
            <b>Bronze</b>
            <ul className="mt-2 text-slate-300/90 space-y-1">
              <li>• 1 domínio + 1 app</li>
              <li>• Relatório mensal</li>
              <li>• E-mail suporte</li>
            </ul>
          </div>
          <div className="border border-emerald-400/20 rounded-xl p-4 bg-black/30">
            <b>Silver</b>
            <ul className="mt-2 text-slate-300/90 space-y-1">
              <li>• 3 domínios + 3 apps</li>
              <li>• Relatório quinzenal</li>
              <li>• Suporte priorizado</li>
            </ul>
          </div>
          <div className="border border-emerald-400/20 rounded-xl p-4 bg-black/30">
            <b>Gold</b>
            <ul className="mt-2 text-slate-300/90 space-y-1">
              <li>• 5 domínios + rede interna</li>
              <li>• Relatório semanal</li>
              <li>• Suporte dedicado</li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="border-t border-emerald-400/20 text-xs text-slate-400/70">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between">
          <div>© {new Date().getFullYear()} HeadOne</div>
          <div>Autonomous Recon · Safe Exploit · Report</div>
        </div>
      </footer>
    </div>
  );
}

// ========================= API KEYS (mock) =========================
function KeysScreen(){
  const [openai, setOpenai] = useState("");
  const [openrouter, setOpenrouter] = useState("");
  const [anthropic, setAnthropic] = useState("");
  const [google, setGoogle] = useState("");
  const [saved, setSaved] = useState(null);

  useEffect(()=>{
    const s = loadStore();
    const keys = s.keys || {};
    setOpenai(mask(keys.openai));
    setOpenrouter(mask(keys.openrouter));
    setAnthropic(mask(keys.anthropic));
    setGoogle(mask(keys.google));
  },[]);

  function save(e){
    e.preventDefault();
    const s = loadStore();
    s.keys = {
      openai: openai.includes("…") ? s.keys?.openai : openai,
      openrouter: openrouter.includes("…") ? s.keys?.openrouter : openrouter,
      anthropic: anthropic.includes("…") ? s.keys?.anthropic : anthropic,
      google: google.includes("…") ? s.keys?.google : google
    };
    saveStore(s); setSaved(new Date());
  }

  return (
    <div className="rounded-2xl border border-emerald-400/20 bg-black/30 p-4 shadow-neon">
      <h3 className="text-sm tracking-wide text-emerald-300 mb-3">API Keys</h3>
      <form onSubmit={save} className="grid gap-3">
        <Input label="OpenAI" value={openai} setValue={setOpenai} placeholder="sk-..." />
        <Input label="OpenRouter" value={openrouter} setValue={setOpenrouter} placeholder="or-..." />
        <Input label="Anthropic" value={anthropic} setValue={setAnthropic} placeholder="sk-ant-..." />
        <Input label="Google (Gemini)" value={google} setValue={setGoogle} placeholder="AIza..." />
        <div className="flex gap-2">
          <button className="px-4 py-3 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white border border-emerald-400/30">Salvar</button>
          {saved && <div className="text-xs text-slate-400 self-center">Salvo {saved.toLocaleString()}</div>}
        </div>
      </form>
      <div className="text-xs text-slate-400 mt-3">As chaves estão salvas localmente (demo). No modo real, salvaremos no backend com criptografia.</div>
    </div>
  );
}

// ========================= DASHBOARD COMPLETO (mock) =========================
function App({ onLogout }){
  const [route, setRoute] = useState("console"); // console | new | queue | reports | keys
  const [messages, setMessages] = useState([{ id:"sys1", role:"assistant", content:"Oi, eu sou seu agente de Pentest com IA. Diga o alvo, escopo e o que deseja (ex.: 'recon dominio.com', 'nuclei dominio.com')." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tools, setTools] = useState({ nmap:true, nuclei:true, subfinder:true, httpx:true });
  const [store, setStore] = useState(loadStore());
  const bottomRef = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [messages, loading]);

  async function sendMessage(){
    if(!input.trim()) return;
    const userMsg = { id: uid(), role: "user", content: input.trim() };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);
    await new Promise(r=>setTimeout(r, 550));
    const ai = [
      "✔ Solicitação registrada (visual)",
      `- prompt: ${userMsg.content}`,
      `- ferramentas: ${Object.entries(tools).filter(([,v])=>v).map(([k])=>k).join(", ") || "nenhuma"}`,
      "Vá em Nova Solicitação para abrir um job com escopo controlado.",
    ].join("\n");
    setMessages(m => [...m, { id: uid(), role:"assistant", content: ai }]);
    setLoading(false);
  }

  // Nova Solicitação
  const [target, setTarget] = useState("");
  const [scope, setScope] = useState("");
  const [notes, setNotes] = useState("");
  function submitJob(e){
    e.preventDefault();
    if(!target.trim()) return;
    const job = {
      id: uid(),
      target: target.trim(),
      scope: scope.trim(),
      tools: {...tools},
      notes: notes.trim(),
      status: "queued",
      createdAt: new Date().toISOString()
    };
    const next = { ...store, jobs: [job, ...store.jobs] };
    saveStore(next); setStore(next);
    setTarget(""); setScope(""); setNotes(""); setRoute("queue");
  }

  // Avançar job e gerar relatório
  function advanceJob(id){
    const next = { ...store };
    const idx = next.jobs.findIndex(j=>j.id===id);
    if(idx<0) return;
    const st = next.jobs[idx].status;
    if(st==="queued") next.jobs[idx].status="running";
    else if(st==="running"){
      next.jobs[idx].status="done";
      next.reports.unshift({
        id: uid(),
        jobId: id,
        title: `Relatório ${next.jobs[idx].target}`,
        risk: "Baixo",
        createdAt: new Date().toISOString(),
        summary: "Nenhuma vulnerabilidade crítica. Portas 80/443 abertas. Headers ok.",
        tools: next.jobs[idx].tools
      });
    }
    saveStore(next); setStore(next);
  }
  function removeJob(id){
    const next = { ...store, jobs: store.jobs.filter(j=>j.id!==id) };
    saveStore(next); setStore(next);
  }
  function downloadReport(r){
    const txt = [
      `HeadOne — Relatório`,
      `Alvo: ${store.jobs.find(j=>j.id===r.jobId)?.target || "-"}`,
      `Criado: ${new Date(r.createdAt).toLocaleString()}`,
      `Risco: ${r.risk}`,
      `Resumo: ${r.summary}`,
      `Ferramentas: ${Object.entries(r.tools).filter(([,v])=>v).map(([k])=>k).join(", ")}`,
      `---`,
      `Este é um relatório simulado.`
    ].join("\n");
    const blob = new Blob([txt], { type:"text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${r.title.replace(/\s+/g,"_")}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="min-h-screen bg-[#0a0d10] text-slate-200 flex flex-col">
      {/* Topbar */}
      <header className="sticky top-0 z-20 backdrop-blur bg-black/40 border-b border-emerald-400/20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 grid place-content-center shadow-[0_0_20px_rgba(16,185,129,0.35)]">
                <Icon.Shield className="w-4 h-4 text-emerald-300" />
              </div>
              <Icon.Sparkles className="absolute -right-2 -top-2 w-4 h-4 text-emerald-400/80" />
            </div>
            <div>
              <div className="text-emerald-300 font-semibold tracking-wide">HeadOne</div>
              <div className="text-xs text-emerald-400/60">Autonomous Recon · Safe Exploit · Report</div>
            </div>
          </motion.div>

          <nav className="ml-auto flex items-center gap-2">
            <button className={`px-3 py-1.5 rounded-xl border text-xs ${route==="console"?"bg-emerald-600/20 text-emerald-300 border-emerald-400/40":"bg-black/40 text-slate-400 border-emerald-400/20"}`} onClick={()=>setRoute("console")}>Console</button>
            <button className={`px-3 py-1.5 rounded-xl border text-xs ${route==="new"?"bg-emerald-600/20 text-emerald-300 border-emerald-400/40":"bg-black/40 text-slate-400 border-emerald-400/20"}`} onClick={()=>setRoute("new")}>Nova Solicitação</button>
            <button className={`px-3 py-1.5 rounded-xl border text-xs ${route==="queue"?"bg-emerald-600/20 text-emerald-300 border-emerald-400/40":"bg-black/40 text-slate-400 border-emerald-400/20"}`} onClick={()=>setRoute("queue")}>Fila</button>
            <button className={`px-3 py-1.5 rounded-xl border text-xs ${route==="reports"?"bg-emerald-600/20 text-emerald-300 border-emerald-400/40":"bg-black/40 text-slate-400 border-emerald-400/20"}`} onClick={()=>setRoute("reports")}>Relatórios</button>
            <button className={`px-3 py-1.5 rounded-xl border text-xs ${route==="keys"?"bg-emerald-600/20 text-emerald-300 border-emerald-400/40":"bg-black/40 text-slate-400 border-emerald-400/20"}`} onClick={()=>setRoute("keys")}>API Keys</button>
            <button onClick={onLogout} className="ml-2 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 text-xs">Sair</button>
          </nav>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-6xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-4">
          <NeonCard title="Perfil de Execução" icon={<Icon.Bot className="w-4 h-4 text-emerald-300" />}>
            <ul className="text-sm leading-6 text-slate-300/90">
              <li>• Modo: <b>Assistido</b> (confirma ações intrusivas)</li>
              <li>• Limite: 10 req/min, 2 threads</li>
              <li>• Escopo: somente alvos autorizados</li>
            </ul>
          </NeonCard>

          <NeonCard title="Comandos de exemplo" icon={<Icon.Terminal className="w-4 h-4 text-emerald-300" />}>
            <Cmd cmd="recon dominio.com" desc="Subfinder + httpx + nmap top-1000" />
            <Cmd cmd="nuclei dominio.com" desc="Templates de alta severidade" />
            <Cmd cmd="gerar relatorio" desc="Sumário executivo + evidências" />
          </NeonCard>

          <NeonCard title="Boas práticas" icon={<Icon.Shield className="w-4 h-4 text-emerald-300" />}>
            <ul className="text-sm leading-6 text-slate-300/90">
              <li>• Confirme exploits / brute force</li>
              <li>• Respeite janelas de manutenção</li>
              <li>• Salve logs e artefatos</li>
            </ul>
          </NeonCard>

          <NeonCard title="Ferramentas" icon={<Icon.Settings className="w-4 h-4 text-emerald-300" />}>
            <div className="flex flex-wrap gap-2">
              <button onClick={()=>setTools(t=>({...t, nmap:!t.nmap}))} className={twSwitch(tools.nmap)}><Icon.Terminal className="w-4 h-4" /> Nmap</button>
              <button onClick={()=>setTools(t=>({...t, nuclei:!t.nuclei}))} className={twSwitch(tools.nuclei)}><Icon.Zap className="w-4 h-4" /> Nuclei</button>
              <button onClick={()=>setTools(t=>({...t, subfinder:!t.subfinder}))} className={twSwitch(tools.subfinder)}><Icon.Plug className="w-4 h-4" /> Subfinder</button>
              <button onClick={()=>setTools(t=>({...t, httpx:!t.httpx}))} className={twSwitch(tools.httpx)}><Icon.Cpu className="w-4 h-4" /> httpx</button>
            </div>
          </NeonCard>
        </aside>

        {/* Main por rota */}
        <section className="lg:col-span-9">
          {route==="console" && (
            <div className="rounded-2xl border border-emerald-400/20 bg-gradient-to-b from-black/20 to-emerald-900/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon.Terminal className="w-4 h-4 text-emerald-300" />
                <div className="uppercase tracking-widest text-xs text-emerald-400/70">console</div>
              </div>
              <div className="space-y-4 max-h-[62vh] overflow-y-auto pr-1">
                {messages.map(m => <MessageBubble key={m.id} role={m.role} content={m.content} />)}
                {loading && <div className="flex items-center gap-2 text-emerald-300/80 text-sm"><Icon.Loader className="w-4 h-4" /> processando…</div>}
                <div ref={bottomRef} />
              </div>
              <div className="mt-4 flex gap-2">
                <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>(e.key==="Enter" && !e.shiftKey ? sendMessage() : null)}
                       placeholder="Ex.: recon advancedinfo.com.br"
                       className="flex-1 bg-black/50 text-slate-100 placeholder:text-slate-500 rounded-xl px-4 py-3 border border-emerald-400/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
                <button onClick={sendMessage} className="px-4 py-3 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white border border-emerald-400/30 flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                  Enviar
                </button>
              </div>
            </div>
          )}

          {route==="new" && (
            <div className="rounded-2xl border border-emerald-400/20 bg-black/30 p-4 shadow-neon">
              <h3 className="text-sm tracking-wide text-emerald-300 mb-3">Nova Solicitação</h3>
              <form onSubmit={submitJob} className="space-y-3">
                <input value={target} onChange={e=>setTarget(e.target.value)} placeholder="Alvo (ex.: dominio.com)"
                       className="w-full bg-black/50 border border-emerald-400/30 rounded-xl px-4 py-3" />
                <textarea value={scope} onChange={e=>setScope(e.target.value)} placeholder="Escopo (IPs/domínios autorizados, janelas de manutenção, etc.)"
                          className="w-full bg-black/50 border border-emerald-400/30 rounded-xl px-4 py-3 h-24"></textarea>
                <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Observações (opcional)"
                          className="w-full bg-black/50 border border-emerald-400/30 rounded-xl px-4 py-3 h-20"></textarea>
                <div className="text-xs text-slate-400">Ferramentas ativas: {Object.entries(tools).filter(([,v])=>v).map(([k])=>k).join(", ") || "nenhuma"}</div>
                <button className="px-4 py-3 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white border border-emerald-400/30">Criar Solicitação</button>
              </form>
            </div>
          )}

          {route==="queue" && (
            <div className="rounded-2xl border border-emerald-400/20 bg-black/30 p-4 shadow-neon">
              <h3 className="text-sm tracking-wide text-emerald-300 mb-3">Fila de Solicitações</h3>
              <div className="space-y-2">
                {store.jobs.length===0 && <div className="text-slate-400 text-sm">Sem solicitações no momento.</div>}
                {store.jobs.map(j=>(
                  <div key={j.id} className="border border-emerald-400/20 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm"><b>{j.target}</b> • {j.status}</div>
                      <div className="text-xs text-slate-400">Criada: {new Date(j.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>advanceJob(j.id)} className="px-3 py-1.5 rounded-lg border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/10 text-xs">Avançar</button>
                      <button onClick={()=>removeJob(j.id)} className="px-3 py-1.5 rounded-lg border border-emerald-400/30 text-slate-300 hover:bg-red-500/10 text-xs">Remover</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {route==="reports" && (
            <div className="rounded-2xl border border-emerald-400/20 bg-black/30 p-4 shadow-neon">
              <h3 className="text-sm tracking-wide text-emerald-300 mb-3">Relatórios</h3>
              <div className="space-y-2">
                {store.reports.length===0 && <div className="text-slate-400 text-sm">Nenhum relatório disponível.</div>}
                {store.reports.map(r=>(
                  <div key={r.id} className="border border-emerald-400/20 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm"><b>{r.title}</b> • {r.risk}</div>
                        <div className="text-xs text-slate-400">Criado: {new Date(r.createdAt).toLocaleString()}</div>
                      </div>
                      <button onClick={()=>downloadReport(r)} className="px-3 py-1.5 rounded-lg border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/10 text-xs flex items-center gap-2">
                        <Icon.Download className="w-4 h-4" /> Baixar
                      </button>
                    </div>
                    <div className="text-xs text-slate-300/90 mt-2">{r.summary}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {route==="keys" && <KeysScreen />}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-emerald-400/20 text-xs text-slate-400/70">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>© {new Date().getFullYear()} HeadOne • uso autorizado</div>
          <div className="hidden sm:block">Tema hacker • neon/emerald • JetBrains Mono recomendado</div>
        </div>
      </footer>
    </div>
  );
}

// ========================= ROOT (hash routing) =========================
function Root(){
  const [stage, setStage] = useState("home");

  useEffect(()=>{
    const initial = (location.hash.replace("#/", "") || "home");
    setStage(["home","login","app"].includes(initial) ? initial : "home");
  },[]);

  useEffect(()=>{
    const onHash = () => {
      const r = (location.hash.replace("#/", "") || "home");
      setStage(["home","login","app"].includes(r) ? r : "home");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  },[]);

  const go = (next) => { location.hash = `#/${next}`; setStage(next); };

  if(stage==="home")  return <Home  onEnter={(target)=>go(target)} />;
  if(stage==="login") return <Login onOk={()=>go("app")} />;
  if(stage==="app")   return <App   onLogout={()=>{ localStorage.removeItem(TOKEN_KEY); go("home"); }} />;
  return <Home onEnter={go} />;
}

// Render
ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
