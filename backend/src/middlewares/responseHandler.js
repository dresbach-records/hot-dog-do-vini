/**
 * Middleware para padronizar todas as respostas da API
 * Formato: { success: boolean, data: any, error: string | null }
 */
export const responseHandler = (req, res, next) => {
  res.success = (data, status = 200) => {
    return res.status(status).json({
      success: true,
      data,
      error: null
    });
  };

  res.error = (message, status = 500, details = null) => {
    return res.status(status).json({
      success: false,
      data: details,
      error: message
    });
  };

  next();
};
