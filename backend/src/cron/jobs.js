import config from '../config/index.js';
import { CustomerModel } from '../models/Customer.js';
import { TemplateModel } from '../models/Template.js';
import { MessageLogModel } from '../models/MessageLog.js';
import { SettingsModel } from '../models/WhatsApp.js';
import whatsappService from '../services/whatsappService.js';
import { interpolateTemplate } from '../services/messageService.js';

const getSalonName = async () => {
  return SettingsModel.getString('salon_name', config.salonName);
};

const shouldSkipCustomer = async (customer, type) => {
  if (type === 'birthday' || type === 'anniversary') {
    return MessageLogModel.wasSentToday(customer.id, type);
  }
  if (type === 'follow_up') {
    return MessageLogModel.wasSentWithinDays(customer.id, type, 30);
  }
  if (type === 'monthly_offer') {
    return MessageLogModel.wasSentWithinDays(customer.id, type, 28);
  }
  return false;
};

const sendBulkMessages = async (customers, type) => {
  const template = await TemplateModel.findActiveByType(type);
  if (!template) {
    console.log(`[Cron] No active template for type: ${type}`);
    return { sent: 0, failed: 0, skipped: 0 };
  }

  const salonName = await getSalonName();
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const customer of customers) {
    if (await shouldSkipCustomer(customer, type)) {
      skipped++;
      continue;
    }

    const message = interpolateTemplate(template.content, customer, salonName);

    try {
      if (whatsappService.getStatus().isConnected) {
        await whatsappService.sendMessage(customer.phone, message);
        await MessageLogModel.create({
          customer_id: customer.id,
          template_id: template.id,
          phone: customer.phone,
          message,
          type,
          status: 'sent',
        });
        sent++;
      } else {
        await MessageLogModel.create({
          customer_id: customer.id,
          template_id: template.id,
          phone: customer.phone,
          message,
          type,
          status: 'failed',
          error_message: 'WhatsApp not connected',
        });
        failed++;
      }

      await new Promise((r) => setTimeout(r, 3000));
    } catch (err) {
      await MessageLogModel.create({
        customer_id: customer.id,
        template_id: template.id,
        phone: customer.phone,
        message,
        type,
        status: 'failed',
        error_message: err.message,
      });
      failed++;
    }
  }

  return { sent, failed, skipped };
};

export const CronJobs = {
  async sendBirthdayMessages() {
    console.log('[Cron] Running birthday messages...');
    const customers = await CustomerModel.findBirthdaysToday();
    console.log(`[Cron] Found ${customers.length} birthday customers`);
    return sendBulkMessages(customers, 'birthday');
  },

  async sendAnniversaryMessages() {
    console.log('[Cron] Running anniversary messages...');
    const customers = await CustomerModel.findAnniversariesToday();
    console.log(`[Cron] Found ${customers.length} anniversary customers`);
    return sendBulkMessages(customers, 'anniversary');
  },

  async sendMonthlyOffers() {
    console.log('[Cron] Running monthly offer messages...');
    const customers = await CustomerModel.findAllActive();
    console.log(`[Cron] Sending monthly offers to ${customers.length} customers`);
    return sendBulkMessages(customers, 'monthly_offer');
  },

  async sendFollowUpMessages() {
    console.log('[Cron] Running follow-up messages...');
    const customers = await CustomerModel.findFollowUpDue();
    console.log(`[Cron] Found ${customers.length} follow-up customers`);
    return sendBulkMessages(customers, 'follow_up');
  },
};
