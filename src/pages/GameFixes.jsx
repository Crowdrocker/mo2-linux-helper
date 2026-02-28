import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { 
  Gamepad2, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Tag
} from 'lucide-react';

function GameFixes() {
  const { config, updateConfig } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Games' },
    { id: 'rpg', name: 'RPG' },
    { id: 'action', name: 'Action' },
    { id: 'tool', name: 'Tools' }
  ];

  const games = [
    { id: 'cyberpunk', name: 'Cyberpunk 2077', category: 'action', fixes: ['proton-ge', 'dxvk', 'esync'] },
    { id: 'fallout4', name: 'Fallout 4', category: 'rpg', fixes: ['f4se', 'archive-invalidation'] },
    { id: 'fallout3', name: 'Fallout 3', category: 'rpg', fixes: ['fose', 'dsfix'] },
    { id: 'falloutnv', name: 'Fallout: New Vegas', category: 'rpg', fixes: ['nvse', '4gb-patch'] },
    { id: 'skyrimse', name: 'Skyrim Special Edition', category: 'rpg', fixes: ['skse64', 'ussep'] },
    { id: 'skyrimvr', name: 'Skyrim VR', category: 'rpg', fixes: ['sksevr', 'vr-fixes'] },
    { id: 'oblivion', name: 'Oblivion Remastered', category: 'rpg', fixes: ['obse', 'mgso'] },
    { id: 'morrowind', name: 'Morrowind', category: 'rpg', fixes: ['mge-xe', 'openmw'] },
    { id: 'starfield', name: 'Starfield', category: 'rpg', fixes: ['sfse', 'proton-ge'] },
    { id: 'bg3', name: "Baldur's Gate 3", category: 'rpg', fixes: ['dxvk', 'vulkan'] },
    { id: 'witcher3', name: 'The Witcher 3', category: 'rpg', fixes: ['proton-ge', 'dxvk'] },
    { id: 'dsr', name: 'Dark Souls Remastered', category: 'action', fixes: ['dsfix', 'proton-ge'] },
    { id: 'eldenring', name: 'Elden Ring', category: 'action', fixes: ['proton-ge', 'dxvk'] },
    { id: 'bodyslide', name: 'BodySlide', category: 'tool', fixes: ['netfx', 'mono'] },
    { id: 'nifskope', name: 'NifSkope', category: 'tool', fixes: ['qt5', 'opengl'] },
    { id: 'xedit', name: 'xEdit', category: 'tool', fixes: ['netfx', 'mono'] },
    { id: 'synthesis', name: 'Synthesis', category: 'tool', fixes: ['python3', 'netfx'] },
    { id: 'loot', name: 'LOOT', category: 'tool', fixes: ['python3', 'qt5'] }
  ];

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleGameFix = (gameId) => {
    const currentFixes = config.gameFixes || {};
    updateConfig({
      gameFixes: {
        ...currentFixes,
        [gameId]: !currentFixes[gameId]
      }
    });
  };

  const applyAllFixes = () => {
    const allFixes = {};
    games.forEach(game => {
      allFixes[game.id] = true;
    });
    updateConfig({ gameFixes: allFixes });
  };

  const removeAllFixes = () => {
    updateConfig({ gameFixes: {} });
  };

  const activeCount = Object.values(config.gameFixes || {}).filter(v => v).length;

  return (
    <div className="game-fixes">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1>Game Fixes</h1>
          <p className="text-muted">Apply game-specific fixes and patches</p>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={removeAllFixes}>
            <XCircle size={20} className="mr-2" />
            Remove All
          </button>
          <button className="btn btn-primary" onClick={applyAllFixes}>
            <CheckCircle size={20} className="mr-2" />
            Apply All ({activeCount})
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
                  placeholder="Search games..."
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

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">Active Fixes</h3>
        </div>
        <div className="card-body">
          <div className="flex gap-2 flex-wrap">
            {activeCount === 0 ? (
              <p className="text-muted">No game fixes active</p>
            ) : (
              Object.entries(config.gameFixes || {})
                .filter(([_, active]) => active)
                .map(([gameId, _]) => {
                  const game = games.find(g => g.id === gameId);
                  return game ? (
                    <span key={gameId} className="badge badge-success">
                      {game.name}
                    </span>
                  ) : null;
                })
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-3">
        {filteredGames.map((game) => {
          const isActive = config.gameFixes?.[game.id];
          return (
            <div key={game.id} className={`card ${isActive ? 'glow' : ''}`}>
              <div className="card-header">
                <div className="flex items-center gap-2">
                  <Gamepad2 size={24} className={isActive ? 'text-cyan' : 'text-muted'} />
                  <div>
                    <h3 className="card-title">{game.name}</h3>
                    <span className="badge badge-info">{game.category}</span>
                  </div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => toggleGameFix(game.id)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="card-body">
                <div className="mb-2">
                  <p className="text-muted text-sm mb-1">Applied Fixes:</p>
                  <div className="flex gap-1 flex-wrap">
                    {game.fixes.map((fix, index) => (
                      <span key={index} className="badge badge-warning text-xs">
                        <Tag size={12} className="mr-1" />
                        {fix}
                      </span>
                    ))}
                  </div>
                </div>
                {isActive && (
                  <button className="btn btn-sm btn-success w-full mt-2">
                    <CheckCircle size={16} className="mr-2" />
                    Active
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredGames.length === 0 && (
        <div className="card">
          <div className="card-body text-center">
            <Gamepad2 size={48} className="text-muted mb-2" />
            <p className="text-muted">No games found matching your search</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameFixes;