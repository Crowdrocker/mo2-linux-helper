import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import { 
  Terminal, 
  Package, 
  Gamepad2, 
  Link2, 
  ExternalLink, 
  Box, 
  Settings, 
  Code, 
  HardDrive,
  RefreshCw,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Home
} from 'lucide-react';

// Pages
import SetupWizard from './pages/SetupWizard';
import Dependencies from './pages/Dependencies';
import GameFixes from './pages/GameFixes';
import NXMLinks from './pages/NXMLinks';
import NonSteamShortcuts from './pages/NonSteamShortcuts';
import FlatpakConfig from './pages/FlatpakConfig';
import PortableInstances from './pages/PortableInstances';
import NativePlugins from './pages/NativePlugins';
import BackendScripts from './pages/BackendScripts';
import Dashboard from './pages/Dashboard';

// Context for global state
export const AppContext = React.createContext();

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [config, setConfig] = useState({
    mo2Path: '',
    protonPath: '',
    steamPath: '',
    flatpakEnabled: false,
    activeGames: [],
    installedDeps: [],
    portableInstances: [],
    nativePlugins: [],
    nxmHandlerRegistered: false,
    gameFixes: {
      cyberpunk: false,
      fallout4: false,
      xedit: false,
      synthesis: false,
      bg3: false
    }
  });
  const [toast, setToast] = useState(null);
  const [missingDepsCount, setMissingDepsCount] = useState(0);

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('mo2-helper-config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  // Save config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mo2-helper-config', JSON.stringify(config));
  }, [config]);

  // Calculate missing dependencies
  useEffect(() => {
    const requiredDeps = [
      'winetricks', 'protontricks', 'wine', 'python3', 'git'
    ];
    const missing = requiredDeps.filter(dep => !config.installedDeps.includes(dep));
    setMissingDepsCount(missing.length);
  }, [config.installedDeps]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateConfig = (updates) => {
    setConfig(prev => ({ ...prev, ...updates }));
    showToast('Config saved ✓', 'success');
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'setup', label: 'Setup Wizard', icon: Terminal },
    { id: 'dependencies', label: 'Dependencies', icon: Package, badge: missingDepsCount },
    { id: 'game-fixes', label: 'Game Fixes', icon: Gamepad2 },
    { id: 'nxm-links', label: 'NXM Links', icon: Link2 },
    { id: 'shortcuts', label: 'Non-Steam Shortcuts', icon: ExternalLink },
    { id: 'flatpak', label: 'Flatpak Config', icon: Box },
    { id: 'instances', label: 'Portable Instances', icon: HardDrive },
    { id: 'plugins', label: 'Native Plugins', icon: RefreshCw },
    { id: 'scripts', label: 'Backend Scripts', icon: Code },
  ];

  return (
    <AppContext.Provider value={{ config, updateConfig, showToast }}>
      <Router>
        <div className="app">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-header">
              <h1>MO2 Linux Helper</h1>
              <p className="text-muted text-sm">v1.0.0</p>
            </div>
            <nav className="sidebar-nav">
              {navigationItems.map(item => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    to={`/${item.id}`}
                    className={`sidebar-item ${currentPage === item.id ? 'active' : ''}`}
                    onClick={() => setCurrentPage(item.id)}
                  >
                    <Icon className="sidebar-item-icon" />
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                      <span className="sidebar-badge">{item.badge}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/setup" element={<SetupWizard />} />
              <Route path="/dependencies" element={<Dependencies />} />
              <Route path="/game-fixes" element={<GameFixes />} />
              <Route path="/nxm-links" element={<NXMLinks />} />
              <Route path="/shortcuts" element={<NonSteamShortcuts />} />
              <Route path="/flatpak" element={<FlatpakConfig />} />
              <Route path="/instances" element={<PortableInstances />} />
              <Route path="/plugins" element={<NativePlugins />} />
              <Route path="/scripts" element={<BackendScripts />} />
            </Routes>
          </main>

          {/* Toast Notification */}
          {toast && (
            <div className={`toast toast-${toast.type}`}>
              {toast.type === 'success' && <CheckCircle size={20} />}
              {toast.type === 'warning' && <AlertTriangle size={20} />}
              {toast.type === 'error' && <XCircle size={20} />}
              <span>{toast.message}</span>
            </div>
          )}
        </div>
      </Router>
    </AppContext.Provider>
  );
}

export default App;