import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { 
  RefreshCw, 
  Download, 
  CheckCircle, 
  AlertTriangle,
  Search,
  Filter,
  Package
} from 'lucide-react';

function NativePlugins() {
  const { config, updateConfig } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [installing, setInstalling] = useState(null);

  const categories = [
    { id: 'all', name: 'All Plugins' },
    { id: 'cyberpunk', name: 'Cyberpunk 2077' },
    { id: 'fallout', name: 'Fallout Series' },
    { id: 'skyrim', name: 'Skyrim Series' },
    { id: 'other', name: 'Other Games' }
  ];

  const plugins = [
    { id: 'libgame_cyberpunk', name: 'libgame_cyberpunk.so', game: 'Cyberpunk 2077', category: 'cyberpunk', version: '1.2.0', status: 'installed' },
    { id: 'libgame_fallout4', name: 'libgame_fallout4.so', game: 'Fallout 4', category: 'fallout', version: '1.5.0', status: 'installed' },
    { id: 'libgame_fallout3', name: 'libgame_fallout3.so', game: 'Fallout 3', category: 'fallout', version: '1.3.0', status: 'available' },
    { id: 'libgame_falloutnv', name: 'libgame_falloutnv.so', game: 'Fallout: New Vegas', category: 'fallout', version: '1.4.0', status: 'available' },
    { id: 'libgame_skyrimse', name: 'libgame_skyrimse.so', game: 'Skyrim SE', category: 'skyrim', version: '2.1.0', status: 'installed' },
    { id: 'libgame_skyrimvr', name: 'libgame_skyrimvr.so', game: 'Skyrim VR', category: 'skyrim', version: '1.8.0', status: 'available' },
    { id: 'libgame_oblivion', name: 'libgame_oblivion.so', game: 'Oblivion', category: 'other', version: '1.2.0', status: 'available' },
    { id: 'libgame_morrowind', name: 'libgame_morrowind.so', game: 'Morrowind', category: 'other', version: '1.1.0', status: 'available' },
    { id: 'libgame_starfield', name: 'libgame_starfield.so', game: 'Starfield', category: 'other', version: '1.0.0', status: 'available' },
    { id: 'libgame_bg3', name: 'libgame_bg3.so', game: "Baldur's Gate 3", category: 'other', version: '1.3.0', status: 'installed' },
    { id: 'libgame_witcher3', name: 'libgame_witcher3.so', game: 'The Witcher 3', category: 'other', version: '1.4.0', status: 'available' },
    { id: 'libgame_dsr', name: 'libgame_dsr.so', game: 'Dark Souls Remastered', category: 'other', version: '1.2.0', status: 'available' },
    { id: 'libgame_eldenring', name: 'libgame_eldenring.so', game: 'Elden Ring', category: 'other', version: '1.5.0', status: 'available' },
    { id: 'libgame_bodyslide', name: 'libgame_bodyslide.so', game: 'BodySlide', category: 'other', version: '1.1.0', status: 'available' },
    { id: 'libgame_nifskope', name: 'libgame_nifskope.so', game: 'NifSkope', category: 'other', version: '2.0.0', status: 'available' },
    { id: 'libgame_xedit', name: 'libgame_xedit.so', game: 'xEdit', category: 'other', version: '4.1.0', status: 'installed' },
    { id: 'libgame_synthesis', name: 'libgame_synthesis.so', game: 'Synthesis', category: 'other', version: '1.6.0', status: 'available' },
    { id: 'libgame_loot', name: 'libgame_loot.so', game: 'LOOT', category: 'other', version: '0.20.0', status: 'available' }
  ];

  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.game.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const installPlugin = async (pluginId) => {
    setInstalling(pluginId);
    // Simulate installation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    updateConfig({
      nativePlugins: [...(config.nativePlugins || []), pluginId]
    });
    setInstalling(null);
  };

  const updateAllPlugins = async () => {
    const availablePlugins = filteredPlugins.filter(p => p.status === 'available');
    for (const plugin of availablePlugins) {
      await installPlugin(plugin.id);
    }
  };

  const refreshPlugins = () => {
    console.log('Refreshing plugin status...');
  };

  const installedCount = filteredPlugins.filter(p => p.status === 'installed').length;
  const availableCount = filteredPlugins.filter(p => p.status === 'available').length;

  return (
    <div className="native-plugins">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1>Native Plugins</h1>
          <p className="text-muted">Manage Linux-native game plugins (libgame_*.so)</p>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={refreshPlugins}>
            <RefreshCw size={20} className="mr-2" />
            Refresh
          </button>
          <button 
            className="btn btn-primary" 
            onClick={updateAllPlugins}
            disabled={availableCount === 0}
          >
            <Download size={20} className="mr-2" />
            Update All ({availableCount})
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Search size={20} className="text-muted" />
                <input
                  type="text"
                  className="input"
                  placeholder="Search plugins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-muted" />
              <select
                className="select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-3 mb-4">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Total Plugins</h3>
          </div>
          <div className="card-body">
            <p className="text-cyan text-3xl">{filteredPlugins.length}</p>
            <p className="text-muted text-sm">Native plugins available</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Installed</h3>
          </div>
          <div className="card-body">
            <p className="text-success text-3xl">{installedCount}</p>
            <p className="text-muted text-sm">Plugins currently installed</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Available</h3>
          </div>
          <div className="card-body">
            <p className="text-warning text-3xl">{availableCount}</p>
            <p className="text-muted text-sm">Updates available</p>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        {filteredPlugins.map((plugin) => {
          const isInstalled = plugin.status === 'installed';
          const isInstalling = installing === plugin.id;
          return (
            <div key={plugin.id} className="card">
              <div className="card-header">
                <div className="flex items-center gap-2">
                  <Package size={24} className={isInstalled ? 'text-success' : 'text-warning'} />
                  <div>
                    <h3 className="card-title">{plugin.name}</h3>
                    <p className="text-muted text-sm">{plugin.game}</p>
                  </div>
                </div>
                {isInstalled ? (
                  <CheckCircle size={24} className="text-success" />
                ) : (
                  <AlertTriangle size={24} className="text-warning" />
                )}
              </div>
              <div className="card-body">
                <div className="flex justify-between mb-2">
                  <span className="text-muted">Version</span>
                  <span className="text-cyan">{plugin.version}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted">Status</span>
                  <span className={isInstalled ? 'text-success' : 'text-warning'}>
                    {isInstalled ? 'Installed' : 'Available'}
                  </span>
                </div>
                
                {isInstalling ? (
                  <button className="btn btn-sm w-full" disabled>
                    <RefreshCw size={16} className="mr-2 spin" />
                    Installing...
                  </button>
                ) : isInstalled ? (
                  <button className="btn btn-sm btn-success w-full" disabled>
                    <CheckCircle size={16} className="mr-2" />
                    Installed
                  </button>
                ) : (
                  <button 
                    className="btn btn-sm w-full"
                    onClick={() => installPlugin(plugin.id)}
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

      {filteredPlugins.length === 0 && (
        <div className="card">
          <div className="card-body text-center">
            <Package size={48} className="text-muted mb-2" />
            <p className="text-muted">No plugins found matching your search</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default NativePlugins;