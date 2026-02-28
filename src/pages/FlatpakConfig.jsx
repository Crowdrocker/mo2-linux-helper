import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { 
  Box, 
  CheckCircle, 
  Copy, 
  Download,
  Terminal,
  Shield,
  HardDrive,
  Globe
} from 'lucide-react';

function FlatpakConfig() {
  const { config, updateConfig } = useContext(AppContext);
  const [permissions, setPermissions] = useState({
    filesystem: ['host', 'home'],
    device: ['all'],
    socket: ['x11', 'wayland', 'pulseaudio'],
    environment: ['STEAM_COMPAT_DATA_PATH'],
    share: ['network'],
    talk: ['name=com.valvesoftware.Steam']
  });

  const togglePermission = (category, value) => {
    setPermissions(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
  };

  const generateFlatpakOverride = () => {
    let cmd = 'flatpak override --user com.modorganizer.MO2';
    
    Object.entries(permissions).forEach(([category, values]) => {
      values.forEach(value => {
        cmd += ` --${category}=${value}`;
      });
    });

    return cmd;
  };

  const generateManifest = () => {
    return `app-id: com.modorganizer.MO2
runtime: org.freedesktop.Platform
runtime-version: '23.08'
sdk: org.freedesktop.Sdk
command: mo2

finish-args:
${Object.entries(permissions).map(([category, values]) => 
  values.map(value => `  --${category}=${value}`).join('\n')
).join('\n')}

modules:
  - name: mo2
    buildsystem: simple
    build-commands:
      - install -Dm755 mo2-wrapper /app/bin/mo2
      - install -Dm644 mo2.png /app/share/icons/hicolor/256x256/apps/com.modorganizer.MO2.png
      - install -Dm644 com.modorganizer.MO2.desktop /app/share/applications/com.modorganizer.MO2.desktop
    sources:
      - type: file
        path: mo2-wrapper
      - type: file
        path: mo2.png
      - type: file
        path: com.modorganizer.MO2.desktop`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadManifest = () => {
    const manifest = generateManifest();
    const blob = new Blob([manifest], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'com.modorganizer.MO2.yml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const permissionCategories = [
    { id: 'filesystem', name: 'Filesystem Access', icon: HardDrive, options: ['host', 'home', 'xdg-documents', 'xdg-download'] },
    { id: 'device', name: 'Device Access', icon: Shield, options: ['all', 'dri', 'kvm'] },
    { id: 'socket', name: 'Sockets', icon: Globe, options: ['x11', 'wayland', 'pulseaudio', 'fallback-x11'] },
    { id: 'environment', name: 'Environment Variables', icon: Terminal, options: ['STEAM_COMPAT_DATA_PATH', 'WINEPREFIX'] },
    { id: 'share', name: 'Shared Resources', icon: Globe, options: ['network', 'ipc'] },
    { id: 'talk', name: 'D-Bus Access', icon: Terminal, options: ['name=com.valvesoftware.Steam', 'name=org.freedesktop.Notifications'] }
  ];

  return (
    <div className="flatpak-config">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1>Flatpak Configuration</h1>
          <p className="text-muted">Configure Flatpak permissions and manifest</p>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={() => copyToClipboard(generateFlatpakOverride())}>
            <Copy size={20} className="mr-2" />
            Copy Override
          </button>
          <button className="btn" onClick={downloadManifest}>
            <Download size={20} className="mr-2" />
            Download Manifest
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">Flatpak Status</h3>
          <label className="toggle">
            <input
              type="checkbox"
              checked={config.flatpakEnabled}
              onChange={(e) => updateConfig({ flatpakEnabled: e.target.checked })}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="card-body">
          <p className={config.flatpakEnabled ? 'text-success' : 'text-muted'}>
            {config.flatpakEnabled ? 'Flatpak support enabled' : 'Flatpak support disabled'}
          </p>
        </div>
      </div>

      <div className="grid grid-2 mb-4">
        {permissionCategories.map((category) => {
          const Icon = category.icon;
          return (
            <div key={category.id} className="card">
              <div className="card-header">
                <div className="flex items-center gap-2">
                  <Icon size={24} className="text-cyan" />
                  <h3 className="card-title">{category.name}</h3>
                </div>
              </div>
              <div className="card-body">
                <div className="space-y-2">
                  {category.options.map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions[category.id].includes(option)}
                        onChange={() => togglePermission(category.id, option)}
                        className="toggle"
                      />
                      <span className="text-sm">{option}</span>
                      {permissions[category.id].includes(option) && (
                        <CheckCircle size={16} className="text-success ml-auto" />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">Generated Override Command</h3>
        </div>
        <div className="card-body">
          <pre className="terminal">
            <code>{generateFlatpakOverride()}</code>
          </pre>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Flatpak Manifest (com.modorganizer.MO2.yml)</h3>
        </div>
        <div className="card-body">
          <pre className="terminal" style={{ maxHeight: '400px' }}>
            <code>{generateManifest()}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

export default FlatpakConfig;