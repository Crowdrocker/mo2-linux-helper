import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { 
  ExternalLink, 
  Plus, 
  Save, 
  Trash2,
  Gamepad2,
  Settings
} from 'lucide-react';

function NonSteamShortcuts() {
  const { config, updateConfig } = useContext(AppContext);
  const [shortcuts, setShortcuts] = useState([
    {
      id: 1,
      name: 'Mod Organizer 2',
      exe: config.mo2Path || '/home/user/.modorganizer2/ModOrganizer.exe',
      startDir: config.mo2Path || '/home/user/.modorganizer2',
      launchOptions: 'PROTON_NO_ESYNC=1 PROTON_NO_FSYNC=1 %command%'
    }
  ]);
  const [editingId, setEditingId] = useState(null);

  const addShortcut = () => {
    const newShortcut = {
      id: Date.now(),
      name: 'New Game',
      exe: '',
      startDir: '',
      launchOptions: 'PROTON_NO_ESYNC=1 PROTON_NO_FSYNC=1 %command%'
    };
    setShortcuts([...shortcuts, newShortcut]);
    setEditingId(newShortcut.id);
  };

  const updateShortcut = (id, field, value) => {
    setShortcuts(shortcuts.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const deleteShortcut = (id) => {
    setShortcuts(shortcuts.filter(s => s.id !== id));
  };

  const saveShortcuts = () => {
    // Generate VDF content
    const vdfContent = generateVDF(shortcuts);
    console.log('VDF Content:', vdfContent);
    updateConfig({ shortcuts });
  };

  const generateVDF = (shortcutsList) => {
    let vdf = '"shortcuts"\n{\n';
    shortcutsList.forEach((shortcut, index) => {
      vdf += `  "${index}"\n`;
      vdf += `  {\n`;
      vdf += `    "appid"    "${index + 1}"\n`;
      vdf += `    "name"    "${shortcut.name}"\n`;
      vdf += `    "exe"    "${shortcut.exe}"\n`;
      vdf += `    "StartDir"    "${shortcut.startDir}"\n`;
      vdf += `    "LaunchOptions"    "${shortcut.launchOptions}"\n`;
      vdf += `  }\n`;
    });
    vdf += '}';
    return vdf;
  };

  return (
    <div className="non-steam-shortcuts">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1>Non-Steam Shortcuts</h1>
          <p className="text-muted">Add MO2 and games to Steam as non-Steam shortcuts</p>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={addShortcut}>
            <Plus size={20} className="mr-2" />
            Add Shortcut
          </button>
          <button className="btn btn-primary" onClick={saveShortcuts}>
            <Save size={20} className="mr-2" />
            Save to Steam
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">
            <Settings size={20} className="mr-2" />
            Steam Configuration
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-2">
            <div>
              <label className="block text-muted mb-2">Steam Path</label>
              <input
                type="text"
                className="input"
                value={config.steamPath || '~/.steam/steam'}
                onChange={(e) => updateConfig({ steamPath: e.target.value })}
                placeholder="~/.steam/steam"
              />
            </div>
            <div>
              <label className="block text-muted mb-2">Shortcuts VDF Path</label>
              <input
                type="text"
                className="input"
                value="~/.steam/steam/userdata/your_id/config/shortcuts.vdf"
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        {shortcuts.map((shortcut) => (
          <div key={shortcut.id} className={`card ${editingId === shortcut.id ? 'glow' : ''}`}>
            <div className="card-header">
              <div className="flex items-center gap-2">
                <Gamepad2 size={24} className="text-cyan" />
                <h3 className="card-title">{shortcut.name}</h3>
              </div>
              <div className="flex gap-2">
                <button 
                  className="btn btn-sm"
                  onClick={() => setEditingId(editingId === shortcut.id ? null : shortcut.id)}
                >
                  <Settings size={16} />
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => deleteShortcut(shortcut.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="card-body">
              {editingId === shortcut.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-muted mb-1">Name</label>
                    <input
                      type="text"
                      className="input"
                      value={shortcut.name}
                      onChange={(e) => updateShortcut(shortcut.id, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-muted mb-1">Executable</label>
                    <input
                      type="text"
                      className="input"
                      value={shortcut.exe}
                      onChange={(e) => updateShortcut(shortcut.id, 'exe', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-muted mb-1">Start Directory</label>
                    <input
                      type="text"
                      className="input"
                      value={shortcut.startDir}
                      onChange={(e) => updateShortcut(shortcut.id, 'startDir', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-muted mb-1">Launch Options</label>
                    <input
                      type="text"
                      className="input"
                      value={shortcut.launchOptions}
                      onChange={(e) => updateShortcut(shortcut.id, 'launchOptions', e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-2">
                    <p className="text-muted text-sm">Executable</p>
                    <p className="text-cyan text-sm">{shortcut.exe}</p>
                  </div>
                  <div className="mb-2">
                    <p className="text-muted text-sm">Start Directory</p>
                    <p className="text-cyan text-sm">{shortcut.startDir}</p>
                  </div>
                  <div>
                    <p className="text-muted text-sm">Launch Options</p>
                    <p className="text-cyan text-sm">{shortcut.launchOptions}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <h3 className="card-title">Generated VDF Preview</h3>
        </div>
        <div className="card-body">
          <pre className="terminal" style={{ maxHeight: '300px' }}>
            <code>{generateVDF(shortcuts)}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

export default NonSteamShortcuts;