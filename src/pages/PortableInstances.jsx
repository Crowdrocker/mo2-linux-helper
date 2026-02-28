import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { 
  HardDrive, 
  Search, 
  RefreshCw, 
  Play, 
  Trash2,
  FolderOpen,
  Plus
} from 'lucide-react';

function PortableInstances() {
  const { config, updateConfig } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    // Simulate initial scan
    if (config.portableInstances.length === 0) {
      scanInstances();
    }
  }, []);

  const scanInstances = async () => {
    setScanning(true);
    // Simulate scanning
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const foundInstances = [
      {
        id: 1,
        name: 'Cyberpunk 2077',
        path: '/home/user/Games/Cyberpunk2077/ModOrganizer.ini',
        game: 'Cyberpunk 2077',
        mods: 45,
        size: '12.5 GB',
        lastModified: '2024-01-15'
      },
      {
        id: 2,
        name: 'Fallout 4',
        path: '/home/user/Games/Fallout4/ModOrganizer.ini',
        game: 'Fallout 4',
        mods: 128,
        size: '45.2 GB',
        lastModified: '2024-01-14'
      },
      {
        id: 3,
        name: 'Skyrim SE',
        path: '/home/user/Games/SkyrimSE/ModOrganizer.ini',
        game: 'Skyrim Special Edition',
        mods: 256,
        size: '78.3 GB',
        lastModified: '2024-01-13'
      }
    ];

    updateConfig({ portableInstances: foundInstances });
    setScanning(false);
  };

  const launchInstance = (instance) => {
    console.log('Launching instance:', instance.name);
  };

  const removeInstance = (instanceId) => {
    updateConfig({
      portableInstances: config.portableInstances.filter(i => i.id !== instanceId)
    });
  };

  const addInstance = () => {
    const newInstance = {
      id: Date.now(),
      name: 'New Instance',
      path: '/home/user/Games/NewInstance/ModOrganizer.ini',
      game: 'Unknown',
      mods: 0,
      size: '0 GB',
      lastModified: new Date().toISOString().split('T')[0]
    };
    updateConfig({
      portableInstances: [...config.portableInstances, newInstance]
    });
  };

  const filteredInstances = config.portableInstances.filter(instance =>
    instance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instance.game.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="portable-instances">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1>Portable Instances</h1>
          <p className="text-muted">Manage portable MO2 instances</p>
        </div>
        <div className="flex gap-2">
          <button 
            className="btn" 
            onClick={scanInstances}
            disabled={scanning}
          >
            <RefreshCw size={20} className={`mr-2 ${scanning ? 'spin' : ''}`} />
            {scanning ? 'Scanning...' : 'Scan'}
          </button>
          <button className="btn btn-primary" onClick={addInstance}>
            <Plus size={20} className="mr-2" />
            Add Instance
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="flex items-center gap-2">
            <Search size={20} className="text-muted" />
            <input
              type="text"
              className="input"
              placeholder="Search instances..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">Instance Overview</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-4">
            <div>
              <p className="text-muted">Total Instances</p>
              <p className="text-cyan text-2xl">{config.portableInstances.length}</p>
            </div>
            <div>
              <p className="text-muted">Total Mods</p>
              <p className="text-cyan text-2xl">
                {config.portableInstances.reduce((sum, i) => sum + i.mods, 0)}
              </p>
            </div>
            <div>
              <p className="text-muted">Total Size</p>
              <p className="text-cyan text-2xl">
                {(config.portableInstances.reduce((sum, i) => sum + parseFloat(i.size), 0)).toFixed(1)} GB
              </p>
            </div>
            <div>
              <p className="text-muted">Games</p>
              <p className="text-cyan text-2xl">
                {new Set(config.portableInstances.map(i => i.game)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        {filteredInstances.map((instance) => (
          <div key={instance.id} className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <HardDrive size={24} className="text-cyan" />
                <div>
                  <h3 className="card-title">{instance.name}</h3>
                  <p className="text-muted text-sm">{instance.game}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  className="btn btn-sm btn-success"
                  onClick={() => launchInstance(instance)}
                >
                  <Play size={16} />
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => removeInstance(instance.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-2 mb-2">
                <div>
                  <p className="text-muted text-sm">Mods</p>
                  <p className="text-cyan">{instance.mods}</p>
                </div>
                <div>
                  <p className="text-muted text-sm">Size</p>
                  <p className="text-cyan">{instance.size}</p>
                </div>
              </div>
              <div className="mb-2">
                <p className="text-muted text-sm">Path</p>
                <p className="text-cyan text-sm truncate">{instance.path}</p>
              </div>
              <div>
                <p className="text-muted text-sm">Last Modified</p>
                <p className="text-muted text-sm">{instance.lastModified}</p>
              </div>
              <button className="btn btn-sm w-full mt-2">
                <FolderOpen size={16} className="mr-2" />
                Open Folder
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredInstances.length === 0 && (
        <div className="card">
          <div className="card-body text-center">
            <HardDrive size={48} className="text-muted mb-2" />
            <p className="text-muted">No instances found</p>
            <button className="btn btn-primary mt-2" onClick={scanInstances}>
              <RefreshCw size={20} className="mr-2" />
              Scan for Instances
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PortableInstances;