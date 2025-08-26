/* global React, ReactDOM */
const { useEffect, useRef, useState } = React;
const { motion } = window.framerMotion || { motion: { div: (p)=>React.createElement("div", p) } };

// ====== Ícones simples (SVG inline) ======
const Icon = {
  Shield: (props)=>(<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>),
  Sparkles: (props)=>(<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5L12 3zM19 14l.8 1.7L21.5 17l-1.7.7L19 19.5l-.7-1.8L16.5 17l1.8-1.3L19 14z"/></svg>),
  Terminal: (props)=>(<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M7 8l4 4-4 4M11 16h6"/><rect x="3" y="4" width="18" height="16" rx="2"/></svg>),
  Zap: (props)=>(<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>),
  Plug: (props)=>(<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 7v4M15 7v4M7 11h10M12 15v7"/><path d="M5 7h14"/></svg>),
  Cpu: (props)=>(<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="8" y="8" width="8" height="8"/><path d="M4 10v4M20 10v4M10 4h4M10 20h4"/></svg>),
  Settings: (props)=>(<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V22a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 6.04 3.2l.06.06a1.65 1.65 0 0 0 1.82.33H8a1.65 1.65 0 0 0 1-1.51V2a2 2 0 0 1 4 0v.09c0 .65.39 1.23 1 1.51.57.26 1.25.2 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.47.47-.59 1.17-.33 1.82.28.61.86 1 1.51 1H22a2 2 0 0 1 0 4h-.09c-.65 0-1.23.39-1.51 1z"/></svg>),
  Bot: (props)=>(<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="4" y="8" width="16" height="10" rx="2"/><path d="M9 8V6a3 3 0 1 1 6 0v2M9 14h.01M15 14h.01"/></svg>),
  User: (props)=>(<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21a8 8 0 1 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>),
  Loader: (props)=>(<svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" className={(props.className||"")+" animate-spin"}><path d="M21 12a9 9 0 1 1-9-9"/></svg>)
};

// ====== Helpers ======
function uid(){ return `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function twSwitch(active){
  return "px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 " +
         (active ? "bg-emerald-600/20 text-emerald-300 border-emerald-400/40"
                 : "bg-black/40 text-slate-400 border-emerald-400/20");
}

// ====== Componentes auxiliares ======
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

// ====== App (adaptado ao Pages, com DEMO) ======
function App(){
  const [messages, setMessages] = useState([{
    id:"sys1", role:"assistant",
    content:"Oi, eu sou seu agente de Pentest com IA. Diga o alvo, escopo e o que deseja (ex.: 'varrer portas', 'rodar nuclei', 'instalar nmap')."
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tools, setTools] = useState({ nmap:true, nuclei:true, subfinder:true, httpx:true });
  const bottomRef = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [messages, loading]);

  const DEMO = true;   // >>> quando plugar backend real, troque para false
  const API_URL = "/api/chat";

  async function sendMessage(){
    if(!input.trim()) return;
    const userMsg = { id: uid(), role: "user", content: input.trim() };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try{
      if(DEMO){
        // simula uma execução com base no texto digitado
        await new Promise(r=>setTimeout(r, 600));
        const ai = [
          "✔ Execução iniciada",
          `- alvo: ${userMsg.content.match(/\S+/) ?? "demo.headone.ai"}`,
          `- ferramentas: ${Object.entries(tools).filter(([,v])=>v).map(([k])=>k).join(", ") || "nenhuma"}`,
          "- nuclei: sem vulnerabilidades críticas",
          "- portas abertas: 80, 443",
          "",
          "Relatório simulado disponível na aba Relatórios."
        ].join("\n");
        setMessages(m => [...m, { id: uid(), role:"assistant", content: ai }]);
      }else{
        const res = await fetch(API_URL, {
          method:"POST", headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({ messages:[...messages, userMsg], tools })
        });
        if(!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMessages(m => [...m, { id: uid(), role: data.role || "assistant", content: data.content || "(resposta vazia)" }]);
      }
    }catch(err){
      setMessages(m => [...m, { id: uid(), role:"assistant", content:`Falha ao falar com o backend: ${err?.message || err}` }]);
    }finally{
      setLoading(false);
    }
  }
  function toggleTool(k){ setTools(t => ({ ...t, [k]: !t[k] })); }

  return (
    <div className="min-h-screen bg-[#0a0d10] text-slate-200 flex flex-col">
      {/* Top bar */}
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

          <div className="ml-auto flex items-center gap-2">
            <button onClick={()=>toggleTool("nmap")} className={twSwitch(tools.nmap)} title="Habilitar Nmap">
              <Icon.Terminal className="w-4 h-4" /><span className="hidden sm:inline">Nmap</span>
            </button>
            <button onClick={()=>toggleTool("nuclei")} className={twSwitch(tools.nuclei)} title="Habilitar Nuclei">
              <Icon.Zap className="w-4 h-4" /><span className="hidden sm:inline">Nuclei</span>
            </button>
            <button onClick={()=>toggleTool("subfinder")} className={twSwitch(tools.subfinder)} title="Habilitar Subfinder">
              <Icon.Plug className="w-4 h-4" /><span className="hidden sm:inline">Subfinder</span>
            </button>
            <button onClick={()=>toggleTool("httpx")} className={twSwitch(tools.httpx)} title="Habilitar httpx">
              <Icon.Cpu className="w-4 h-4" /><span className="hidden sm:inline">httpx</span>
            </button>
            <button className="ml-2 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 text-xs flex items-center gap-2">
              <Icon.Settings className="w-4 h-4" /> Config
            </button>
          </div>
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
            <Cmd cmd="instalar nmap" desc="Baixa e instala Nmap via pacote" />
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
        </aside>

        {/* Chat */}
        <section className="lg:col-span-9">
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
              <input
                value={input}
                onChange={(e)=>setInput(e.target.value)}
                onKeyDown={(e)=> (e.key==="Enter" && !e.shiftKey ? sendMessage() : null)}
                placeholder="Ex.: recon advancedinfo.com.br"
                className="flex-1 bg-black/50 text-slate-100 placeholder:text-slate-500 rounded-xl px-4 py-3 border border-emerald-400/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
              <button onClick={sendMessage} className="px-4 py-3 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white border border-emerald-400/30 flex items-center gap-2">
                {/* paper plane */}<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                Enviar
              </button>
            </div>
          </div>
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

// ====== Render ======
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
