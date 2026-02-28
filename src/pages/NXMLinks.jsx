import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { 
  Link2, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  FileText,
  Copy,
  Download
} from 'lucide-react';

function NXMLinks() {
  const { config, updateConfig } = useContext(AppContext);
  const [desktopPreview, setDesktopPreview] = useState(generateDesktopFile(config));

  function generateDesktopFile(cfg) {
    return `[Desktop Entry]
Name=Mod Organizer 2
Comment=Mod Organizer 2 for Linux
Exec=${cfg.mo2Path || '/home/user/.modorganizer2'}/ModOrganizer.exe %u
Icon=${cfg.mo2Path || '/home/user/.modorganizer2'}/mo2.ico
Type=Application
Categories=Game;
MimeType=x-scheme-handler/nxm;
Terminal=false
StartupNotify=true`;
  }

  const registerHandler = () => {
    updateConfig({ nxmHandlerRegistered: true });
    setDesktopPreview(generateDesktopFile({ ...config, nxmHandlerRegistered: true }));
  };

  const unregisterHandler = () => {
    updateConfig({ nxmHandlerRegistered: false });
    setDesktopPreview(generateDesktopFile({ ...config, nxmHandlerRegistered: false }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(desktopPreview);
  };

  const downloadDesktopFile = () => {
    const blob = new Blob([desktopPreview], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mo2-nxm-handler.desktop';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="nxm-links">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1>NXM Links</h1>
          <p className="text-muted">Configure Nexus Mods link handler</p>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={copyToClipboard}>
            <Copy size={20} className="mr-2" />
            Copy
          </button>
          <button className="btn" onClick={downloadDesktopFile}>
            <Download size={20} className="mr-2" />
            Download
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">Handler Status</h3>
          {config.nxmHandlerRegistered ? (
            <CheckCircle size={32} className="text-success" />
          ) : (
            <XCircle size={32} className="text-error" />
          )}
        </div>
        <div className="card-body">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-muted mb-2">NXM Link Handler</p>
              <p className={config.nxmHandlerRegistered ? 'text-success' : 'text-error'}>
                {config.nxmHandlerRegistered ? 'Registered' : 'Not Registered'}
              </p>
            </div>
            <div className="flex gap-2">
              {config.nxmHandlerRegistered ? (
                <button className="btn btn-danger" onClick={unregisterHandler}>
                  <XCircle size={20} className="mr-2" />
                  Unregister
                </button>
              ) : (
                <button className="btn btn-success" onClick={registerHandler}>
                  <CheckCircle size={20} className="mr-2" />
                  Register Handler
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <FileText size={20} className="mr-2" />
            .desktop File Preview
          </h3>
        </div>
        <div className="card-body">
          <pre className="terminal" style={{ maxHeight: '300px' }}>
            <code>{desktopPreview}</code>
          </pre>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <h3 className="card-title">Instructions</h3>
        </div>
        <div className="card-body">
          <ol className="text-muted" style={{ paddingLeft: '1.5rem' }}>
            <li className="mb-2">Download the .desktop file using the button above</li>
            <li className="mb-2">Copy it to ~/.local/share/applications/</li>
            <li className="mb-2">Run: update-desktop-database ~/.local/share/applications/</li>
            <li className="mb-2">Set as default in your browser settings</li>
            <li>Test by clicking an NXM link from Nexus Mods</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default NXMLinks;