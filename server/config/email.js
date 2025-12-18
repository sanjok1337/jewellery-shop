const nodemailer = require('nodemailer');

// Налаштування транспорту для надсилання email
// Для розробки використовуємо Ethereal (тестовий сервіс)
// Для продакшн - замініть на справжній SMTP (Gmail, SendGrid, etc.)

let transporter;

const createTransporter = async () => {
  // Для розробки - використовуємо Ethereal (безкоштовний тестовий сервіс)
  if (process.env.NODE_ENV !== 'production') {
    // Створюємо тестовий акаунт Ethereal
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    console.log('📧 Email transporter created (Ethereal test mode)');
    console.log('📧 Test account:', testAccount.user);
    return transporter;
  }
  
  // Для продакшн - використовуйте справжній SMTP
  // Приклад для Gmail:
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS, // Для Gmail - App Password
    },
  });
  
  console.log('📧 Email transporter created (Production mode)');
  return transporter;
};

// Ініціалізуємо транспортер
const getTransporter = async () => {
  if (!transporter) {
    await createTransporter();
  }
  return transporter;
};

// Функція для надсилання email з кодом верифікації
const sendVerificationEmail = async (to, code) => {
  const transport = await getTransporter();
  
  const mailOptions = {
    from: '"Aurum Jewellery" <noreply@aurum.com>',
    to: to,
    subject: '🔐 Код підтвердження - Aurum Jewellery',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #C6A052 0%, #8B7034 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; text-align: center; }
          .code-box { background: linear-gradient(135deg, #FFF8E7 0%, #F5ECD7 100%); border: 2px solid #C6A052; border-radius: 12px; padding: 25px; margin: 25px 0; }
          .code { font-size: 36px; font-weight: bold; color: #8B7034; letter-spacing: 8px; font-family: monospace; }
          .message { color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px; }
          .warning { color: #999; font-size: 13px; margin-top: 20px; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ Aurum Jewellery</h1>
          </div>
          <div class="content">
            <p class="message">Вітаємо! Ви отримали цей лист, тому що реєструєтесь на нашому сайті.</p>
            <p class="message">Ваш код підтвердження:</p>
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            <p class="warning">⏱️ Код дійсний протягом 10 хвилин.<br>Якщо ви не реєструвались - просто проігноруйте цей лист.</p>
          </div>
          <div class="footer">
            © 2024 Aurum Jewellery. Всі права захищені.
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Ваш код підтвердження: ${code}. Код дійсний 10 хвилин.`,
  };
  
  try {
    const info = await transport.sendMail(mailOptions);
    console.log('📧 Email sent:', info.messageId);
    
    // Для тестового режиму виводимо URL для перегляду листа
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) };
  } catch (error) {
    console.error('📧 Error sending email:', error);
    throw error;
  }
};

module.exports = {
  getTransporter,
  sendVerificationEmail,
};
