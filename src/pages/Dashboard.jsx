import React, { useContext } from 'react';
import { AppContext } from '../App';
import { 
  Terminal, 
  Package, 
  Gamepad2, 
  Link2, 
  ExternalLink, 
  Box, 
  HardDrive,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Download,
  Upload
} from 'lucide-react';

function Dashboard() {
  const { config, updateConfig } = useContext(AppContext);

  const dashboardCards = [
    {
      title: 'Setup Status',
      icon: Terminal,
      status: config.mo2Path ? 'complete' : 'pending',
      description: config.mo2Path ? 'MO2 configured' : 'Run setup wizard',
      action: '/setup'
    },
    {
      title: 'Dependencies',
      icon: Package,
      status: config.installedDeps.length >= 5 ? 'complete' : 'warning',
      description: `${config.installedDeps.length}/5 installed`,
      action: '/dependencies'
    },
    {
      title: 'Game Fixes',
      icon: Gamepad2,
      status: Object.values(config.gameFixes).some(v => v) ? 'complete' : 'pending',
      description: `${Object.values(config.gameFixes).filter(v => v).length} active`,
      action: '/game-fixes'
    },
    {
      title: 'NXM Links',
      icon: Link2,
      status: config.nxmHandlerRegistered ? 'complete' : 'pending',
      description: config.nxmHandlerRegistered ? 'Registered' : 'Not registered',
      action: '/nxm-links'
    },
    {
      title: 'Flatpak',
      icon: Box,
      status: config.flatpakEnabled ? 'complete' : 'pending',
      description: config.flatpakEnabled ? 'Enabled' : 'Disabled',
      action: '/flatpak'
    },
    {
      title: 'Portable Instances',
      icon: HardDrive,
      status: config.portableInstances.length > 0 ? 'complete' : 'pending',
      description: `${config.portableInstances.length} detected`,
      action: '/instances'
    },
    {
      title: 'Native Plugins',
      icon: RefreshCw,
      status: config.nativePlugins.length > 0 ? 'complete' : 'pending',
      description: `${config.nativePlugins.length} managed`,
      action: '/plugins'
    },
    {
      title: 'Config Backup',
      icon: Upload,
      status: 'info',
      description: 'Export/Import settings',
      action: '#'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <CheckCircle size={20} className="text-success" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-warning" />;
      case 'error':
        return <XCircle size={20} className="text-error" />;
      default:
        return <AlertTriangle size={20} className="text-muted" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'complete':
        return <span className="badge badge-success">OK</span>;
      case 'warning':
        return <span className="badge badge-warning">WARN</span>;
      case 'error':
        return <span className="badge badge-error">ERROR</span>;
      default:
        return <span className="badge badge-info">INFO</span>;
    }
  };

  const exportConfig = () => {
    const configStr = JSON.stringify(config, null, 2);
    const blob = new Blob([configStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mo2-helper-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedConfig = JSON.parse(e.target.result);
          updateConfig(importedConfig);
        } catch (error) {
          console.error('Failed to import config:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="dashboard">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted">MO2 Linux Helper Overview</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-sm" onClick={exportConfig}>
            <Download size={16} className="mr-2" />
            Export Config
          </button>
          <label className="btn btn-sm">
            <Upload size={16} className="mr-2" />
            Import Config
            <input
              type="file"
              accept=".json"
              onChange={importConfig}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-4">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="card">
              <div className="card-header">
                <div className="flex items-center gap-2">
                  <Icon size={24} className="text-cyan" />
                  <h3 className="card-title">{card.title}</h3>
                </div>
                {getStatusBadge(card.status)}
              </div>
              <div className="card-body">
                <p className="text-muted mb-2">{card.description}</p>
                {card.action !== '#' && (
                  <a href={card.action} className="btn btn-sm w-full mt-2">
                    Configure
                    <ArrowRight size={16} className="ml-2" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-3">
            <button className="btn btn-orange">
              <Terminal size={20} className="mr-2" />
              Run Setup Wizard
            </button>
            <button className="btn">
              <Package size={20} className="mr-2" />
              Install All Dependencies
            </button>
            <button className="btn">
              <RefreshCw size={20} className="mr-2" />
              Scan for Instances
            </button>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <h3 className="card-title">System Information</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-2">
            <div>
              <p className="text-muted">MO2 Path</p>
              <p className="text-cyan">{config.mo2Path || 'Not configured'}</p>
            </div>
            <div>
              <p className="text-muted">Proton Path</p>
              <p className="text-cyan">{config.protonPath || 'Not configured'}</p>
            </div>
            <div>
              <p className="text-muted">Steam Path</p>
              <p className="text-cyan">{config.steamPath || 'Not configured'}</p>
            </div>
            <div>
              <p className="text-muted">Flatpak</p>
              <p className={config.flatpakEnabled ? 'text-success' : 'text-muted'}>
                {config.flatpakEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;