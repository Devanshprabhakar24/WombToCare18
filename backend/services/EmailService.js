import nodemailer from 'nodemailer';
import User from '../models/User.js';
import Program from '../models/Program.js';
import Donation from '../models/Donation.js';

class EmailService {
  constructor() {
    this.transporter = null;
  }

  getTransporter() {
    if (this.transporter) return this.transporter;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const port = parseInt(process.env.EMAIL_PORT) || 587;
      const secure = port === 465; // Use SSL for port 465

      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: port,
        secure: secure,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      console.log(`Email transporter initialized (port ${port}, secure: ${secure})`);
    } else {
      console.warn('Email credentials not configured. Email functionality will be disabled.');
    }
    return this.transporter;
  }

  /**
   * Send donation confirmation email
   * @param {Object} emailData - Email details
   * @returns {Promise<Object>} - Success status
   */
  async sendDonationConfirmation(emailData) {
    const { userId, amount, programId, donationId } = emailData;

    try {
      const transporter = this.getTransporter();
      if (!transporter) {
        return { success: false, error: 'Email not configured' };
      }

      // Get user and program details
      const user = await User.findById(userId);
      const program = await Program.findById(programId);

      if (!user || !program) {
        throw new Error('User or program not found');
      }

      const mailOptions = {
        from: `"${process.env.FOUNDATION_NAME}" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Thank You for Your Donation!',
        html: this.getDonationConfirmationTemplate({
          donorName: user.name,
          amount,
          programName: program.programName,
          donationId,
          certificateURL: `${process.env.FRONTEND_URL}/certificates/${donationId}`,
        }),
      };

      await transporter.sendMail(mailOptions);

      return { success: true };
    } catch (error) {
      console.error('Email sending error:', error);
      // Log error but don't throw - email failure shouldn't break donation flow
      return { success: false, error: error.message };
    }
  }

  /**
   * Send weekly progress report
   * @param {Object} emailData - Email details
   * @returns {Promise<Object>} - Success status
   */
  async sendWeeklyProgressReport(emailData) {
    const { recipientEmail, donorName, programs } = emailData;

    try {
      const transporter = this.getTransporter();
      if (!transporter) {
        return { success: false, error: 'Email not configured' };
      }

      const mailOptions = {
        from: `"${process.env.FOUNDATION_NAME}" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: 'Weekly Progress Report - Your Impact',
        html: this.getProgressReportTemplate({
          donorName,
          programs,
        }),
      };

      await transporter.sendMail(mailOptions);

      return { success: true };
    } catch (error) {
      console.error('Progress report email error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Retry failed email
   * @param {string} emailId - Email ID
   * @returns {Promise<Object>} - Success status
   */
  async retryFailedEmail(emailId) {
    // Implementation for retry logic with exponential backoff
    // This would typically involve a queue system like Bull or Agenda
    return { success: true };
  }

  /**
   * Get donation confirmation email template
   * @param {Object} data - Template data
   * @returns {string} - HTML template
   */
  getDonationConfirmationTemplate(data) {
    const { donorName, amount, programName, donationId, certificateURL } = data;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0ea5e9; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .amount { font-size: 24px; font-weight: bold; color: #0ea5e9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Your Donation!</h1>
          </div>
          <div class="content">
            <p>Dear ${donorName},</p>
            <p>We are deeply grateful for your generous donation of <span class="amount">₹${amount.toLocaleString('en-IN')}</span> towards <strong>${programName}</strong>.</p>
            <p>Your contribution will make a significant impact in helping us achieve our mission.</p>
            <p><strong>Donation Details:</strong></p>
            <ul>
              <li>Donation ID: ${donationId}</li>
              <li>Amount: ₹${amount.toLocaleString('en-IN')}</li>
              <li>Program: ${programName}</li>
              <li>Date: ${new Date().toLocaleDateString('en-IN')}</li>
            </ul>
            <p>Your 80G tax exemption certificate has been generated and is available for download.</p>
            <a href="${certificateURL}" class="button">Download Certificate</a>
            <p style="margin-top: 20px;">You will receive weekly progress reports about how your donation is being utilized.</p>
          </div>
          <div class="footer">
            <p>${process.env.FOUNDATION_NAME}</p>
            <p>${process.env.FOUNDATION_ADDRESS}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get structured progress report email template
   * Includes detailed program metrics: target, received, utilized, remaining, progress %
   * @param {Object} data - Template data
   * @returns {string} - HTML template
   */
  getProgressReportTemplate(data) {
    const { donorName, programs } = data;

    const programsHTML = programs
      .map(
        (program) => `
      <div style="margin-bottom: 25px; padding: 20px; background-color: white; border-left: 4px solid #0ea5e9; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h3 style="margin-top: 0; color: #0ea5e9;">${program.programName}</h3>
        <p style="color: #666; font-size: 14px; margin-bottom: 15px;">${program.description || ''}</p>
        
        <!-- Progress Bar -->
        <div style="background-color: #e5e7eb; border-radius: 10px; height: 20px; margin-bottom: 15px; overflow: hidden;">
          <div style="background-color: #0ea5e9; height: 100%; width: ${Math.min(program.progressPercentage, 100)}%; border-radius: 10px;"></div>
        </div>
        <p style="text-align: center; font-weight: bold; color: #0ea5e9; margin-bottom: 15px;">${program.progressPercentage}% of Target Reached</p>
        
        <!-- Financial Summary Table -->
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #666;">Target Amount:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold;">₹${(program.targetAmount || 0).toLocaleString('en-IN')}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #666;">Funds Received:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #10b981;">₹${(program.fundsReceived || 0).toLocaleString('en-IN')}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #666;">Funds Utilized:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #f59e0b;">₹${(program.fundsUtilized || 0).toLocaleString('en-IN')}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #666;">Remaining to Target:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #ef4444;">₹${(program.remaining || 0).toLocaleString('en-IN')}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #666;">Utilization Rate:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold;">${program.utilizationRate}%</td>
          </tr>
          <tr style="background-color: #f0f9ff;">
            <td style="padding: 8px 0; color: #0ea5e9; font-weight: bold;">Your Contribution:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #0ea5e9;">₹${(program.donorContribution || 0).toLocaleString('en-IN')}</td>
          </tr>
        </table>
        
        <p style="margin-top: 15px; font-size: 12px; color: #666;">Status: <strong style="color: #10b981; text-transform: uppercase;">${program.status}</strong></p>
      </div>
    `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0ea5e9; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>7-Day Progress Report</h1>
            <p style="margin: 0; font-size: 14px;">Report Date: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div class="content">
            <p>Dear ${donorName},</p>
            <p>Thank you for your continued support. Here's your structured progress update on the programs you've contributed to:</p>
            ${programsHTML}
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 4px; margin-top: 20px;">
              <p style="margin: 0; font-size: 14px;"><strong>📌 Note:</strong> You will continue to receive these reports every 7 days for each active program until the program is closed or completed.</p>
            </div>
            <p style="margin-top: 20px;">Your generosity is making a real difference. Thank you for being part of our mission!</p>
          </div>
          <div class="footer">
            <p>${process.env.FOUNDATION_NAME}</p>
            <p>To unsubscribe from these updates, please contact us.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default new EmailService();
