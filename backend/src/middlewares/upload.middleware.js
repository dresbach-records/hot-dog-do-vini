import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

// Configuração de Armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Caminho relativo ao root do backend
    cb(null, 'uploads/comprovantes');
  },
  filename: (req, file, cb) => {
    // Ex: comprovante-df23-4455.png
    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Filtro de Arquivos (Apenas Imagens)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Formato inválido. Envie apenas imagens (JPG, PNG).'), false);
  }
};

export const uploadComprovante = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite 5MB
});
