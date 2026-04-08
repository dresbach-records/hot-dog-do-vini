import { authService } from './auth.service.js';

export const authController = {
  async register(req, res) {
    try {
      const { email, password, role } = req.body;
      const user = await authService.register({ email, password, role });
      res.status(201).json({ success: true, data: user });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(401).json({ success: false, error: err.message });
    }
  },

  async me(req, res) {
    res.json({ success: true, user: req.user });
  }
};
