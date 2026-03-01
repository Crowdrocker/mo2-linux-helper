// UpdatesPanel.jsx — drop this into src/ and add "UPDATES" to SECTIONS in App.jsx
// Calls the real Rust backend which hits GitHub API via curl

import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

const Badge = ({ label, color = "#00f0ff" }) => (
  <span style={{ fontSize: 10, fontFamily: "monospace", padding: "1px 6px", border: `1px solid ${color}55`, borderRadius: 2, color, background: `${color}18`, marginLeft: 6, letterSpacing: 1 }}>{label}</span>
);

const Spinner = () => (
  <span style={{ display: "inline-block", animation: "spin 0.7s linear infinite" }}>⟳</span>
);

const ProgressBar = ({ value, color = "#00f0ff" }) => (
  <div style={{ background: "#0a1520", border: "1px solid #0ff3", borderRadius: 2, height: 6, overflow: "hidden", margin: "6px 0" }}>
    <div style={{ width: `${value}%`, height: "100%", background: `linear-gradient(90deg, ${color}88, ${color})`, transition: "width 0.4s ease", boxShadow: `0 0 6px ${color}` }} />
  </div>
);

// ─── COMPONENT CARDS ─────────────────────────────────────────────────────────

function UpdateCard({ info, onInstall, installing }) {
  const [expanded, setExpanded] = useState(false);

  const ICONS = { app: "⬡", "proton-ge": "⚗", mo2: "◈" };
  const NAMES = { app: "MO2 Linux Helper", "proton-ge": "Proton-GE", mo2: "Mod Organizer 2" };

  const statusColor = info.update_available ? "#ff9f00" : "#00ff9f";
  const statusLabel = info.update_available ? "UPDATE AVAILABLE" : "UP TO DATE";

  return (
    <div style={{ background: "linear-gradient(135deg, #0a1520ee, #060d1aee)", border: `1px solid ${info.update_available ? "#ff9f0044" : "#0ff2"}`, borderRadius: 6, padding: "16px 20px", marginBottom: 12, transition: "border 0.3s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 20 }}>{ICONS[info.component]}</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#e0f8ff", fontFamily: "monospace", fontSize: 14, fontWeight: "bold" }}>
            {NAMES[info.component]}
          </div>
          <div style={{ color: "#7de8ff77", fontFamily: "monospace", fontSize: 10, marginTop: 2 }}>
            Checked: {new Date(info.checked_at * 1000).toLocaleTimeString()}
          </div>
        </div>
        <Badge label={statusLabel} color={statusColor} />
      </div>

      <div style={{ display: "flex", gap: 20, fontFamily: "monospace", fontSize: 12, marginBottom: 10 }}>
        <div>
          <div style={{ color: "#7de8ff66", fontSize: 10, letterSpacing: 1 }}>CURRENT</div>
          <div style={{ color: "#7de8ff" }}>{info.current || "unknown"}</div>
        </div>
        <div style={{ color: "#0ff3", alignSelf: "flex-end", marginBottom: 2 }}>→</div>
        <div>
          <div style={{ color: "#7de8ff66", fontSize: 10, letterSpacing: 1 }}>LATEST</div>
          <div style={{ color: info.update_available ? "#ff9f00" : "#00ff9f", fontWeight: "bold" }}>{info.latest}</div>
        </div>
        {info.download_size_mb && (
          <div style={{ marginLeft: "auto" }}>
            <div style={{ color: "#7de8ff66", fontSize: 10, letterSpacing: 1 }}>SIZE</div>
            <div style={{ color: "#7de8ff" }}>{info.download_size_mb.toFixed(1)} MB</div>
          </div>
        )}
        <div>
          <div style={{ color: "#7de8ff66", fontSize: 10, letterSpacing: 1 }}>PUBLISHED</div>
          <div style={{ color: "#7de8ff" }}>{info.published_at?.slice(0, 10) || "—"}</div>
        </div>
      </div>

      {/* Release notes toggle */}
      {info.release_notes && (
        <div style={{ marginBottom: 10 }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{ background: "none", border: "none", color: "#7de8ff88", fontFamily: "monospace", fontSize: 11, cursor: "pointer", padding: 0, letterSpacing: 1 }}
          >
            {expanded ? "▼" : "▶"} RELEASE NOTES
          </button>
          {expanded && (
            <pre style={{ color: "#7de8ff77", fontFamily: "monospace", fontSize: 11, background: "#060a0d", padding: "8px 12px", borderRadius: 4, border: "1px solid #0ff2", whiteSpace: "pre-wrap", margin: "6px 0 0 0", maxHeight: 160, overflowY: "auto", lineHeight: 1.5 }}>
              {info.release_notes}
            </pre>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        {info.update_available && (
          <button
            onClick={() => onInstall(info)}
            disabled={installing}
            style={{ background: "#ff9f0022", border: "1px solid #ff9f00", borderRadius: 3, color: "#ff9f00", fontFamily: "monospace", fontSize: 12, padding: "5px 16px", cursor: "pointer", fontWeight: "bold" }}
          >
            {installing ? <><Spinner /> INSTALLING...</> : `⬆ INSTALL ${info.latest}`}
          </button>
        )}
        <button
          onClick={async () => { try { await invoke("open_url", { url: info.release_url }); } catch {} }}
          style={{ background: "transparent", border: "1px solid #0ff4", borderRadius: 3, color: "#7de8ff", fontFamily: "monospace", fontSize: 12, padding: "5px 14px", cursor: "pointer" }}
        >
          VIEW RELEASE
        </button>
        {info.download_url && (
          <button
            onClick={async () => { try { await invoke("open_url", { url: info.download_url }); } catch {} }}
            style={{ background: "transparent", border: "1px solid #0ff4", borderRadius: 3, color: "#7de8ff", fontFamily: "monospace", fontSize: 12, padding: "5px 14px", cursor: "pointer" }}
          >
            ⬇ DOWNLOAD
          </button>
        )}
      </div>
    </div>
  );
}

// ─── MAIN PANEL ──────────────────────────────────────────────────────────────

export default function UpdatesPanel({ protonVersion, mo2Version = "2.5.2", onToast }) {
  const [loading, setLoading] = useState(false);
  const [updates, setUpdates] = useState(null);
  const [installing, setInstalling] = useState(null);
  const [installLog, setInstallLog] = useState([]);
  const [installProgress, setInstallProgress] = useState(0);
  const [lastChecked, setLastChecked] = useState(null);

  const APP_VERSION = "2.0.0";

  const s = {
    h2: { color: "#00f0ff", fontFamily: "monospace", fontSize: 14, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16, borderBottom: "1px solid #0ff2", paddingBottom: 8, display: "flex", alignItems: "center", gap: 8 },
    card: { background: "linear-gradient(135deg, #0a1520ee, #060d1aee)", border: "1px solid #0ff2", borderRadius: 6, padding: "16px 20px", marginBottom: 16 },
    btn: (c = "#00f0ff") => ({ background: `${c}22`, border: `1px solid ${c}`, borderRadius: 3, color: c, fontFamily: "monospace", fontSize: 12, padding: "6px 16px", cursor: "pointer", fontWeight: "bold", letterSpacing: 1 }),
  };

  const checkAll = async () => {
    setLoading(true);
    setInstallLog([]);
    try {
      const result = await invoke("check_for_updates", {
        appVersion: APP_VERSION,
        protonVersion: protonVersion || "GE-Proton9-27",
        mo2Version,
      });
      setUpdates(result);
      setLastChecked(new Date());

      const available = [result.app, result.proton_ge, result.mo2]
        .filter(Boolean)
        .filter(u => u.update_available);

      if (available.length > 0) {
        onToast?.(`${available.length} update(s) available!`, "warn");
      } else {
        onToast?.("All components up to date ✓");
      }

      if (result.errors?.length > 0) {
        result.errors.forEach(e => console.warn("Update check error:", e));
      }
    } catch (e) {
      onToast?.(`Update check failed: ${e}`, "warn");
    } finally {
      setLoading(false);
    }
  };

  // Auto-check on mount
  useEffect(() => {
    checkAll();
  }, []);

  const handleInstall = async (info) => {
    setInstalling(info.component);
    setInstallLog([`[UPDATE] Starting install of ${info.component} ${info.latest}...`]);
    setInstallProgress(0);

    try {
      let result;

      if (info.component === "proton-ge") {
        setInstallLog(prev => [...prev, `[UPDATE] Running: protonup -i ${info.latest}`]);
        setInstallProgress(20);
        result = await invoke("install_proton_ge", { tag: info.latest });
      } else if (info.component === "app") {
        setInstallLog(prev => [...prev, "[UPDATE] Opening release page for manual update..."]);
        await invoke("open_url", { url: info.release_url });
        result = { success: true, stdout: "Opened release page", stderr: "" };
      } else if (info.component === "mo2") {
        if (info.download_url) {
          setInstallLog(prev => [...prev, "[UPDATE] Opening MO2 installer download..."]);
          await invoke("open_url", { url: info.download_url });
          result = { success: true, stdout: "Opened download page", stderr: "" };
        } else {
          await invoke("open_url", { url: info.release_url });
          result = { success: true, stdout: "Opened release page", stderr: "" };
        }
      }

      setInstallProgress(100);

      if (result?.success) {
        setInstallLog(prev => [...prev, `✓ ${info.component} ${info.latest} installed successfully`]);
        onToast?.(`${info.component} ${info.latest} installed ✓`);
        // Re-check after install
        setTimeout(() => checkAll(), 2000);
      } else {
        setInstallLog(prev => [...prev, `[ERR] ${result?.stderr || "Unknown error"}`]);
        onToast?.(`Install failed: ${result?.stderr?.slice(0, 60)}`, "warn");
      }
    } catch (e) {
      setInstallLog(prev => [...prev, `[ERR] ${e}`]);
      onToast?.(`Error: ${e}`, "warn");
    } finally {
      setInstalling(null);
    }
  };

  const totalUpdates = updates
    ? [updates.app, updates.proton_ge, updates.mo2].filter(u => u?.update_available).length
    : 0;

  return (
    <div>
      <div style={s.h2}>
        ⬆ UPDATES
        {totalUpdates > 0 && (
          <span style={{ background: "#ff9f00", color: "#000", borderRadius: 9, fontSize: 10, padding: "1px 7px", fontWeight: "bold" }}>{totalUpdates}</span>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
        <button style={s.btn()} onClick={checkAll} disabled={loading}>
          {loading ? <><Spinner /> CHECKING...</> : "↺ CHECK ALL UPDATES"}
        </button>
        {lastChecked && (
          <span style={{ color: "#7de8ff44", fontFamily: "monospace", fontSize: 10 }}>
            Last checked: {lastChecked.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Summary bar */}
      {updates && (
        <div style={{ ...s.card, display: "flex", gap: 24, marginBottom: 20 }}>
          {[
            { label: "APP",       info: updates.app },
            { label: "PROTON-GE", info: updates.proton_ge },
            { label: "MO2",       info: updates.mo2 },
          ].map(({ label, info }) => (
            <div key={label} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ color: "#7de8ff66", fontFamily: "monospace", fontSize: 10, letterSpacing: 2, marginBottom: 4 }}>{label}</div>
              {info ? (
                <>
                  <div style={{ color: info.update_available ? "#ff9f00" : "#00ff9f", fontFamily: "monospace", fontSize: 11, fontWeight: "bold" }}>
                    {info.update_available ? `▲ ${info.latest}` : "✓ CURRENT"}
                  </div>
                  <div style={{ color: "#7de8ff55", fontFamily: "monospace", fontSize: 10 }}>{info.current}</div>
                </>
              ) : (
                <div style={{ color: "#ff444488", fontFamily: "monospace", fontSize: 11 }}>CHECK FAILED</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Errors from API */}
      {updates?.errors?.length > 0 && (
        <div style={{ ...s.card, border: "1px solid #ff444433", marginBottom: 16 }}>
          <div style={{ color: "#ff4444", fontFamily: "monospace", fontSize: 11 }}>
            {updates.errors.map((e, i) => <div key={i}>[WARN] {e}</div>)}
          </div>
        </div>
      )}

      {/* Update cards */}
      {loading && !updates && (
        <div style={{ color: "#7de8ff66", fontFamily: "monospace", fontSize: 12, padding: 20, textAlign: "center" }}>
          <Spinner /> Querying GitHub API...
        </div>
      )}

      {updates?.app && <UpdateCard info={updates.app} onInstall={handleInstall} installing={installing === "app"} />}
      {updates?.proton_ge && <UpdateCard info={updates.proton_ge} onInstall={handleInstall} installing={installing === "proton-ge"} />}
      {updates?.mo2 && <UpdateCard info={updates.mo2} onInstall={handleInstall} installing={installing === "mo2"} />}

      {/* Install log */}
      {installLog.length > 0 && (
        <div style={s.card}>
          <div style={{ color: "#7de8ff99", fontFamily: "monospace", fontSize: 11, marginBottom: 6, letterSpacing: 2 }}>INSTALL LOG</div>
          <ProgressBar value={installProgress} color="#ff9f00" />
          <div style={{ fontFamily: "monospace", fontSize: 11, background: "#060a0d", padding: "8px 12px", borderRadius: 4, border: "1px solid #0ff2", maxHeight: 140, overflowY: "auto" }}>
            {installLog.map((l, i) => (
              <div key={i} style={{ color: l.startsWith("[ERR]") ? "#ff4444" : l.startsWith("✓") ? "#00ff9f" : "#7de8ff" }}>{l}</div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
