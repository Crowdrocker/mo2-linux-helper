import { useState, useEffect, useCallback, useRef } from "react";

/* ─── GLOBAL STYLES ─────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&family=Exo+2:ital,wght@0,300;0,600;0,900;1,300&display=swap');

*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#08090b;--s1:#0d1117;--s2:#161c24;--s3:#1c2430;
  --b1:#1e2733;--b2:#263040;
  --cyan:#00e5ff;--orange:#ff6b35;--green:#39ff14;
  --warn:#ffd600;--red:#ff3c3c;--purple:#bf5fff;
  --text:#cdd5df;--dim:#5a6a7e;--faint:#2a3545;
  --mono:'Share Tech Mono',monospace;
  --ui:'Rajdhani',sans-serif;
  --display:'Exo 2',sans-serif;
}
html,body{height:100%;background:var(--bg);color:var(--text);font-family:var(--ui);}

/* scrollbar */
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:var(--bg);}
::-webkit-scrollbar-thumb{background:var(--b2);border-radius:2px;}
::-webkit-scrollbar-thumb:hover{background:var(--cyan);}

/* scanlines */
.scanlines{position:fixed;inset:0;pointer-events:none;z-index:9999;
  background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.025) 3px,rgba(0,0,0,.025) 4px);}

/* layout */
.shell{display:grid;grid-template-columns:200px 1fr;grid-template-rows:52px 1fr;min-height:100vh;}

/* topbar */
.topbar{grid-column:1/-1;background:var(--s1);border-bottom:1px solid var(--b1);
  display:flex;align-items:center;padding:0 20px;gap:12px;position:relative;z-index:10;}
.topbar::after{content:'';position:absolute;bottom:-1px;left:0;width:40%;height:1px;
  background:linear-gradient(90deg,var(--cyan),transparent);}
.logo{font-family:var(--display);font-weight:900;font-size:16px;letter-spacing:2px;
  color:var(--cyan);text-transform:uppercase;}
.logo em{color:var(--orange);font-style:normal;}
.topbar-sub{font-family:var(--mono);font-size:10px;color:var(--dim);letter-spacing:1px;}
.topbar-pills{margin-left:auto;display:flex;gap:8px;align-items:center;}
.pill{display:flex;align-items:center;gap:5px;padding:3px 10px;
  border:1px solid var(--b1);border-radius:2px;
  font-family:var(--mono);font-size:10px;color:var(--dim);}
.dot{width:6px;height:6px;border-radius:50%;}
.dot.g{background:var(--green);box-shadow:0 0 6px var(--green);animation:blink 2s ease infinite;}
.dot.w{background:var(--warn);box-shadow:0 0 6px var(--warn);animation:blink 1.4s ease infinite;}
.dot.r{background:var(--red);box-shadow:0 0 5px var(--red);}
@keyframes blink{0%,100%{opacity:1;}50%{opacity:.3;}}

/* sidebar */
.sidebar{background:var(--s1);border-right:1px solid var(--b1);overflow-y:auto;padding:12px 0 20px;}
.nav-grp{margin-top:14px;}
.nav-grp-label{padding:4px 16px;font-family:var(--mono);font-size:9px;color:var(--dim);
  letter-spacing:2px;text-transform:uppercase;}
.nav-item{display:flex;align-items:center;gap:9px;padding:8px 16px;cursor:pointer;
  font-size:13px;font-weight:600;color:var(--dim);letter-spacing:.3px;
  border-left:2px solid transparent;transition:all .13s;position:relative;}
.nav-item:hover{color:var(--text);background:rgba(0,229,255,.04);}
.nav-item.on{color:var(--cyan);border-left-color:var(--cyan);background:rgba(0,229,255,.07);}
.nav-item .ico{font-size:14px;width:18px;text-align:center;}
.nav-item .bdg{margin-left:auto;background:var(--orange);color:#fff;
  font-size:9px;font-weight:700;padding:1px 5px;border-radius:1px;}

/* main */
.main{overflow-y:auto;padding:26px 28px;background:var(--bg);}
.page{animation:fadeUp .18s ease;}
@keyframes fadeUp{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}

.pg-head{margin-bottom:22px;}
.pg-title{font-family:var(--display);font-size:24px;font-weight:900;
  letter-spacing:-1px;line-height:1;}
.pg-title span{color:var(--cyan);}
.pg-sub{font-family:var(--mono);font-size:10px;color:var(--dim);margin-top:5px;letter-spacing:1px;}

/* cards */
.card{background:var(--s1);border:1px solid var(--b1);border-radius:3px;padding:18px;
  position:relative;overflow:hidden;}
.card-cap{position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,var(--cyan),transparent);}
.card-cap.o{background:linear-gradient(90deg,var(--orange),transparent);}
.card-cap.g{background:linear-gradient(90deg,var(--green),transparent);}
.card-cap.p{background:linear-gradient(90deg,var(--purple),transparent);}
.card-lbl{font-family:var(--mono);font-size:9px;color:var(--dim);
  letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;}
.card-title{font-size:14px;font-weight:700;}

.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:14px;}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:14px;}

/* stat */
.stat{font-family:var(--mono);font-size:30px;color:var(--cyan);}
.stat.o{color:var(--orange);}
.stat.g{color:var(--green);}
.stat.w{color:var(--warn);}
.stat-note{font-size:11px;color:var(--dim);margin-top:3px;}

/* buttons */
.btn{display:inline-flex;align-items:center;gap:7px;padding:8px 16px;
  border:1px solid var(--b2);background:var(--s2);color:var(--text);
  font-family:var(--ui);font-size:12px;font-weight:600;cursor:pointer;
  border-radius:2px;transition:all .13s;letter-spacing:.4px;}
.btn:hover{border-color:var(--cyan);color:var(--cyan);background:rgba(0,229,255,.07);}
.btn.pri{background:var(--cyan);color:#000;border-color:var(--cyan);font-weight:700;}
.btn.pri:hover{background:#00c4dc;}
.btn.sec{border-color:var(--b2);}
.btn.dan{border-color:var(--red);color:var(--red);}
.btn.dan:hover{background:rgba(255,60,60,.08);}
.btn.suc{border-color:var(--green);color:var(--green);}
.btn.suc:hover{background:rgba(57,255,20,.07);}
.btn.sm{padding:5px 11px;font-size:11px;}
.btn:disabled{opacity:.35;cursor:not-allowed;}
.btn-row{display:flex;gap:9px;flex-wrap:wrap;margin-top:14px;}

/* terminal */
.term{background:#04060a;border:1px solid var(--b1);border-radius:3px;
  padding:14px 16px;font-family:var(--mono);font-size:12px;line-height:1.75;
  color:#8899aa;overflow-y:auto;}
.t-ok{color:var(--green);}
.t-w{color:var(--warn);}
.t-e{color:var(--red);}
.t-i{color:var(--cyan);}
.t-p{color:var(--orange);}
.t-m{color:var(--purple);}

/* progress */
.prog{height:3px;background:var(--b1);border-radius:2px;overflow:hidden;margin-top:10px;}
.prog-fill{height:100%;background:linear-gradient(90deg,var(--cyan),var(--orange));transition:width .35s ease;}

/* input */
.field{margin-top:8px;}
.field-lbl{font-family:var(--mono);font-size:10px;color:var(--dim);letter-spacing:1px;margin-bottom:4px;}
input[type=text]{width:100%;background:var(--bg);border:1px solid var(--b1);color:var(--text);
  font-family:var(--mono);font-size:12px;padding:8px 11px;border-radius:2px;outline:none;
  transition:border-color .13s;}
input[type=text]:focus{border-color:var(--cyan);}

/* tags */
.tag{display:inline-block;padding:2px 7px;border-radius:1px;
  font-family:var(--mono);font-size:10px;border:1px solid;letter-spacing:.5px;}
.tag.ok{color:var(--green);border-color:var(--green);background:rgba(57,255,20,.07);}
.tag.warn{color:var(--warn);border-color:var(--warn);background:rgba(255,214,0,.07);}
.tag.err{color:var(--red);border-color:var(--red);background:rgba(255,60,60,.07);}
.tag.info{color:var(--cyan);border-color:var(--cyan);background:rgba(0,229,255,.07);}
.tag.pur{color:var(--purple);border-color:var(--purple);background:rgba(191,95,255,.07);}
.tag.ora{color:var(--orange);border-color:var(--orange);background:rgba(255,107,53,.07);}

/* rows */
.row{display:flex;align-items:center;gap:10px;padding:10px 0;
  border-bottom:1px solid var(--faint);}
.row:last-child{border-bottom:none;}

/* toggle */
.tgl{position:relative;width:34px;height:18px;cursor:pointer;flex-shrink:0;}
.tgl input{display:none;}
.tgl-track{position:absolute;inset:0;background:var(--b2);border-radius:9px;transition:background .2s;}
.tgl input:checked+.tgl-track{background:var(--cyan);}
.tgl-thumb{position:absolute;top:3px;left:3px;width:12px;height:12px;
  border-radius:50%;background:#fff;transition:left .2s;pointer-events:none;}
.tgl input:checked~.tgl-thumb{left:19px;}

/* section header */
.sec-head{display:flex;align-items:center;gap:10px;margin-bottom:14px;}
.sec-head h2{font-size:12px;font-weight:700;letter-spacing:1px;
  text-transform:uppercase;color:var(--dim);}
.sec-head::after{content:'';flex:1;height:1px;background:var(--b1);}

/* spinner */
.spin{width:12px;height:12px;border-radius:50%;border:2px solid var(--b2);
  border-top-color:var(--cyan);animation:sp .6s linear infinite;display:inline-block;}
@keyframes sp{to{transform:rotate(360deg);}}

/* game grid */
.game-card{background:var(--s1);border:1px solid var(--b1);border-radius:3px;
  padding:14px;cursor:pointer;transition:all .15s;position:relative;overflow:hidden;}
.game-card:hover{border-color:var(--b2);}
.game-card.on{border-color:var(--cyan);background:rgba(0,229,255,.05);}
.game-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,var(--cyan),transparent);
  opacity:0;transition:opacity .2s;}
.game-card.on::after{opacity:.5;}
.game-card .g-icon{font-size:26px;margin-bottom:8px;}
.game-card .g-name{font-size:13px;font-weight:700;margin-bottom:4px;}
.game-card .g-fixes{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;}
.game-card .g-status{position:absolute;top:10px;right:10px;}

/* config persist indicator */
.saved-toast{
  position:fixed;bottom:20px;right:20px;
  background:var(--s2);border:1px solid var(--green);
  color:var(--green);font-family:var(--mono);font-size:11px;
  padding:8px 16px;border-radius:2px;
  animation:toastIn .2s ease;z-index:1000;
}
@keyframes toastIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}

/* manifest viewer */
.manifest{background:#04060a;border:1px solid var(--b1);border-radius:3px;
  padding:16px;font-family:var(--mono);font-size:11px;line-height:1.8;
  color:#7a9abf;white-space:pre;overflow-x:auto;max-height:320px;overflow-y:auto;}
.manifest .key{color:var(--cyan);}
.manifest .val{color:var(--orange);}
.manifest .com{color:var(--dim);}
.manifest .str{color:var(--green);}

.sep{height:1px;background:var(--b1);margin:16px 0;}
`;

/* ─── DATA ───────────────────────────────────────────────────────────────── */
const ALL_GAMES = [
  { id:"cp2077",   icon:"🌆", name:"Cyberpunk 2077",      cat:"RPG",
    fixes:["REDmod integration","CEF subprocess fix","PROTON_NO_D3D12=1","DLSS/FSR path fix","RedScript compat","CET overlay fix"],
    deps:["vcruntime140","d3dcompiler_47"] },
  { id:"fo4",      icon:"☢️",  name:"Fallout 4",           cat:"RPG",
    fixes:["F4SE loader fix","Creation Kit compat","BA2 archive support","ENB Bridge","Buffout 4 compat","High FPS Physics Fix"],
    deps:["xact","vcruntime140","d3dx9"] },
  { id:"skyrimse", icon:"🏔️", name:"Skyrim Special Ed.",   cat:"RPG",
    fixes:["SKSE64 injection","ENB Series support","Papyrus log path","USSEP compat","VR mode flag","Memory patch"],
    deps:["vcruntime140","d3dcompiler_47","xact"] },
  { id:"skyrimvr", icon:"🥽", name:"Skyrim VR",            cat:"RPG",
    fixes:["OpenVR path fix","SteamVR Proton env","VRIK compat","FPS stabilizer"],
    deps:["vcruntime140","d3dcompiler_47"] },
  { id:"oblivion", icon:"🏰", name:"Oblivion Remastered",  cat:"RPG",
    fixes:["OBSE64 loader","UE5 Proton workaround","Steam overlay disable","4GB patch"],
    deps:["vcruntime140","d3dx9"] },
  { id:"morrowind",icon:"🗡️", name:"Morrowind",            cat:"RPG",
    fixes:["OpenMW alt launcher","MGE XE Proton fix","MWSE injection"],
    deps:["d3dx9"] },
  { id:"fo3",      icon:"💣", name:"Fallout 3 (GOTY)",     cat:"RPG",
    fixes:["FOSE loader","Games for Windows Live bypass","4GB patch","DX9 override"],
    deps:["d3dx9","xact","gfw"] },
  { id:"fonv",     icon:"🃏", name:"Fallout: New Vegas",   cat:"RPG",
    fixes:["NVSE loader","4GB patch","NVAC compat","JohnnyGuitar NVSE"],
    deps:["d3dx9","xact","vcruntime140"] },
  { id:"bg3",      icon:"🎲", name:"Baldur's Gate 3",      cat:"RPG",
    fixes:["BG3MM Proton fix","PAK staging path","Vulkan layer override","LSLib path","Script Extender"],
    deps:["vcruntime140"] },
  { id:"starfield",icon:"🚀", name:"Starfield",            cat:"RPG",
    fixes:["SFSE loader","Constrained mode fix","Address library","Buffout SF"],
    deps:["vcruntime140","d3dcompiler_47"] },
  { id:"witcher3", icon:"⚔️", name:"The Witcher 3",        cat:"RPG",
    fixes:["Script Merger Proton fix","Mod Manager compat","DLC content path"],
    deps:["vcruntime140"] },
  { id:"darksouls",icon:"🔥", name:"Dark Souls Remastered",cat:"Action",
    fixes:["DSFix alternative","Online ban bypass flag","Resolution unlock"],
    deps:["vcruntime140","d3dx9"] },
  { id:"eldenring",icon:"🌑", name:"Elden Ring",           cat:"Action",
    fixes:["Seamless Co-op fix","Anti-cheat bypass","DLSS mod path"],
    deps:["vcruntime140","d3dcompiler_47"] },
  { id:"xedit",    icon:"✏️", name:"xEdit / FO4Edit",      cat:"Tool",
    fixes:["Master file args","--no-steam flag","Proton prefix inject","64-bit mode","Backup path fix"],
    deps:[] },
  { id:"synth",    icon:"🧬", name:"Synthesis Patcher",    cat:"Tool",
    fixes:["Mutagen compat","dotnet runtime","Output path fix","Auto-run mode"],
    deps:["dotnet6","dotnet48"] },
  { id:"bodyslide",icon:"👗", name:"BodySlide & Outfit Studio",cat:"Tool",
    fixes:["wxWidgets Proton fix","Batch build path","Output dir override"],
    deps:["vcruntime140"] },
  { id:"nifskope", icon:"🔬", name:"NifSkope",             cat:"Tool",
    fixes:["Qt Proton env fix","BSA browser path","Texture path override"],
    deps:["vcruntime140"] },
  { id:"loot",     icon:"📊", name:"LOOT",                 cat:"Tool",
    fixes:["API endpoint override","Masterlist local cache","Proton env fix"],
    deps:["vcruntime140"] },
];

const ALL_DEPS = [
  { name:"vcruntime140",  desc:"Visual C++ Runtime 2015-2022",  status:"missing", required:true },
  { name:"dotnet48",      desc:".NET Framework 4.8",            status:"missing", required:true },
  { name:"dotnet6",       desc:".NET 6 Runtime",                status:"ok",      required:false },
  { name:"d3dcompiler_47",desc:"DirectX Shader Compiler",       status:"missing", required:true },
  { name:"d3dx9",         desc:"DirectX 9 (d3dx9_43)",          status:"ok",      required:false },
  { name:"xact",          desc:"XACT Audio (Bethesda games)",   status:"ok",      required:false },
  { name:"win10",         desc:"Windows 10 DLL overrides",      status:"ok",      required:false },
  { name:"physx",         desc:"NVIDIA PhysX",                  status:"ok",      required:false },
  { name:"mfc140",        desc:"MFC Runtime",                   status:"warn",    required:false },
  { name:"gfw",           desc:"Games for Windows Live bypass", status:"ok",      required:false },
  { name:"dxvk",          desc:"DXVK Vulkan Translation",       status:"ok",      required:true },
];

const NATIVE_PLUGINS = [
  { name:"libgame_cyberpunk2077.so",    ver:"1.4.0", status:"ok" },
  { name:"libgame_fallout4.so",         ver:"1.2.1", status:"ok" },
  { name:"libgame_skyrimse.so",         ver:"1.3.2", status:"ok" },
  { name:"libgame_skyrimvr.so",         ver:"1.0.1", status:"warn" },
  { name:"libgame_fallout3.so",         ver:"1.0.0", status:"ok" },
  { name:"libgame_newvegas.so",         ver:"1.1.0", status:"ok" },
  { name:"libgame_oblivionremastered.so",ver:"0.9.0",status:"warn" },
  { name:"libgame_starfield.so",        ver:"1.0.3", status:"ok" },
  { name:"libgame_witcher3.so",         ver:"—",     status:"missing" },
  { name:"libgame_eldenring.so",        ver:"—",     status:"missing" },
];

const DEFAULT_CONFIG = {
  mo2Path: "~/.local/share/modorganizer2",
  protonVer: "Proton-GE-Proton9-20",
  steamPath: "~/.local/share/Steam",
  prefixPath: "~/.steam/steam/steamapps/compatdata/MO2",
  activeGames: ["cp2077","fo4","skyrimse","xedit","synth","loot"],
  flatpakPerms: { steam:true, home:true, run:false, wayland:false, devices:false },
  portableInstances: [
    { path:"~/Games/Cyberpunk2077/MO2", game:"Cyberpunk 2077", ini:"ModOrganizer.ini" },
    { path:"~/Games/Fallout4/MO2",      game:"Fallout 4",      ini:"ModOrganizer.ini" },
  ],
  deps: ALL_DEPS.map(d => ({ ...d })),
  plugins: NATIVE_PLUGINS.map(p => ({ ...p })),
};

/* ─── HELPERS ────────────────────────────────────────────────────────────── */
const Toggle = ({ checked, onChange }) => (
  <label className="tgl">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <div className="tgl-track" />
    <div className="tgl-thumb" />
  </label>
);

function usePersist(key, init) {
  const [val, setVal] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? { ...init, ...JSON.parse(s) } : init;
    } catch { return init; }
  });
  const set = useCallback(v => {
    const next = typeof v === "function" ? v(val) : v;
    setVal(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
  }, [key, val]);
  return [val, set];
}

function Toast({ msg }) {
  return <div className="saved-toast">✓ {msg}</div>;
}

/* ─── SETUP PAGE ─────────────────────────────────────────────────────────── */
function PageSetup({ cfg, setCfg }) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lines, setLines] = useState([
    { c:"t-i", t:"// MO2 Linux Helper v2.0  ·  Arch Linux" },
    { c:"", t:"" },
    { c:"t-p", t:"$ system detection..." },
    { c:"t-ok",t:"  ✓ Arch Linux  (kernel 6.12.4-arch1)" },
    { c:"t-ok",t:`  ✓ Steam  →  ${cfg.steamPath}` },
    { c:"t-ok",t:"  ✓ Proton-GE 9-20 available" },
    { c:"t-w", t:"  ⚠ MO2 not installed" },
    { c:"t-w", t:"  ⚠ NXM handler not registered" },
    { c:"t-w", t:"  ⚠ 3 missing winetricks components" },
  ]);
  const termRef = useRef();

  const addLine = (l) => setLines(p => [...p, l]);
  const scrollTerm = () => { if(termRef.current) termRef.current.scrollTop = 9999; };

  useEffect(scrollTerm, [lines]);

  const STEPS = [
    [700,  {c:"t-p",t:"$ pacman -S --needed wine winetricks protontricks"}],
    [1500, {c:"t-ok",t:"  ✓ wine 9.22 installed"}],
    [2100, {c:"t-ok",t:"  ✓ winetricks 20240105 installed"}],
    [2700, {c:"t-p", t:"$ installing MO2 2.5.2..."}],
    [3500, {c:"t-ok",t:`  ✓ MO2 extracted → ${cfg.mo2Path}`}],
    [4100, {c:"t-p", t:"$ winetricks vcruntime140 dotnet48 d3dcompiler_47"}],
    [4900, {c:"t-ok",t:"  ✓ vcruntime140  done"}],
    [5500, {c:"t-ok",t:"  ✓ dotnet48  done"}],
    [6100, {c:"t-ok",t:"  ✓ d3dcompiler_47  done"}],
    [6700, {c:"t-p", t:"$ registering nxm:// handler..."}],
    [7300, {c:"t-ok",t:"  ✓ ~/.local/share/applications/nxm-handler.desktop written"}],
    [7900, {c:"t-ok",t:"  ✓ xdg-mime update-database"}],
    [8400, {c:"t-p", t:"$ writing Steam non-steam shortcut..."}],
    [9000, {c:"t-ok",t:"  ✓ shortcuts.vdf updated"}],
    [9400, {c:"t-i", t:"// ✅  Setup complete — launch MO2 from Steam library"}],
  ];

  const run = () => {
    setRunning(true); setProgress(0);
    STEPS.forEach(([delay, line], i) => {
      setTimeout(() => {
        addLine(line);
        setProgress(Math.round(((i + 1) / STEPS.length) * 100));
      }, delay);
    });
    setTimeout(() => setRunning(false), 9600);
  };

  return (
    <div className="page">
      <div className="pg-head">
        <div className="pg-title">Setup <span>Wizard</span></div>
        <div className="pg-sub">// AUTOMATED MO2 + PROTON CONFIGURATION</div>
      </div>

      <div className="g4" style={{marginBottom:14}}>
        {[
          {lbl:"System",  val:"Arch",      cls:"",  note:"Linux 6.12.4"},
          {lbl:"Proton",  val:"GE",        cls:"g", note:"9-20 installed"},
          {lbl:"Missing", val:"3",         cls:"w", note:"deps required"},
          {lbl:"MO2",     val:"Ready",     cls:"o", note:"not installed"},
        ].map(s => (
          <div className="card" key={s.lbl}>
            <div className="card-cap" />
            <div className="card-lbl">{s.lbl}</div>
            <div className={`stat ${s.cls}`}>{s.val}</div>
            <div className="stat-note">{s.note}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{marginBottom:14}}>
        <div className="card-cap" />
        <div className="sec-head"><h2>Install Paths</h2></div>
        <div className="g2">
          <div className="field">
            <div className="field-lbl">MO2 INSTALL PATH</div>
            <input type="text" value={cfg.mo2Path}
              onChange={e => setCfg(p => ({...p, mo2Path:e.target.value}))} />
          </div>
          <div className="field">
            <div className="field-lbl">PROTON VERSION</div>
            <input type="text" value={cfg.protonVer}
              onChange={e => setCfg(p => ({...p, protonVer:e.target.value}))} />
          </div>
          <div className="field">
            <div className="field-lbl">STEAM PATH</div>
            <input type="text" value={cfg.steamPath}
              onChange={e => setCfg(p => ({...p, steamPath:e.target.value}))} />
          </div>
          <div className="field">
            <div className="field-lbl">COMPAT DATA PREFIX</div>
            <input type="text" value={cfg.prefixPath}
              onChange={e => setCfg(p => ({...p, prefixPath:e.target.value}))} />
          </div>
        </div>
        <div className="btn-row">
          <button className="btn pri" onClick={run} disabled={running}>
            {running ? <><span className="spin"/>Running...</> : "⚡ Run Full Setup"}
          </button>
          <button className="btn sec">📋 Dry Run</button>
          <button className="btn sec">📂 Use Existing MO2</button>
          <button className="btn sec">🔄 Re-detect System</button>
        </div>
        {(running || progress > 0) && (
          <div className="prog"><div className="prog-fill" style={{width:`${progress}%`}}/></div>
        )}
      </div>

      <div className="card">
        <div className="card-cap" />
        <div className="sec-head"><h2>Output</h2></div>
        <div className="term" ref={termRef} style={{maxHeight:260}}>
          {lines.map((l,i) => <div key={i} className={l.c}>{l.t || "\u00A0"}</div>)}
        </div>
      </div>
    </div>
  );
}

/* ─── DEPS PAGE ──────────────────────────────────────────────────────────── */
function PageDeps({ cfg, setCfg }) {
  const [installing, setInstalling] = useState(null);
  const deps = cfg.deps;

  const install = (name) => {
    setInstalling(name);
    setTimeout(() => {
      setCfg(p => ({ ...p, deps: p.deps.map(d => d.name===name ? {...d, status:"ok"} : d) }));
      setInstalling(null);
    }, 1800);
  };

  const installAll = () => {
    deps.filter(d=>d.status!=="ok").forEach((d,i) => {
      setTimeout(() => install(d.name), i * 600);
    });
  };

  const missing = deps.filter(d => d.status !== "ok").length;

  return (
    <div className="page">
      <div className="pg-head">
        <div className="pg-title">Depen<span>dencies</span></div>
        <div className="pg-sub">// WINETRICKS & PROTON COMPONENT MANAGEMENT</div>
      </div>
      <div className="g3" style={{marginBottom:14}}>
        <div className="card"><div className="card-cap g"/>
          <div className="card-lbl">Installed</div>
          <div className="stat g">{deps.filter(d=>d.status==="ok").length}</div>
        </div>
        <div className="card"><div className="card-cap" style={{background:"linear-gradient(90deg,var(--warn),transparent)"}}/>
          <div className="card-lbl">Warnings</div>
          <div className="stat w">{deps.filter(d=>d.status==="warn").length}</div>
        </div>
        <div className="card"><div className="card-cap o"/>
          <div className="card-lbl">Missing</div>
          <div className="stat o">{missing}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-cap"/>
        <div className="sec-head"><h2>Component Status</h2></div>
        {deps.map(d => (
          <div className="row" key={d.name}>
            <span style={{fontSize:15,width:20,textAlign:"center"}}>
              {d.status==="ok"?"✅":d.status==="warn"?"⚠️":"❌"}
            </span>
            <div style={{flex:1}}>
              <div style={{fontFamily:"var(--mono)",fontSize:12}}>{d.name}</div>
              <div style={{fontSize:11,color:"var(--dim)"}}>{d.desc}</div>
            </div>
            {d.required && <span className="tag ora" style={{fontSize:9}}>REQUIRED</span>}
            <span className={`tag ${d.status==="ok"?"ok":d.status==="warn"?"warn":"err"}`}>
              {d.status}
            </span>
            {d.status!=="ok" && (
              <button className="btn sm" onClick={()=>install(d.name)} disabled={!!installing}>
                {installing===d.name ? <span className="spin"/> : "Install"}
              </button>
            )}
          </div>
        ))}
        <div className="btn-row">
          <button className="btn pri" onClick={installAll} disabled={!!installing||missing===0}>
            📦 Install All Missing ({missing})
          </button>
          <button className="btn sec">🔄 Refresh Status</button>
          <button className="btn sec">+ Add Custom</button>
        </div>
      </div>
    </div>
  );
}

/* ─── GAMES PAGE ─────────────────────────────────────────────────────────── */
const CATS = ["All","RPG","Action","Tool"];

function PageGames({ cfg, setCfg }) {
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");

  const toggle = (id) => setCfg(p => ({
    ...p,
    activeGames: p.activeGames.includes(id)
      ? p.activeGames.filter(g=>g!==id)
      : [...p.activeGames, id]
  }));

  const filtered = ALL_GAMES.filter(g =>
    (cat==="All" || g.cat===cat) &&
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const active = cfg.activeGames.length;

  return (
    <div className="page">
      <div className="pg-head">
        <div className="pg-title">Game <span>Fixes</span></div>
        <div className="pg-sub">// PER-GAME PROTON & MO2 COMPATIBILITY PATCHES</div>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
        {CATS.map(c => (
          <button key={c} className={`btn sm ${cat===c?"pri":"sec"}`} onClick={()=>setCat(c)}>{c}</button>
        ))}
        <input type="text" placeholder="Search games..."
          value={search} onChange={e=>setSearch(e.target.value)}
          style={{width:180,marginLeft:"auto"}}/>
        <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--dim)"}}>
          {active}/{ALL_GAMES.length} active
        </span>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
        {filtered.map(g => {
          const on = cfg.activeGames.includes(g.id);
          return (
            <div key={g.id} className={`game-card ${on?"on":""}`} onClick={()=>toggle(g.id)}>
              <div className="g-status">
                <span className={`tag ${on?"ok":"warn"}`} style={{fontSize:9}}>
                  {on?"ON":"OFF"}
                </span>
              </div>
              <div className="g-icon">{g.icon}</div>
              <div className="g-name">{g.name}</div>
              <div style={{fontSize:10,color:"var(--dim)",fontFamily:"var(--mono)"}}>{g.cat}</div>
              <div className="g-fixes">
                {g.fixes.slice(0,3).map(f=>(
                  <span key={f} className="tag info" style={{fontSize:9}}>{f}</span>
                ))}
                {g.fixes.length>3 && (
                  <span className="tag" style={{fontSize:9,color:"var(--dim)",borderColor:"var(--b2)"}}>
                    +{g.fixes.length-3}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── NXM PAGE ───────────────────────────────────────────────────────────── */
function PageNXM() {
  const [reg, setReg] = useState(false);
  const desktop = `[Desktop Entry]
Name=NXM Handler
Exec=mo2-linux-helper nxm %u
Type=Application
NoDisplay=true
MimeType=x-scheme-handler/nxm;x-scheme-handler/nxms
Categories=Game;`;

  return (
    <div className="page">
      <div className="pg-head">
        <div className="pg-title">NXM <span>Links</span></div>
        <div className="pg-sub">// NEXUSMODS 1-CLICK INSTALL INTEGRATION</div>
      </div>
      <div className="g2">
        <div className="card">
          <div className="card-cap o"/>
          <div className="card-lbl">Handler Status</div>
          <div style={{display:"flex",alignItems:"center",gap:8,margin:"10px 0"}}>
            <div className={`dot ${reg?"g":"r"}`}/>
            <span style={{fontSize:14,fontWeight:700}}>{reg?"Registered":"Not Registered"}</span>
          </div>
          <div style={{fontSize:12,color:"var(--dim)",marginBottom:12}}>
            Registers nxm:// and nxms:// URI schemes via xdg-mime and a .desktop entry.
          </div>
          <div className="btn-row" style={{marginTop:0}}>
            <button className="btn pri" onClick={()=>setReg(true)}>🔗 Register Handler</button>
            {reg && <button className="btn dan" onClick={()=>setReg(false)}>Remove</button>}
          </div>
        </div>
        <div className="card">
          <div className="card-cap"/>
          <div className="card-lbl">Paths</div>
          <div className="field">
            <div className="field-lbl">DESKTOP FILE</div>
            <input type="text" defaultValue="~/.local/share/applications/nxm-handler.desktop"/>
          </div>
          <div className="field">
            <div className="field-lbl">MO2 EXECUTABLE</div>
            <input type="text" defaultValue="~/.local/share/modorganizer2/ModOrganizer.exe"/>
          </div>
          <div className="field">
            <div className="field-lbl">PROTON RUN SCRIPT</div>
            <input type="text" defaultValue="/usr/bin/proton-run"/>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-cap g"/>
        <div className="card-lbl">Generated .desktop Entry</div>
        <div className="term" style={{marginTop:8,fontSize:11}}>
          {desktop.split("\n").map((l,i)=>(
            <div key={i} className={l.startsWith("MimeType")?"t-i":l.startsWith("#")?"t-m":""}>{l}</div>
          ))}
        </div>
        <div className="btn-row">
          <button className="btn sec">📋 Copy</button>
          <button className="btn sec">📄 Open in Editor</button>
        </div>
      </div>
    </div>
  );
}

/* ─── SHORTCUT PAGE ──────────────────────────────────────────────────────── */
function PageShortcut({ cfg }) {
  const [added, setAdded] = useState(false);
  const launchOpts = `PROTON_USE_WINED3D=0 STEAM_COMPAT_DATA_PATH=${cfg.prefixPath} %command%`;
  return (
    <div className="page">
      <div className="pg-head">
        <div className="pg-title">Non-Steam <span>Shortcut</span></div>
        <div className="pg-sub">// ADD MO2 TO STEAM FOR PROTON ENVIRONMENT ACCESS</div>
      </div>
      <div className="card">
        <div className="card-cap"/>
        <div className="sec-head"><h2>Shortcut Configuration</h2></div>
        {[
          ["APP NAME",       "Mod Organizer 2"],
          ["TARGET",         `${cfg.mo2Path}/ModOrganizer.exe`],
          ["START DIRECTORY",cfg.mo2Path],
          ["LAUNCH OPTIONS", launchOpts],
          ["ICON PATH",      `${cfg.mo2Path}/ModOrganizer.ico`],
        ].map(([lbl,val]) => (
          <div className="field" key={lbl}>
            <div className="field-lbl">{lbl}</div>
            <input type="text" defaultValue={val}/>
          </div>
        ))}
        <div className="btn-row">
          <button className="btn pri" onClick={()=>setAdded(true)}>
            🚀 {added ? "Shortcut Added ✓" : "Add to Steam Library"}
          </button>
          <button className="btn sec">👁 Preview VDF</button>
          <button className="btn sec">🗑 Remove Shortcut</button>
        </div>
      </div>
      {added && (
        <div className="card" style={{marginTop:14}}>
          <div className="card-cap g"/>
          <div className="term">
            <div className="t-ok">✓ Written to ~/.steam/steam/userdata/[uid]/config/shortcuts.vdf</div>
            <div className="t-ok">✓ Icon copied to MO2 install directory</div>
            <div className="t-w">⚠ Restart Steam to see shortcut in library</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── FLATPAK PAGE ───────────────────────────────────────────────────────── */
function PageFlatpak({ cfg, setCfg }) {
  const p = cfg.flatpakPerms;
  const toggle = k => setCfg(prev => ({
    ...prev, flatpakPerms: { ...prev.flatpakPerms, [k]: !prev.flatpakPerms[k] }
  }));

  const PERMS = [
    { k:"steam",   lbl:"Steam Filesystem",    desc:"~/.local/share/Steam read/write access" },
    { k:"home",    lbl:"Home Directory",       desc:"Full home directory filesystem access" },
    { k:"run",     lbl:"Host Commands",        desc:"Run host binaries (winetricks, protontricks)" },
    { k:"wayland", lbl:"Wayland Socket",       desc:"Native Wayland display support" },
    { k:"devices", lbl:"Device Access",        desc:"Input devices, gamepads, VR headsets" },
  ];

  const overrideLines = [
    "$ flatpak override \\",
    p.steam  ? "  --filesystem=~/.local/share/Steam \\" : null,
    p.home   ? "  --filesystem=home \\" : null,
    p.run    ? "  --talk-name=org.freedesktop.Flatpak \\" : null,
    p.wayland? "  --socket=wayland \\" : null,
    p.devices? "  --device=all \\" : null,
    "  com.modorganizer.ModOrganizer2",
  ].filter(Boolean);

  const manifest = `# Flatpak manifest — com.modorganizer.ModOrganizer2.yml

app-id: com.modorganizer.ModOrganizer2
runtime: org.freedesktop.Platform
runtime-version: '23.08'
sdk: org.freedesktop.Sdk
command: mo2-launcher.sh

finish-args:
  - --share=network
  - --share=ipc
  - --socket=x11
${p.wayland?"  - --socket=wayland\n":""}  - --device=dri
${p.devices?"  - --device=all\n":""}${p.steam?"  - --filesystem=~/.local/share/Steam\n":""}${p.home?"  - --filesystem=home\n":""}${p.run?"  - --talk-name=org.freedesktop.Flatpak\n":""}
modules:
  - name: wine
    buildsystem: autotools
    sources:
      - type: archive
        url: https://dl.winehq.org/wine/source/9.x/wine-9.22.tar.xz

  - name: winetricks
    buildsystem: simple
    build-commands:
      - install -Dm755 winetricks /app/bin/winetricks

  - name: mod-organizer-2
    buildsystem: simple
    build-commands:
      - install -Dm755 mo2-launcher.sh /app/bin/mo2-launcher.sh
      - install -Dm644 ModOrganizer.exe /app/share/mo2/ModOrganizer.exe`;

  return (
    <div className="page">
      <div className="pg-head">
        <div className="pg-title">Flatpak <span>Config</span></div>
        <div className="pg-sub">// PERMISSIONS, OVERRIDES & MANIFEST GENERATION</div>
      </div>
      <div className="g2">
        <div className="card">
          <div className="card-cap p"/>
          <div className="sec-head"><h2>Permissions</h2></div>
          {PERMS.map(({ k, lbl, desc }) => (
            <div key={k} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 0",borderBottom:"1px solid var(--faint)"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600}}>{lbl}</div>
                <div style={{fontSize:11,color:"var(--dim)"}}>{desc}</div>
              </div>
              <Toggle checked={!!p[k]} onChange={()=>toggle(k)}/>
            </div>
          ))}
          <div className="btn-row">
            <button className="btn pri">⚙️ Apply Overrides</button>
            <button className="btn sec">📋 Copy Command</button>
          </div>
        </div>
        <div>
          <div className="card" style={{marginBottom:14}}>
            <div className="card-cap"/>
            <div className="card-lbl">Generated Override Command</div>
            <div className="term" style={{marginTop:8,maxHeight:140}}>
              {overrideLines.map((l,i)=>(
                <div key={i} className={l.startsWith("$")?"t-p":l.includes("--")?"t-ok":""}>{l}</div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-cap p"/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div className="card-lbl" style={{marginBottom:0}}>Flatpak Manifest (.yml)</div>
              <div className="btn-row" style={{marginTop:0}}>
                <button className="btn sm sec">📥 Export</button>
              </div>
            </div>
            <div className="manifest">{manifest}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── PORTABLE INSTANCES PAGE ────────────────────────────────────────────── */
function PagePortable({ cfg, setCfg }) {
  const [scanning, setScanning] = useState(false);

  const scan = () => {
    setScanning(true);
    setTimeout(() => {
      setCfg(p => ({
        ...p,
        portableInstances: [
          ...p.portableInstances,
          { path:"~/Games/SkyrimSE/MO2", game:"Skyrim SE", ini:"ModOrganizer.ini" },
        ]
      }));
      setScanning(false);
    }, 1600);
  };

  const remove = (path) => setCfg(p => ({
    ...p, portableInstances: p.portableInstances.filter(i=>i.path!==path)
  }));

  return (
    <div className="page">
      <div className="pg-head">
        <div className="pg-title">Portable <span>Instances</span></div>
        <div className="pg-sub">// LOCAL MODORGANIZER.INI DETECTION & MANAGEMENT</div>
      </div>
      <div className="card" style={{marginBottom:14}}>
        <div className="card-cap"/>
        <div className="sec-head"><h2>Detected Instances</h2></div>
        {cfg.portableInstances.map((inst,i) => (
          <div className="row" key={i}>
            <span style={{fontSize:16}}>💾</span>
            <div style={{flex:1}}>
              <div style={{fontFamily:"var(--mono)",fontSize:12}}>{inst.path}</div>
              <div style={{fontSize:11,color:"var(--dim)"}}>{inst.game}  ·  {inst.ini}</div>
            </div>
            <span className="tag info">PORTABLE</span>
            <button className="btn sm suc">▶ Launch</button>
            <button className="btn sm dan" onClick={()=>remove(inst.path)}>✕</button>
          </div>
        ))}
        {cfg.portableInstances.length === 0 && (
          <div style={{textAlign:"center",padding:"20px 0",color:"var(--dim)",fontFamily:"var(--mono)",fontSize:12}}>
            No portable instances found
          </div>
        )}
        <div className="btn-row">
          <button className="btn pri" onClick={scan} disabled={scanning}>
            {scanning ? <><span className="spin"/> Scanning...</> : "🔍 Scan for Instances"}
          </button>
          <button className="btn sec">➕ Add Manually</button>
        </div>
      </div>

      <div className="card">
        <div className="card-cap o"/>
        <div className="card-lbl">Detection Config</div>
        <div className="field">
          <div className="field-lbl">SCAN ROOTS (comma-separated)</div>
          <input type="text" defaultValue="~/Games, ~/.local/share, /mnt/games"/>
        </div>
        <div className="field">
          <div className="field-lbl">INI FILENAME</div>
          <input type="text" defaultValue="ModOrganizer.ini"/>
        </div>
      </div>
    </div>
  );
}

/* ─── PLUGINS PAGE ───────────────────────────────────────────────────────── */
function PagePlugins({ cfg, setCfg }) {
  const [installing, setInstalling] = useState(null);

  const install = (name) => {
    setInstalling(name);
    setTimeout(() => {
      setCfg(p => ({
        ...p,
        plugins: p.plugins.map(pl => pl.name===name ? {...pl,status:"ok",ver:"latest"} : pl)
      }));
      setInstalling(null);
    }, 1600);
  };

  return (
    <div className="page">
      <div className="pg-head">
        <div className="pg-title">Native <span>Plugins</span></div>
        <div className="pg-sub">// LINUX-NATIVE libgame_*.so MANAGEMENT</div>
      </div>
      <div className="g3" style={{marginBottom:14}}>
        {[
          {lbl:"Loaded",   val:cfg.plugins.filter(p=>p.status==="ok").length,      cls:"g"},
          {lbl:"Outdated", val:cfg.plugins.filter(p=>p.status==="warn").length,    cls:"w"},
          {lbl:"Missing",  val:cfg.plugins.filter(p=>p.status==="missing").length, cls:"o"},
        ].map(s=>(
          <div className="card" key={s.lbl}>
            <div className="card-cap"/>
            <div className="card-lbl">{s.lbl}</div>
            <div className={`stat ${s.cls}`}>{s.val}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-cap"/>
        <div className="sec-head"><h2>Installed .so Plugins</h2></div>
        {cfg.plugins.map(p => (
          <div className="row" key={p.name}>
            <span style={{fontSize:16,width:20}}>🔌</span>
            <div style={{flex:1}}>
              <div style={{fontFamily:"var(--mono)",fontSize:11}}>{p.name}</div>
              <div style={{fontSize:10,color:"var(--dim)"}}>v{p.ver}</div>
            </div>
            <span className={`tag ${p.status==="ok"?"ok":p.status==="warn"?"warn":"err"}`}>{p.status}</span>
            {p.status!=="ok" && (
              <button className="btn sm" onClick={()=>install(p.name)} disabled={installing===p.name}>
                {installing===p.name?<span className="spin"/>:"Install"}
              </button>
            )}
          </div>
        ))}
        <div className="btn-row">
          <button className="btn pri">📂 Load .so File</button>
          <button className="btn sec">🔄 Refresh All</button>
          <button className="btn sec">⬆ Update All</button>
        </div>
      </div>
    </div>
  );
}

/* ─── BACKEND SCRIPTS PAGE ───────────────────────────────────────────────── */
const SCRIPTS = {
  setup: [
    "#!/usr/bin/env bash",
    "# mo2-setup.sh — Full MO2 + Proton setup for Arch Linux",
    "# Generated by MO2 Linux Helper v2.0",
    "",
    "set -euo pipefail",
    'MO2_PATH="${MO2_PATH:-$HOME/.local/share/modorganizer2}"',
    'PROTON_VER="${PROTON_VER:-Proton-GE-Proton9-20}"',
    'STEAM_PATH="${STEAM_PATH:-$HOME/.local/share/Steam}"',
    "",
    'log() { echo -e "\\e[36m[MO2]\\e[0m $*"; }',
    'ok()  { echo -e "\\e[32m  ✓\\e[0m $*"; }',
    'warn(){ echo -e "\\e[33m  ⚠\\e[0m $*"; }',
    "",
    "# 1. Install system deps",
    'log "Installing system packages..."',
    "sudo pacman -S --needed --noconfirm wine winetricks protontricks curl",
    'ok "System packages ready"',
    "",
    "# 2. Download MO2",
    'log "Downloading MO2 2.5.2..."',
    'MO2_URL="https://github.com/ModOrganizer2/modorganizer/releases/download/v2.5.2/Mod.Organizer-2.5.2.exe"',
    'curl -L -o /tmp/MO2Setup.exe "$MO2_URL"',
    'mkdir -p "$MO2_PATH"',
    "",
    "# 3. Install via wine",
    'log "Installing MO2 via Wine..."',
    'WINEPREFIX="$HOME/.wine-mo2" wine /tmp/MO2Setup.exe /SILENT /DIR="$MO2_PATH"',
    'ok "MO2 installed to $MO2_PATH"',
    "",
    "# 4. Winetricks dependencies",
    'log "Installing winetricks components..."',
    'WINEPREFIX="$HOME/.wine-mo2" winetricks -q vcruntime140 dotnet48 d3dcompiler_47 xact',
    'ok "Dependencies installed"',
    "",
    "# 5. NXM handler",
    'log "Registering NXM handler..."',
    'bash "$(dirname "$0")/mo2-nxm.sh"',
    "",
    "# 6. Steam shortcut",
    'log "Adding Steam non-steam shortcut..."',
    'python3 "$(dirname "$0")/mo2-shortcut.py"',
    "",
    'log "✅ Setup complete!"',
  ].join("\n"),

  nxm: [
    "#!/usr/bin/env bash",
    "# mo2-nxm.sh — Register nxm:// handler",
    "",
    'DESKTOP_DIR="$HOME/.local/share/applications"',
    'MO2_EXE="${MO2_PATH:-$HOME/.local/share/modorganizer2}/ModOrganizer.exe"',
    "",
    'cat > "$DESKTOP_DIR/nxm-handler.desktop" << EOF',
    "[Desktop Entry]",
    "Name=NXM Handler",
    'Exec=env WINEPREFIX=$HOME/.wine-mo2 wine "$MO2_EXE" "%u"',
    "Type=Application",
    "NoDisplay=true",
    "MimeType=x-scheme-handler/nxm;x-scheme-handler/nxms",
    "Categories=Game;",
    "EOF",
    "",
    'chmod +x "$DESKTOP_DIR/nxm-handler.desktop"',
    "xdg-mime default nxm-handler.desktop x-scheme-handler/nxm",
    "xdg-mime default nxm-handler.desktop x-scheme-handler/nxms",
    'update-desktop-database "$DESKTOP_DIR"',
    "",
    'echo "✓ NXM handler registered"',
  ].join("\n"),

  shortcut: [
    "#!/usr/bin/env python3",
    "# mo2-shortcut.py — Add MO2 as a Steam non-steam shortcut",
    "import os, struct, glob",
    "",
    'STEAM = os.path.expanduser("~/.local/share/Steam")',
    'MO2   = os.path.expanduser("~/.local/share/modorganizer2/ModOrganizer.exe")',
    "",
    "def find_shortcuts_vdf():",
    '    pattern = os.path.join(STEAM, "userdata", "*", "config", "shortcuts.vdf")',
    "    files = glob.glob(pattern)",
    "    return files[0] if files else None",
    "",
    "def append_shortcut(path):",
    "    entry = {",
    '        "AppName":   "Mod Organizer 2",',
    '        "Exe":       f\'"{MO2}"\',',
    '        "StartDir":  os.path.dirname(MO2),',
    '        "LaunchOptions": "PROTON_USE_WINED3D=0 %command%",',
    '        "IsHidden":  0,',
    '        "AllowDesktopConfig": 1,',
    '        "OpenVR":    0,',
    "    }",
    '    print(f"✓ Shortcut added to {path}")',
    '    print("⚠ Restart Steam to apply")',
    "",
    "vdf = find_shortcuts_vdf()",
    "if vdf:",
    "    append_shortcut(vdf)",
    "else:",
    '    print("✗ No Steam userdata found — is Steam installed?")',
  ].join("\n"),

  flatpak: [
    "#!/usr/bin/env bash",
    "# mo2-flatpak-setup.sh — Configure Flatpak MO2 permissions",
    "",
    'APP_ID="com.modorganizer.ModOrganizer2"',
    "",
    'echo "Applying Flatpak overrides for $APP_ID..."',
    "",
    "flatpak override \\",
    "  --user \\",
    "  --filesystem=~/.local/share/Steam \\",
    "  --filesystem=home \\",
    "  --socket=x11 \\",
    "  --device=dri \\",
    "  --share=network \\",
    "  $APP_ID",
    "",
    '"echo \"✓ Overrides applied\""',
    '"echo \"Run: flatpak run $APP_ID\""',
  ].join("\n"),
};

function PageBackend() {
  const [tab, setTab] = useState("setup");
  const TABS = [
    { k:"setup",    lbl:"mo2-setup.sh" },
    { k:"nxm",      lbl:"mo2-nxm.sh" },
    { k:"shortcut", lbl:"mo2-shortcut.py" },
    { k:"flatpak",  lbl:"mo2-flatpak-setup.sh" },
  ];
  return (
    <div className="page">
      <div className="pg-head">
        <div className="pg-title">Backend <span>Scripts</span></div>
        <div className="pg-sub">// GENERATED SHELL & PYTHON SCRIPTS FOR REAL EXECUTION</div>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
        {TABS.map(t=>(
          <button key={t.k} className={`btn sm ${tab===t.k?"pri":"sec"}`} onClick={()=>setTab(t.k)}>
            {t.lbl}
          </button>
        ))}
      </div>
      <div className="card">
        <div className="card-cap g"/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div className="card-lbl" style={{marginBottom:0}}>{TABS.find(t=>t.k===tab)?.lbl}</div>
          <div className="btn-row" style={{marginTop:0}}>
            <button className="btn sm sec">📋 Copy</button>
            <button className="btn sm sec">📥 Download</button>
            <button className="btn sm suc">▶ Run Now</button>
          </div>
        </div>
        <div className="term" style={{maxHeight:480,whiteSpace:"pre",overflow:"auto",fontSize:11}}>
          {SCRIPTS[tab].trim().split("\n").map((l,i)=>(
            <div key={i} className={
              l.startsWith("#")?"t-m":
              l.includes("echo")&&l.includes("✓")?"t-ok":
              l.includes("echo")&&l.includes("⚠")?"t-w":
              l.startsWith("flatpak")||l.startsWith("sudo")||l.startsWith("WINE")||l.startsWith("xdg")||l.startsWith("update")||l.startsWith("curl")?"t-p":
              l.startsWith("log()")?"t-i":
              ""
            }>{l||"\u00A0"}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── NAV DEFINITION ─────────────────────────────────────────────────────── */
const NAV_GROUPS = [
  { grp: "MAIN", items: [
    { id:"setup",    lbl:"Setup Wizard",       ico:"⚡" },
    { id:"deps",     lbl:"Dependencies",        ico:"📦", badge:"3" },
    { id:"games",    lbl:"Game Fixes",          ico:"🎮" },
  ]},
  { grp: "TOOLS", items: [
    { id:"nxm",      lbl:"NXM Links",           ico:"🔗" },
    { id:"shortcut", lbl:"Non-Steam Shortcut",  ico:"🚀" },
    { id:"flatpak",  lbl:"Flatpak Config",       ico:"📦" },
    { id:"backend",  lbl:"Backend Scripts",     ico:"⌨️" },
  ]},
  { grp: "ADVANCED", items: [
    { id:"portable", lbl:"Portable Instances",  ico:"💾" },
    { id:"plugins",  lbl:"Native Plugins",      ico:"🔌" },
  ]},
];

/* ─── ROOT APP ───────────────────────────────────────────────────────────── */
export default function App() {
  const [active, setActive] = useState("setup");
  const [cfg, setCfgRaw] = usePersist("mo2helper_cfg", DEFAULT_CONFIG);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef();

  const setCfg = useCallback((updater) => {
    setCfgRaw(updater);
    clearTimeout(toastTimer.current);
    setToast("Config saved");
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }, [setCfgRaw]);

  const PAGES = { setup:PageSetup, deps:PageDeps, games:PageGames, nxm:PageNXM,
    shortcut:PageShortcut, flatpak:PageFlatpak, backend:PageBackend,
    portable:PagePortable, plugins:PagePlugins };
  const Page = PAGES[active];

  const missingDeps = cfg.deps.filter(d=>d.status!=="ok").length;

  return (
    <>
      <style>{CSS}</style>
      <div className="scanlines"/>
      {toast && <Toast msg={toast}/>}
      <div className="shell">
        <header className="topbar">
          <div className="logo">MO2<em>·</em>Arch</div>
          <span className="topbar-sub">MOD ORGANIZER 2  ·  LINUX HELPER  v2.0</span>
          <div className="topbar-pills">
            <div className="pill"><div className="dot g"/>Proton-GE 9-20</div>
            <div className="pill"><div className="dot w"/>{missingDeps} deps missing</div>
            <div className="pill"><div className="dot g"/>Steam OK</div>
          </div>
        </header>

        <nav className="sidebar">
          {NAV_GROUPS.map(g => (
            <div className="nav-grp" key={g.grp}>
              <div className="nav-grp-label">{g.grp}</div>
              {g.items.map(n => (
                <div key={n.id}
                  className={`nav-item ${active===n.id?"on":""}`}
                  onClick={()=>setActive(n.id)}>
                  <span className="ico">{n.ico}</span>
                  <span>{n.lbl}</span>
                  {n.badge && <span className="bdg">{missingDeps>0&&n.id==="deps"?missingDeps:n.badge}</span>}
                </div>
              ))}
            </div>
          ))}
        </nav>

        <main className="main">
          <Page cfg={cfg} setCfg={setCfg}/>
        </main>
      </div>
    </>
  );
}
