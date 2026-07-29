import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { AdminModel } from '../models/Admin.js';
import { AppError } from '../middleware/errorHandler.js';

export const AuthService = {
  async login(email, password) {
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPassword = password?.trim();

    let admin = null;

    try {
      admin = await AdminModel.findByEmail(normalizedEmail);
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 401) {
        throw error;
      }

      console.warn('[Auth] Database lookup failed, using fallback admin credentials:', error.message);
    }

    if (admin) {
      const isValid = await bcrypt.compare(normalizedPassword, admin.password_hash);
      if (!isValid) {
        throw new AppError('Invalid email or password', 401);
      }

      const token = jwt.sign(
        { id: admin.id, email: admin.email, name: admin.name },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      return {
        token,
        admin: { id: admin.id, email: admin.email, name: admin.name },
      };
    }

    if (
      normalizedEmail === config.admin.email?.trim().toLowerCase() &&
      normalizedPassword === config.admin.password
    ) {
      const token = jwt.sign(
        { id: 'fallback-admin', email: config.admin.email, name: config.admin.name },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      return {
        token,
        admin: { id: 'fallback-admin', email: config.admin.email, name: config.admin.name },
      };
    }

    throw new AppError('Invalid email or password', 401);
  },

  async getProfile(adminId) {
    return AdminModel.findById(adminId);
  },

  async hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
};
