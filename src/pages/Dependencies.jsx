import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { 
  Package, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  RefreshCw,
  Play,
  Pause
} from 'lucide-react';

function Dependencies() {
  const { config, updateConfig } = useContext(AppContext);
  const [installing, setInstalling] = useState(null);
  const [installProgress, setInstallProgress] = useState({});

  const dependencies = [
    { id: 'winetricks', name: 'Winetricks', description: 'Windows compatibility layer manager', required: true },
    { id: 'protontricks', name: 'Protontricks', description: 'Proton prefix management tool', required: true },
    { id: 'wine', name: 'Wine', description: 'Windows API implementation', required: true },
    { id: 'python3', name: 'Python 3', description: 'Script execution environment', required: true },
    { id: 'git', name: 'Git', description: 'Version control system', required: true },
    { id: 'mono', name: 'Mono', description: '.NET runtime for Linux', required: false },
    { id: 'gecko', name: 'Gecko', description: 'HTML rendering engine', required: false },
    { id: 'vcrun2019', name: 'Visual C++ 2019', description: 'Microsoft runtime libraries', required: false },
    { id: 'dotnet48', name: '.NET Framework 4.8', description: 'Microsoft .NET Framework', required: false },
    { id: 'dxvk', name: 'DXVK', description: 'DirectX to Vulkan translation', required: false },
  ];

  const getStatus = (depId) => {
    if (config.installedDeps.includes(depId)) {
      return 'installed';
    }
    const dep = dependencies.find(d => d.id === depId);
    return dep.required ? 'missing' : 'optional';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'installed':
        return <CheckCircle size={20} className="text-success" />;
      case 'missing':
        return <XCircle size={20} className="text-error" />;
      case 'optional':
        return <AlertTriangle size={20} className="text-warning" />;
      default:
        return <AlertTriangle size={20} className="text-muted" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'installed':
        return <span className="badge badge-success">OK</span>;
      case 'missing':
        return <span className="badge badge-error">MISSING</span>;
      case 'optional':
        return <span className="badge badge-warning">OPTIONAL</span>;
      default:
        return <span className="badge badge-info">UNKNOWN</span>;
    }
  };

  const installDependency = async (depId) => {
    setInstalling(depId);
    setInstallProgress(prev => ({ ...prev, [depId]: 0 }));

    // Simulate installation
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setInstallProgress(prev => ({ ...prev, [depId]: i }));
    }

    updateConfig({
      installedDeps: [...config.installedDeps, depId]
    });
    setInstalling(null);
  };

  const installAll = async () => {
    const missingDeps = dependencies.filter(d => getStatus(d.id) === 'missing');
    for (const dep of missingDeps) {
      await installDependency(dep.id);
    }
  };

  const refreshStatus = () => {
    // Simulate refresh
    console.log('Refreshing dependency status...');
  };

  const missingCount = dependencies.filter(d => getStatus(d.id) === 'missing').length;
  const installedCount = dependencies.filter(d => getStatus(d.id) === 'installed').length;

  return (
    <div className="dependencies">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1>Dependencies</h1>
          <p className="text-muted">Manage system dependencies for MO2</p>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={refreshStatus}>
            <RefreshCw size={20} className="mr-2" />
            Refresh
          </button>
          <button 
            className="btn btn-primary" 
            onClick={installAll}
            disabled={missingCount === 0}
          >
            <Download size={20} className="mr-2" />
            Install All ({missingCount})
          </button>
        </div>
      </div>

      <div className="grid grid-3 mb-4">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Status Overview</h3>
          </div>
          <div className="card-body">
            <div className="flex justify-between mb-2">
              <span className="text-muted">Installed</span>
              <span className="text-success">{installedCount}/{dependencies.length}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(installedCount / dependencies.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Required</h3>
          </div>
          <div className="card-body">
            <div className="flex justify-between mb-2">
              <span className="text-muted">Missing</span>
              <span className="text-error">{missingCount}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${((dependencies.filter(d => d.required).length - missingCount) / dependencies.filter(d => d.required).length) * 100}%`,
                  background: missingCount > 0 ? 'var(--error)' : 'var(--success)'
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Optional</h3>
          </div>
          <div className="card-body">
            <div className="flex justify-between mb-2">
              <span className="text-muted">Available</span>
              <span className="text-warning">{dependencies.filter(d => !d.required).length}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${(dependencies.filter(d => !d.required && config.installedDeps.includes(d.id)).length / dependencies.filter(d => !d.required).length) * 100}%`,
                  background: 'var(--warning)'
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Dependencies</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-2">
            {dependencies.map((dep) => {
              const status = getStatus(dep.id);
              const isInstalling = installing === dep.id;
              return (
                <div key={dep.id} className="card">
                  <div className="card-header">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <div>
                        <h4 className="text-cyan">{dep.name}</h4>
                        <p className="text-muted text-sm">{dep.description}</p>
                      </div>
                    </div>
                    {getStatusBadge(status)}
                  </div>
                  <div className="card-body">
                    {dep.required && (
                      <p className="text-error text-sm mb-2">Required dependency</p>
                    )}
                    
                    {isInstalling ? (
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-muted">Installing...</span>
                          <span className="text-cyan">{installProgress[dep.id]}%</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${installProgress[dep.id]}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : status === 'installed' ? (
                      <button className="btn btn-sm btn-success w-full" disabled>
                        <CheckCircle size={16} className="mr-2" />
                        Installed
                      </button>
                    ) : (
                      <button 
                        className="btn btn-sm w-full"
                        onClick={() => installDependency(dep.id)}
                        disabled={isInstalling}
                      >
                        <Download size={16} className="mr-2" />
                        Install
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dependencies;