import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../App';
import { 
  Terminal, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Save,
  FolderOpen
} from 'lucide-react';

function SetupWizard() {
  const { config, updateConfig } = useContext(AppContext);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [dryRun, setDryRun] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [progress, setProgress] = useState(0);
  const [installPath, setInstallPath] = useState(config.mo2Path || '');
  const terminalRef = useRef(null);

  const steps = [
    { id: 'welcome', title: 'Welcome', description: 'Introduction to MO2 Linux Helper' },
    { id: 'paths', title: 'Configuration', description: 'Set up paths and options' },
    { id: 'install', title: 'Installation', description: 'Install MO2 and dependencies' },
    { id: 'complete', title: 'Complete', description: 'Setup finished successfully' }
  ];

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  const addTerminalLine = (text, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTerminalOutput(prev => [...prev, { text, type, timestamp }]);
  };

  const simulateInstallation = async () => {
    setIsRunning(true);
    setProgress(0);
    setTerminalOutput([]);

    const commands = [
      { cmd: 'Checking system requirements...', delay: 500 },
      { cmd: '✓ Arch Linux detected', type: 'success', delay: 800 },
      { cmd: '✓ Steam installation found', type: 'success', delay: 600 },
      { cmd: 'Installing dependencies...', delay: 400 },
      { cmd: '$ sudo pacman -S wine winetricks protontricks', type: 'command', delay: 1000 },
      { cmd: '✓ wine installed', type: 'success', delay: 500 },
      { cmd: '✓ winetricks installed', type: 'success', delay: 500 },
      { cmd: '✓ protontricks installed', type: 'success', delay: 500 },
      { cmd: 'Downloading Mod Organizer 2...', delay: 600 },
      { cmd: '✓ Download complete', type: 'success', delay: 800 },
      { cmd: 'Extracting MO2 archive...', delay: 700 },
      { cmd: '✓ Extraction complete', type: 'success', delay: 500 },
      { cmd: 'Configuring MO2 for Linux...', delay: 600 },
      { cmd: '✓ MO2 configured', type: 'success', delay: 500 },
      { cmd: 'Setting up NXM link handler...', delay: 500 },
      { cmd: '✓ NXM handler registered', type: 'success', delay: 500 },
      { cmd: 'Applying game fixes...', delay: 400 },
      { cmd: '✓ Cyberpunk 2077 fixes applied', type: 'success', delay: 400 },
      { cmd: '✓ Fallout 4 fixes applied', type: 'success', delay: 400 },
      { cmd: '✓ xEdit fixes applied', type: 'success', delay: 400 },
      { cmd: '✓ Synthesis fixes applied', type: 'success', delay: 400 },
      { cmd: '✓ Baldur\'s Gate 3 fixes applied', type: 'success', delay: 400 },
      { cmd: 'Installation complete!', type: 'success', delay: 500 }
    ];

    for (let i = 0; i < commands.length; i++) {
      const { cmd, type = 'info', delay } = commands[i];
      addTerminalLine(cmd, type);
      setProgress(((i + 1) / commands.length) * 100);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    setIsRunning(false);
    updateConfig({
      mo2Path: installPath || '/home/user/.modorganizer2',
      installedDeps: ['winetricks', 'protontricks', 'wine', 'python3', 'git'],
      nxmHandlerRegistered: true,
      gameFixes: {
        cyberpunk: true,
        fallout4: true,
        xedit: true,
        synthesis: true,
        bg3: true
      }
    });
    setCurrentStep(3);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartInstall = () => {
    setCurrentStep(2);
    simulateInstallation();
  };

  const resetWizard = () => {
    setCurrentStep(0);
    setTerminalOutput([]);
    setProgress(0);
    setIsRunning(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="wizard-step">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Welcome to MO2 Linux Helper</h2>
              </div>
              <div className="card-body">
                <p className="mb-4">
                  This wizard will guide you through setting up Mod Organizer 2 on Linux with Proton.
                  The helper will automatically install dependencies, configure NXM links, and apply game-specific fixes.
                </p>
                <div className="grid grid-2 mt-4">
                  <div className="card">
                    <h3 className="text-cyan mb-2">Features</h3>
                    <ul className="text-muted">
                      <li>✓ Auto-install MO2 + Proton dependencies</li>
                      <li>✓ NXM link handler setup</li>
                      <li>✓ Game fixes for 18+ titles</li>
                      <li>✓ Flatpak support</li>
                      <li>✓ Portable instance detection</li>
                      <li>✓ Native plugin management</li>
                    </ul>
                  </div>
                  <div className="card">
                    <h3 className="text-cyan mb-2">Supported Games</h3>
                    <ul className="text-muted">
                      <li>✓ Cyberpunk 2077</li>
                      <li>✓ Fallout 4 / 3 / NV</li>
                      <li>✓ Skyrim SE / VR</li>
                      <li>✓ Baldur's Gate 3</li>
                      <li>✓ Starfield</li>
                      <li>✓ Witcher 3</li>
                      <li>✓ And 12 more...</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="wizard-step">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Configuration</h2>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <label className="block text-muted mb-2">MO2 Install Path</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input"
                      value={installPath}
                      onChange={(e) => setInstallPath(e.target.value)}
                      placeholder="/home/user/.modorganizer2"
                    />
                    <button className="btn">
                      <FolderOpen size={20} />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dryRun}
                      onChange={(e) => setDryRun(e.target.checked)}
                      className="toggle"
                    />
                    <span>Dry Run (simulate installation)</span>
                  </label>
                  <p className="text-muted text-sm mt-1">
                    Test the installation process without making changes
                  </p>
                </div>

                <div className="card mt-4">
                  <h3 className="text-cyan mb-2">Installation Summary</h3>
                  <div className="grid grid-2">
                    <div>
                      <p className="text-muted">Install Path</p>
                      <p className="text-cyan">{installPath || 'Default'}</p>
                    </div>
                    <div>
                      <p className="text-muted">Mode</p>
                      <p className="text-cyan">{dryRun ? 'Dry Run' : 'Full Install'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="wizard-step">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Installation</h2>
                <div className="flex items-center gap-2">
                  {isRunning ? (
                    <button className="btn btn-sm btn-danger" onClick={() => setIsRunning(false)}>
                      <Pause size={16} />
                    </button>
                  ) : (
                    <button className="btn btn-sm" onClick={simulateInstallation}>
                      <Play size={16} />
                    </button>
                  )}
                  <button className="btn btn-sm btn-orange" onClick={resetWizard}>
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted">Progress</span>
                    <span className="text-cyan">{Math.round(progress)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="terminal" ref={terminalRef}>
                  {terminalOutput.length === 0 ? (
                    <p className="text-muted">Click Play to start installation...</p>
                  ) : (
                    terminalOutput.map((line, index) => (
                      <div key={index} className={`terminal-line ${line.type}`}>
                        <span className="text-muted">[{line.timestamp}]</span>{' '}
                        {line.text}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="wizard-step">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Setup Complete!</h2>
                <CheckCircle size={32} className="text-success" />
              </div>
              <div className="card-body">
                <p className="mb-4">
                  Mod Organizer 2 has been successfully configured for Linux!
                </p>
                <div className="grid grid-2 mt-4">
                  <div className="card">
                    <h3 className="text-success mb-2">✓ Completed</h3>
                    <ul className="text-muted">
                      <li>✓ MO2 installed</li>
                      <li>✓ Dependencies configured</li>
                      <li>✓ NXM handler registered</li>
                      <li>✓ Game fixes applied</li>
                    </ul>
                  </div>
                  <div className="card">
                    <h3 className="text-cyan mb-2">Next Steps</h3>
                    <ul className="text-muted">
                      <li>→ Configure your games</li>
                      <li>→ Install mods via NXM links</li>
                      <li>→ Set up portable instances</li>
                      <li>→ Manage native plugins</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="setup-wizard">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1>Setup Wizard</h1>
          <p className="text-muted">{steps[currentStep].description}</p>
        </div>
        <div className="flex items-center gap-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`step-indicator ${
                index === currentStep ? 'active' : ''
              } ${index < currentStep ? 'complete' : ''}`}
            >
              {index < currentStep ? <CheckCircle size={16} /> : index + 1}
            </div>
          ))}
        </div>
      </div>

      {renderStep()}

      <div className="flex justify-between mt-4">
        <button
          className="btn"
          onClick={handleBack}
          disabled={currentStep === 0 || isRunning}
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>

        {currentStep === 1 && (
          <button className="btn btn-primary" onClick={handleStartInstall}>
            <Play size={20} className="mr-2" />
            Start Installation
          </button>
        )}

        {currentStep === 3 && (
          <button className="btn btn-success" onClick={() => window.location.href = '/dashboard'}>
            <CheckCircle size={20} className="mr-2" />
            Go to Dashboard
          </button>
        )}

        {currentStep === 0 && (
          <button className="btn btn-primary" onClick={handleNext}>
            Next
            <ArrowRight size={20} className="ml-2" />
          </button>
        )}
      </div>
    </div>
  );
}

export default SetupWizard;