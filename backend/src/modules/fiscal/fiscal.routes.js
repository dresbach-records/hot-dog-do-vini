import express from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const router = express.Router();

// Garantir que carregamos o .env
dotenv.config();

router.get('/status', (req, res) => {
  const certPath = process.env.FISCAL_CERT_PATH;
  const certName = process.env.FISCAL_CERT_NAME;

  if (!certPath || !certName) {
    return res.json({
      success: false,
      error: 'Configuração do certificado não encontrada no servidor (.env)',
      config: { path: certPath, name: certName }
    });
  }

  try {
    const fullPathWithoutExt = path.join(certPath, certName);
    
    // Extensões comuns de certificado A1
    const extensions = ['', '.pfx', '.p12', '.cer', '.crt'];
    let found = false;
    let foundFile = '';
    let stats = null;

    for (const ext of extensions) {
      const p = fullPathWithoutExt + ext;
      if (fs.existsSync(p)) {
        found = true;
        foundFile = p;
        stats = fs.statSync(p);
        break;
      }
    }

    if (found) {
      return res.json({
        success: true,
        status: 'ENCONTRADO',
        message: 'Certificado digital detectado com sucesso.',
        data: {
          path: foundFile,
          size: stats.size,
          modified: stats.mtime
        }
      });
    } else {
      return res.json({
        success: false,
        status: 'NÃO_ENCONTRADO',
        message: `Certificado não encontrado em ${certPath}. Verifique se o disco está montado e o nome está correto.`,
        data: {
          searchedPath: certPath,
          searchedName: certName
        }
      });
    }
  } catch (err) {
    return res.json({
      success: false,
      error: 'Erro ao acessar o diretório do certificado',
      detail: err.message
    });
  }
});

router.get('/config', (req, res) => {
  res.json({
    success: true,
    data: {
      cnpj: '63.073.948/0001-97',
      ambiente: process.env.FOCUSNFE_ENV || 'homologacao',
      token_ativo: !!process.env.FOCUSNFE_TOKEN,
      regime: 'mei' // Pode ser movido para .env futuramente
    }
  });
});

export default router;
