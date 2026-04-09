import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const resp = await api.get('/config');
      if (resp.success) {
        setSettings(resp.data);
      }
    } catch (err) {
      console.error('Falha ao carregar configurações do site:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Helper para acessar o aviso (compatibilidade com código existente)
  const publicNotice = {
    enabled: settings.notice_enabled === '1',
    salesEnabled: settings.sales_enabled === '1',
    title: settings.notice_title || 'Aviso',
    message: settings.notice_message || ''
  };

  const updatePublicNotice = async (newData) => {
    // Para manter compatibilidade com o chamador que passava { enabled: bool }
    // Mapeamos para o formato que a API espera (chaves do banco)
    const apiUpdate = {};
    if (newData.enabled !== undefined) apiUpdate.notice_enabled = newData.enabled ? '1' : '0';
    if (newData.salesEnabled !== undefined) apiUpdate.sales_enabled = newData.salesEnabled ? '1' : '0';
    if (newData.title !== undefined) apiUpdate.notice_title = newData.title;
    if (newData.message !== undefined) apiUpdate.notice_message = newData.message;

    try {
      const resp = await api.post('/config', { configs: apiUpdate });
      if (resp.success) {
        setSettings(prev => ({ ...prev, ...apiUpdate }));
      }
    } catch (err) {
      console.error('Falha ao atualizar configurações:', err);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, publicNotice, updatePublicNotice, fetchSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};
