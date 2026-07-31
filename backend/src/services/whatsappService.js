import pkg from 'whatsapp-web.js';
import puppeteer from 'puppeteer';
const { Client, LocalAuth, MessageMedia } = pkg;
import qrcode from 'qrcode';
import path from 'path';
import fs from 'fs';
import config from '../config/index.js';
import { WhatsAppModel } from '../models/WhatsApp.js';
import { formatPhoneForWhatsApp, normalizePhone } from './messageService.js';

class WhatsAppService {
  constructor() {
    this.client = null;
    this.qrCode = null;
    this.status = 'disconnected';
    this.phoneNumber = null;
<<<<<<< HEAD
    this.lastError = null;
=======
>>>>>>> 75e7d2a66dc350efffe7473c31fa2bdf270a3f0c
    this.initializing = false;
    this.shouldReconnect = false;
    this.reconnectTimer = null;
  }

  getStatus() {
    return {
      status: this.status,
      qrCode: this.qrCode,
      phoneNumber: this.phoneNumber,
      isConnected: this.status === 'connected',
<<<<<<< HEAD
      error: this.lastError,
=======
>>>>>>> 75e7d2a66dc350efffe7473c31fa2bdf270a3f0c
    };
  }

  clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  scheduleReconnect(reason = 'unknown') {
    if (!this.shouldReconnect || this.reconnectTimer) return;

    const delay = config.whatsappReconnectDelayMs;
    console.log(`[WhatsApp] Reconnect scheduled in ${delay}ms (${reason})`);

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;

      try {
        await this.initialize();
      } catch (err) {
        console.error('[WhatsApp] Reconnect attempt failed:', err.message);
        this.scheduleReconnect('retry_failed');
      }
    }, delay);
  }

  async initialize() {
    if (this.client && this.status === 'connected') return;
    if (this.initializing) return;
    this.shouldReconnect = true;
    this.clearReconnectTimer();

    if (this.client) {
      try {
        await this.client.destroy();
      } catch {
        /* ignore */
      }
      this.client = null;
    }

    this.initializing = true;
    this.status = 'initializing';
<<<<<<< HEAD
    this.lastError = null;
=======
>>>>>>> 75e7d2a66dc350efffe7473c31fa2bdf270a3f0c

    const sessionPath = path.resolve(config.whatsappSessionPath);
    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true });
    }

    const puppeteerOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
<<<<<<< HEAD
=======
        '--single-process',
>>>>>>> 75e7d2a66dc350efffe7473c31fa2bdf270a3f0c
      ],
    };

    let executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    if (!executablePath) {
      try {
        executablePath = puppeteer.executablePath();
      } catch {
        executablePath = undefined;
      }
    }

<<<<<<< HEAD
    if (executablePath && fs.existsSync(executablePath)) {
=======
    if (executablePath) {
>>>>>>> 75e7d2a66dc350efffe7473c31fa2bdf270a3f0c
      puppeteerOptions.executablePath = executablePath;
    }

    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: sessionPath,
        clientId: 'salon-crm',
      }),
      puppeteer: puppeteerOptions,
    });

    this.client.on('qr', async (qr) => {
<<<<<<< HEAD
      try {
        this.qrCode = await qrcode.toDataURL(qr);
        this.status = 'qr_ready';
        this.initializing = false;
        this.lastError = null;
      } catch (err) {
        this.lastError = (err && err.message) || String(err);
        this.status = 'error';
        this.initializing = false;
        return;
      }

      try {
        await WhatsAppModel.updateSession({
          is_connected: false,
          session_data: { status: 'qr_ready' },
        });
      } catch (err) {
        console.warn('[WhatsApp] Failed to persist QR-ready session:', err.message);
      }
=======
      this.qrCode = await qrcode.toDataURL(qr);
      this.status = 'qr_ready';
      await WhatsAppModel.updateSession({
        is_connected: false,
        session_data: { status: 'qr_ready' },
      });
>>>>>>> 75e7d2a66dc350efffe7473c31fa2bdf270a3f0c
    });

    this.client.on('authenticated', () => {
      this.status = 'authenticated';
      this.qrCode = null;
<<<<<<< HEAD
      this.initializing = false;
      this.lastError = null;
=======
>>>>>>> 75e7d2a66dc350efffe7473c31fa2bdf270a3f0c
    });

    this.client.on('ready', async () => {
      this.status = 'connected';
      this.qrCode = null;
      this.initializing = false;
      this.clearReconnectTimer();
<<<<<<< HEAD
      this.lastError = null;
=======
>>>>>>> 75e7d2a66dc350efffe7473c31fa2bdf270a3f0c

      const info = this.client.info;
      this.phoneNumber = info?.wid?.user || null;

<<<<<<< HEAD
      try {
        await WhatsAppModel.updateSession({
          is_connected: true,
          phone_number: this.phoneNumber,
          last_connected_at: new Date().toISOString(),
          session_data: { status: 'connected', phone: this.phoneNumber },
        });
      } catch (err) {
        console.warn('[WhatsApp] Failed to persist connected session:', err.message);
      }
=======
      await WhatsAppModel.updateSession({
        is_connected: true,
        phone_number: this.phoneNumber,
        last_connected_at: new Date().toISOString(),
        session_data: { status: 'connected', phone: this.phoneNumber },
      });
>>>>>>> 75e7d2a66dc350efffe7473c31fa2bdf270a3f0c

      console.log('[WhatsApp] Client ready:', this.phoneNumber);
    });

    this.client.on('disconnected', async (reason) => {
      console.log('[WhatsApp] Disconnected:', reason);
      this.status = 'disconnected';
      this.qrCode = null;
      this.phoneNumber = null;
      this.client = null;
      this.initializing = false;
<<<<<<< HEAD
      this.lastError = null;

      try {
        await WhatsAppModel.updateSession({
          is_connected: false,
          phone_number: null,
          session_data: { status: 'disconnected', reason },
        });
      } catch (err) {
        console.warn('[WhatsApp] Failed to persist disconnected session:', err.message);
      }
=======

      await WhatsAppModel.updateSession({
        is_connected: false,
        phone_number: null,
        session_data: { status: 'disconnected', reason },
      });
>>>>>>> 75e7d2a66dc350efffe7473c31fa2bdf270a3f0c

      this.scheduleReconnect(reason);
    });

    this.client.on('auth_failure', async (msg) => {
      console.error('[WhatsApp] Auth failure:', msg);
      this.status = 'auth_failure';
      this.qrCode = null;
      this.phoneNumber = null;
      this.initializing = false;
<<<<<<< HEAD
      this.lastError = msg || null;
=======
>>>>>>> 75e7d2a66dc350efffe7473c31fa2bdf270a3f0c
      if (this.client) {
        try {
          await this.client.destroy();
        } catch {
          /* ignore */
        }
      }
      this.client = null;

<<<<<<< HEAD
      try {
        await WhatsAppModel.updateSession({
          is_connected: false,
          phone_number: null,
          session_data: { status: 'auth_failure', reason: msg },
        });
      } catch (err) {
        console.warn('[WhatsApp] Failed to persist auth-failure session:', err.message);
      }
=======
      await WhatsAppModel.updateSession({
        is_connected: false,
        phone_number: null,
        session_data: { status: 'auth_failure', reason: msg },
      });
>>>>>>> 75e7d2a66dc350efffe7473c31fa2bdf270a3f0c

      this.scheduleReconnect('auth_failure');
    });

    try {
      await this.client.initialize();
    } catch (err) {
      console.error('[WhatsApp] Init error:', err.message);
      this.status = 'error';
      this.initializing = false;
<<<<<<< HEAD
      this.lastError = err.message;
      this.client = null;
      try {
        await WhatsAppModel.updateSession({
          is_connected: false,
          phone_number: null,
          session_data: { status: 'error', reason: err.message },
        });
      } catch (dbErr) {
        console.warn('[WhatsApp] Failed to persist init-error session:', dbErr.message);
      }
=======
      this.client = null;
      await WhatsAppModel.updateSession({
        is_connected: false,
        phone_number: null,
        session_data: { status: 'error', reason: err.message },
      });
>>>>>>> 75e7d2a66dc350efffe7473c31fa2bdf270a3f0c
      this.scheduleReconnect('initialize_error');
    }
  }

  async sendMessage(phone, message) {
    if (!this.client || this.status !== 'connected') {
      throw new Error('WhatsApp is not connected');
    }

    const normalized = normalizePhone(phone);

    let chatId = null;
    try {
      const resolved = await this.client.getNumberId(normalized);
      if (resolved && resolved._serialized) {
        chatId = resolved._serialized;
      }
    } catch (err) {
      console.warn('[WhatsApp] getNumberId lookup failed for', normalized, ':', err.message);
    }

    if (!chatId) {
      chatId = formatPhoneForWhatsApp(phone);
    }

    try {
      const result = await this.client.sendMessage(chatId, message);
      return result;
    } catch (err) {
      const msg = (err && err.message) || String(err);
      if (msg.includes('not a valid') || msg.includes('not exist') || msg.includes('404') || msg.includes('Wid') || msg.includes('unregistered')) {
        throw new Error(`Phone number +${normalized} is not registered on WhatsApp. Ask customer to install WhatsApp first.`);
      }
      throw err;
    }
  }

  async logout() {
    this.shouldReconnect = false;
    this.clearReconnectTimer();

    if (this.client) {
      try {
        await this.client.logout();
        await this.client.destroy();
      } catch (err) {
        console.error('[WhatsApp] Logout error:', err.message);
      }
    }

    this.client = null;
    this.status = 'disconnected';
    this.qrCode = null;
    this.phoneNumber = null;
    this.initializing = false;

    await WhatsAppModel.updateSession({
      is_connected: false,
      phone_number: null,
      session_data: { status: 'logged_out' },
    });
  }

  async restart() {
    await this.logout();
    this.shouldReconnect = true;
    await this.initialize();
  }
}

const whatsappService = new WhatsAppService();
export default whatsappService;
