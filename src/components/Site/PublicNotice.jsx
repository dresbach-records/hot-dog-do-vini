import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const PublicNotice = () => {
  const { publicNotice } = useSettings();

  if (!publicNotice || !publicNotice.enabled) {
    return null;
  }

  return (
    <div className="public-notice-wrapper site-container" style={{ padding: '40px 20px', position: 'relative', zIndex: 10 }}>
      <div className="public-notice-content">
        <div className="pn-icon">
          <AlertTriangle size={32} color="#dc2626" />
        </div>
        <div className="pn-body">
          <h3>{publicNotice.title}</h3>
          <p>{publicNotice.message}</p>
        </div>
      </div>
    </div>
  );
};

export default PublicNotice;
