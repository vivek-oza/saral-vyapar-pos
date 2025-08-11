const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    const service = process.env.EMAIL_SERVICE || "gmail";
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_APP_PASSWORD;
    if (!user || !pass) {
      console.warn(
        "⚠️ Email credentials missing: EMAIL_USER/EMAIL_APP_PASSWORD not set. Emails will fail."
      );
    }
    this.transporter = nodemailer.createTransport({
      service,
      auth: { user, pass },
    });
    this.transporter.verify((error, success) => {
      if (error) {
        console.warn("⚠️ Nodemailer transporter verify failed:", error.message);
      } else {
        console.log("📨 Email transporter ready:", service);
      }
    });
  }

  async sendVerificationEmail(email, verificationToken, firstName = "") {
    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: `"Saral Vyapar POS" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email - Saral Vyapar POS",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Saral Vyapar POS</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to Saral Vyapar POS! 🎉</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hi ${firstName || "there"},<br><br>
              Thank you for signing up! To complete your registration and start using our POS system, 
              please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; 
                        border-radius: 5px; display: inline-block; font-weight: bold;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="background: #e9ecef; padding: 15px; border-radius: 5px; word-break: break-all;">
              <a href="${verificationUrl}" style="color: #667eea;">${verificationUrl}</a>
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-top: 30px;">
              This link will expire in 24 hours for security reasons.<br><br>
              If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2024 Saral Vyapar POS. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Verification email sent to ${email}`);
      return true;
    } catch (error) {
      console.error("❌ Error sending verification email:", error);
      return false;
    }
  }

  async sendOTPEmail(email, otpCode, firstName = "") {
    const mailOptions = {
      from: `"Saral Vyapar POS" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code - Saral Vyapar POS",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Saral Vyapar POS</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Your Verification Code 🔐</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hi ${firstName || "there"},<br><br>
              Thank you for signing up! Use the following OTP code to verify your email address:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #667eea; color: white; padding: 20px; border-radius: 10px; 
                          font-size: 32px; font-weight: bold; letter-spacing: 8px; display: inline-block;">
                ${otpCode}
              </div>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This OTP is valid for <strong>10 minutes</strong> only. Please do not share this code with anyone.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-top: 30px;">
              If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2024 Saral Vyapar POS. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ OTP email sent to ${email}`);
      return true;
    } catch (error) {
      console.error("❌ Error sending OTP email:", error);
      return false;
    }
  }

  async sendPasswordResetOTP(email, otpCode, firstName = "") {
    const mailOptions = {
      from: `"Saral Vyapar POS" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP - Saral Vyapar POS",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Saral Vyapar POS</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset Code 🔐</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hi ${firstName || "there"},<br><br>
              We received a request to reset your password. Use the following OTP code to proceed with resetting your password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #667eea; color: white; padding: 20px; border-radius: 10px; 
                          font-size: 32px; font-weight: bold; letter-spacing: 8px; display: inline-block;">
                ${otpCode}
              </div>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This OTP is valid for <strong>10 minutes</strong> only. Please do not share this code with anyone.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-top: 30px;">
              If you didn't request a password reset, you can safely ignore this email.
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2024 Saral Vyapar POS. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Password reset OTP email sent to ${email}`);
      return true;
    } catch (error) {
      console.error("❌ Error sending password reset OTP email:", error);
      return false;
    }
  }

  async sendPasswordResetEmail(email, resetToken, firstName = "") {
    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"Saral Vyapar POS" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password - Saral Vyapar POS",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Saral Vyapar POS</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request 🔐</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hi ${firstName || "there"},<br><br>
              We received a request to reset your password. Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; 
                        border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="background: #e9ecef; padding: 15px; border-radius: 5px; word-break: break-all;">
              <a href="${resetUrl}" style="color: #667eea;">${resetUrl}</a>
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-top: 30px;">
              This link will expire in 24 hours for security reasons.<br><br>
              If you didn't request a password reset, you can safely ignore this email.
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2024 Saral Vyapar POS. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      console.error("❌ Error sending password reset email:", error);
      return false;
    }
  }

  async sendWelcomeEmail(email, firstName, shopName) {
    const mailOptions = {
      from: `"Saral Vyapar POS" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Saral Vyapar POS! 🚀",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Saral Vyapar POS</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome aboard! 🎉</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hi ${firstName || "there"},<br><br>
              Congratulations! Your account has been successfully created and verified. 
              Your shop <strong>${shopName}</strong> is now ready to use our POS system.
            </p>
            
            <div style="background: #e8f5e8; border: 1px solid #4caf50; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #2e7d32; margin-top: 0;">What's Next?</h3>
              <ul style="color: #2e7d32; line-height: 1.6;">
                <li>Complete your shop profile</li>
                <li>Add your products and inventory</li>
                <li>Set up payment methods</li>
                <li>Start managing your sales</li>
              </ul>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-top: 30px;">
              If you have any questions or need assistance, don't hesitate to reach out to our support team.
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2024 Saral Vyapar POS. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to ${email}`);
      return true;
    } catch (error) {
      console.error("❌ Error sending welcome email:", error);
      return false;
    }
  }
}

module.exports = new EmailService();
