import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  // Default values
  const defaultNotice = {
    enabled: true,
    salesEnabled: false, // Inicia bloqueado conforme solicitado
    title: 'Atenção',
    message: 'Estamos fechados temporariamente devido a problemas no abastecimento de água pela Corsan em Taquara.\nPrezamos pela qualidade dos nossos produtos e pelo bom atendimento, por isso retomaremos as atividades assim que a situação for normalizada.\nAgradecemos a compreensão'
  };

  const [publicNotice, setPublicNotice] = useState(defaultNotice);

  // Load from local storage on mount
  useEffect(() => {
    const savedNotice = localStorage.getItem('@vinis_public_notice');
    if (savedNotice) {
      try {
        setPublicNotice(JSON.parse(savedNotice));
      } catch (err) {
        console.error('Error parsing saved notice', err);
      }
    }
  }, []);

  const updatePublicNotice = (newStatusOrData) => {
    const updated = { ...publicNotice, ...newStatusOrData };
    setPublicNotice(updated);
    localStorage.setItem('@vinis_public_notice', JSON.stringify(updated));
  };

  return (
    <SettingsContext.Provider value={{ publicNotice, updatePublicNotice }}>
      {children}
    </SettingsContext.Provider>
  );
};
