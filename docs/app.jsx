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
  Shield:(p)=>(<svg {...p} viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>),
  Sparkles:(p)=>(<svg {...p} viewBox="0 0 24 24"><path d="M12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5L12 3zM19 14l.8 1.7L21.5 17l-1.7.7L19 19.5l-.7-1.8L16.5 17l1.8-1.3L19 14z"/></svg>),
  Terminal:(p)=>(<svg {...p} viewBox="0 0 24 24"><path d="M7 8l4 4-4 4M11 16h6"/><rect x="3" y="4" width="18" height="16" rx="2"/></svg>),
  Zap:(p)=>(<svg {...p} viewBox="0 0 24 24"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>),
  Plug:(p)=>(<svg {...p} viewBox="0 0 24 24"><path d="M9 7v4M15 7v4M7 11h10M12 15v7"/></svg>),
  Cpu:(p)=>(<svg {...p} viewBox="0 0 24 24"><rect x="8" y="8" width="8" height="8"/><path d="M4 10v4M20 10v4M10 4h4M10 20h4"/></svg>),
  Settings:(p)=>(<svg {...p} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/></svg>),
  Bot:(p)=>(<svg {...p} viewBox="0 0 24 24"><rect x="4" y="8" width="16" height="10" rx="2"/><circle cx="12" cy="6" r="3"/></svg>),
  User:(p)=>(<svg {...p} viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>),
  Loader:(p)=>(<svg {...p} viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" /></svg>),
  Download:(p)=>(<svg {...p} viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>)
};

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
    <div className="min-h-screen bg-[#0a0d10] text-slate-200 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-emerald-400/30 bg-black/40 p-6 shadow-neon">
        <h2 className="text-emerald-300 font-bold text-lg mb-4">HeadOne — Login</h2>
        <form onSubmit={submit} className="space-y-3">
          <input className="w-full bg-black/60 border border-emerald-400/30 rounded-xl px-4 py-3"
                 placeholder="e-mail (qualquer)" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full bg-black/60 border border-emerald-400/30 rounded-xl px-4 py-3"
                 placeholder="senha demo (headone-demo)" value={pass} onChange={e=>setPass(e.target.value)} type="password" />
          {err && <div className="text-red-400 text-sm">{err}</div>}
          <button className="w-full px-4 py-3 rounded-xl bg-emerald-600 text-white">Entrar</button>
        </form>
      </div>
    </div>
  );
}

// ========================= HOME =========================
function Home({ onEnter }){
  const hasToken = !!localStorage.getItem(TOKEN_KEY);
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0d10] text-slate-200">
      <main className="max-w-4xl mx-auto flex-1 px-6 py-12">
        <h1 className="text-3xl font-bold text-emerald-300 mb-4">🛡️ HeadOne — Pentest AI</h1>
        <p className="text-slate-300 mb-6">Pentest com IA rápido, contínuo e com relatórios executivos.</p>
        <div className="flex gap-4">
          {!hasToken ? (
            <button onClick={()=>onEnter("login")}
              className="px-6 py-3 rounded-xl bg-emerald-600 text-white">Entrar no Sistema</button>
          ) : (
            <button onClick={()=>onEnter("app")}
              className="px-6 py-3 rounded-xl bg-emerald-600 text-white">Ir para Dashboard</button>
          )}
          <a href="#contato" className="px-6 py-3 rounded-xl border border-emerald-400 text-emerald-300">Falar com Comercial</a>
        </div>
      </main>
    </div>
  );
}

// ========================= DASHBOARD (mock) =========================
function App({ onLogout }){
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0d10] text-slate-200">
      <header className="p-4 border-b border-emerald-400/30 flex justify-between">
        <span className="text-emerald-300 font-bold">HeadOne Dashboard</span>
        <button onClick={onLogout} className="text-sm border border-emerald-400 px-3 py-1 rounded-lg">Sair</button>
      </header>
      <main className="p-6 flex-1">
        <p>📊 Aqui vem o console, fila e relatórios (mock por enquanto).</p>
      </main>
    </div>
  );
}

// ========================= ROOT com hash routing =========================
function Root(){
  const [stage, setStage] = useState("home");

  useEffect(()=>{
    const initial = (location.hash.replace("#/", "") || "home");
    setStage(initial);
  },[]);

  useEffect(()=>{
    const onHash = ()=> setStage(location.hash.replace("#/", "") || "home");
    window.addEventListener("hashchange", onHash);
    return ()=> window.removeEventListener("hashchange", onHash);
  },[]);

  const go = (next)=>{ location.hash = `#/${next}`; setStage(next); };

  if(stage==="home") return <Home onEnter={go} />;
  if(stage==="login") return <Login onOk={()=>go("app")} />;
  if(stage==="app") return <App onLogout={()=>{ localStorage.removeItem(TOKEN_KEY); go("home"); }} />;
  return <Home onEnter={go} />;
}

// render
ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
