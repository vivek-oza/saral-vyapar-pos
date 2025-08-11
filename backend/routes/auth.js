const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { runQuery, getQuery, supabase } = require("../config/database");
const emailService = require("../services/emailService");
const { auth } = require("../middleware/auth");
const {
  validateSignup,
  validateLogin,
  validatePasswordReset,
  validateEmailVerification,
} = require("../middleware/validation");

const router = express.Router();

// Helpers
const normalizeEmail = (email) => (email || "").trim().toLowerCase();
const findUserByEmailInsensitive = async (email, select = "*") => {
  const normalized = normalizeEmail(email);
  const { data, error } = await supabase
    .from("users")
    .select(select)
    .ilike("email", normalized)
    .limit(1);
  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Generate OTP code
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// User registration
router.post("/signup", validateSignup, async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    // Check if user already exists
    const existingUser = await findUserByEmailInsensitive(
      normalizedEmail,
      "id"
    );
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate OTP
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    console.log(
      "🔑 [Signup] Generated OTP:",
      otpCode,
      "Expires at:",
      otpExpiresAt.toISOString(),
      "for",
      normalizedEmail
    );

    // Create user
    const result = await runQuery("users", "insert", {
      email: normalizedEmail,
      password_hash: passwordHash,
      otp_code: otpCode,
      otp_expires_at: otpExpiresAt.toISOString(),
      otp_attempts: 0,
    });
    console.log(
      "✅ [Signup] User inserted with ID:",
      result.id,
      "Email:",
      normalizedEmail
    );

    // Send OTP email
    const emailSent = await emailService.sendOTPEmail(normalizedEmail, otpCode);
    if (!emailSent) {
      console.warn(
        "⚠️ [Signup] Failed to send OTP email via transporter for",
        normalizedEmail
      );
    }

    if (!emailSent) {
      // If email fails, we should still create the user but log the issue
      console.warn(
        `⚠️ Failed to send verification email to ${email}, but user created successfully`
      );
    }

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email for the OTP code.",
      userId: result.id,
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to create user account" });
  }
});

// User login
router.post("/login", validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    // Get user
    const user = await findUserByEmailInsensitive(
      normalizedEmail,
      "id, email, password_hash, email_verified"
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json({
        error:
          "Email not verified. Please check your email and verify your account first.",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user.id);

    // Get user profile and shop info
    const profile = await getQuery("user_profiles", { user_id: user.id });
    const shop = await getQuery("shops", { user_id: user.id });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        profile: profile || null,
        shop: shop || null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to authenticate user" });
  }
});

// OTP verification
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    // Find user with this email
    const user = await findUserByEmailInsensitive(
      normalizedEmail,
      "id, email, email_verified, otp_code, otp_expires_at, otp_attempts"
    );
    console.log(
      "🔍 [Verify-OTP] Lookup for",
      normalizedEmail,
      "->",
      user ? `found user ${user.id}` : "no user"
    );

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.email_verified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    // Check if OTP has expired
    if (new Date() > new Date(user.otp_expires_at)) {
      return res
        .status(400)
        .json({ error: "OTP has expired. Please request a new one." });
    }

    // Check attempts limit
    if (user.otp_attempts >= 5) {
      return res
        .status(400)
        .json({ error: "Too many failed attempts. Please request a new OTP." });
    }

    // Verify OTP
    if (user.otp_code !== otp) {
      console.log(
        "❌ [Verify-OTP] Provided OTP mismatch. Provided:",
        otp,
        "Stored:",
        user.otp_code
      );
      // Increment attempts
      await runQuery(
        "users",
        "update",
        { otp_attempts: user.otp_attempts + 1 },
        { id: user.id }
      );
      return res.status(400).json({ error: "Invalid OTP code" });
    }

    // Verify email and clear OTP
    await runQuery(
      "users",
      "update",
      {
        email_verified: true,
        otp_code: null,
        otp_expires_at: null,
        otp_attempts: 0,
      },
      { id: user.id }
    );

    res.json({
      success: true,
      message:
        "Email verified successfully. You can now login to your account.",
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});

// Resend OTP
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user exists and needs verification
    const user = await findUserByEmailInsensitive(
      normalizedEmail,
      "id, email_verified"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.email_verified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    // Generate new OTP
    const newOTP = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await runQuery(
      "users",
      "update",
      {
        otp_code: newOTP,
        otp_expires_at: otpExpiresAt.toISOString(),
        otp_attempts: 0,
      },
      { id: user.id }
    );

    // Send new OTP email
    const emailSent = await emailService.sendOTPEmail(normalizedEmail, newOTP);

    if (emailSent) {
      res.json({
        success: true,
        message: "New OTP sent successfully. Please check your inbox.",
      });
    } else {
      res
        .status(500)
        .json({ error: "Failed to send OTP. Please try again later." });
    }
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ error: "Failed to resend OTP" });
  }
});

// Forgot password - OTP based
// -- changed by cursor --
// router.post('/forgot-password', async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ error: 'Email is required' });
//     }

//     // Check if user exists and is verified
//     const user = await getQuery('users', { email }, 'id, email_verified');
//     if (!user || !user.email_verified) {
//       // Don't reveal if user exists or not for security
//       return res.json({
//         success: true,
//         message: 'If an account with this email exists, a password reset OTP has been sent.'
//       });
//     }

//     // Generate reset OTP
//     const resetOTP = generateOTP();
//     const expirationDate = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
//     const expirationTimestamp = expirationDate.getTime(); // Get timestamp in milliseconds // 5 minutes from now, in ISO format
//     const expirationISOString = expirationDate.toISOString(); // For storing in the database

//     const resetOTPExpires = new Date(expirationTimestamp);
//     console.log('🔑 Generated OTP:', resetOTP, 'Expires at:', resetOTPExpires.toISOString());
//     console.log('⏰ Current time:', new Date().toISOString());
//     console.log('📊 Expiration timestamp (ms):', expirationTimestamp);

//     // Save reset OTP - with fallback for missing columns
//     try {
//       await runQuery('users', 'update',
//         {
//           reset_otp: resetOTP,
//           reset_otp_expires: expirationTimestamp.toString(), // Store as timestamp string
//           reset_otp_attempts: 0
//         },
//         { id: user.id }
//       );
//       console.log('✅ OTP saved successfully');
//     } catch (dbError) {
//       console.error('❌ Database update error (OTP columns may not exist):', dbError.message);

//       // Fallback: use existing reset_token field to store OTP temporarily
//       // This is a temporary solution until the database schema is updated
//       await runQuery('users', 'update',
//         {
//           reset_token: `OTP:${resetOTP}:${expirationTimestamp}`, // Include timestamp for fallback
//           reset_token_expires: resetOTPExpires.toISOString()
//         },
//         { id: user.id }
//       );
//       console.log('✅ Using fallback method - OTP stored in reset_token field');
//     }

//     // Send reset OTP email
//     const emailSent = await emailService.sendPasswordResetOTP(email, resetOTP);

//     if (emailSent) {
//       res.json({
//         success: true,
//         message: 'If an account with this email exists, a password reset OTP has been sent.'
//       });
//     } else {
//       res.status(500).json({ error: 'Failed to send password reset OTP. Please try again later.' });
//     }

//   } catch (error) {
//     console.error('Forgot password error:', error);
//     res.status(500).json({ error: 'Failed to process password reset request' });
//   }
// });

// ... above unchanged ...

// Forgot password - OTP based
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user exists (send same generic response if not found)
    const user = await findUserByEmailInsensitive(
      normalizedEmail,
      "id, email_verified"
    );
    if (!user) {
      console.log(
        "🔎 Forgot-password user lookup:",
        normalizedEmail,
        "found= false"
      );
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message:
          "If an account with this email exists, a password reset OTP has been sent.",
      });
    }
    console.log(
      "🔎 Forgot-password user lookup:",
      normalizedEmail,
      "found= true",
      "email_verified=",
      user.email_verified
    );

    // Generate reset OTP
    const resetOTP = generateOTP();
    const expirationDate = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    const expirationISOString = expirationDate.toISOString(); // UTC ISO-8601

    console.log(
      "🔑 [Forgot] OTP:",
      resetOTP,
      "Expires:",
      expirationISOString,
      "Email:",
      normalizedEmail
    );
    console.log("⏰ [Forgot] Now:", new Date().toISOString());

    // Save reset OTP in primary columns if available (and regardless of email_verified)
    let savedPrimary = false;
    try {
      await runQuery(
        "users",
        "update",
        {
          reset_otp: resetOTP,
          reset_otp_expires: expirationISOString, // store UTC ISO string
          reset_otp_attempts: 0,
        },
        { id: user.id }
      );
      savedPrimary = true;
      console.log("✅ [Forgot] OTP saved in reset_otp columns");
    } catch (dbError) {
      console.warn(
        "⚠️ [Forgot] Could not write reset_otp columns:",
        dbError.message
      );
    }

    // Always save fallback token for compatibility
    try {
      await runQuery(
        "users",
        "update",
        {
          reset_token: `OTP:${resetOTP}:${expirationDate.getTime()}`,
          reset_token_expires: expirationISOString,
        },
        { id: user.id }
      );
      console.log(
        savedPrimary
          ? "✅ [Forgot] Also stored OTP in reset_token"
          : "✅ [Forgot] Stored OTP in reset_token (fallback)"
      );
    } catch (fallbackError) {
      console.error(
        "❌ [Forgot] Failed to store OTP in reset_token:",
        fallbackError.message
      );
    }

    // Send reset OTP email
    const emailSent = await emailService.sendPasswordResetOTP(
      normalizedEmail,
      resetOTP
    );

    if (emailSent) {
      res.json({
        success: true,
        message:
          "If an account with this email exists, a password reset OTP has been sent.",
      });
    } else {
      res.status(500).json({
        error: "Failed to send password reset OTP. Please try again later.",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    // Surface error detail in dev to logs and as message for easier debugging
    res.status(500).json({ error: "Failed to process password reset request" });
  }
});

// Verify reset OTP
// router.post("/verify-reset-otp", async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     const normalizedEmail = normalizeEmail(email);

//     if (!email || !otp) {
//       return res.status(400).json({ error: "Email and OTP are required" });
//     }

//     // Find user with this email - try new columns first, fallback to old
//     let user;
//     try {
//       user = await findUserByEmailInsensitive(
//         normalizedEmail,
//         "id, email_verified, reset_otp, reset_otp_expires, reset_otp_attempts, reset_token, reset_token_expires"
//       );
//     } catch (error) {
//       // Fallback to old columns if new ones don't exist
//       user = await findUserByEmailInsensitive(
//         normalizedEmail,
//         "id, email_verified, reset_token, reset_token_expires"
//       );
//     }

//     if (!user || !user.email_verified) {
//       return res
//         .status(400)
//         .json({ error: "User not found or email not verified" });
//     }

//     let storedOTP,
//       expirationTimestamp,
//       otpAttempts = 0;

//     // Check if using new OTP columns or fallback method
//     if (
//       user.reset_otp !== undefined &&
//       user.reset_otp !== null &&
//       user.reset_otp !== ""
//     ) {
//       // New method - parse ISO string to timestamp
//       storedOTP = user.reset_otp;
//       expirationTimestamp = new Date(user.reset_otp_expires).getTime(); // parse ISO date
//       otpAttempts = user.reset_otp_attempts || 0;
//     } else if (user.reset_token && user.reset_token.startsWith("OTP:")) {
//       // Fallback method
//       const tokenParts = user.reset_token.split(":");
//       if (tokenParts.length >= 3) {
//         // Format: OTP:code:timestamp(ms)
//         storedOTP = tokenParts[1];
//         expirationTimestamp = parseInt(tokenParts[2], 10);
//       } else {
//         // Old format: OTP:code (use reset_token_expires)
//         storedOTP = user.reset_token.replace("OTP:", "");
//         expirationTimestamp = new Date(user.reset_token_expires).getTime();
//       }
//       otpAttempts = 0; // Can't track attempts in fallback mode
//     } else {
//       return res
//         .status(400)
//         .json({ error: "No valid OTP found. Please request a new one." });
//     }

//     // When verifying the OTP
//     const currentTimestamp = Date.now();
//     const timeDifference = (expirationTimestamp - currentTimestamp) / 1000 / 60; // minutes

//     // Check if OTP has expired
//     if (currentTimestamp > expirationTimestamp) {
//       return res
//         .status(400)
//         .json({ error: "OTP has expired. Please request a new one." });
//     }

//     // Check attempts limit (only if using new method)
//     if (user.reset_otp !== undefined && otpAttempts >= 5) {
//       return res
//         .status(400)
//         .json({ error: "Too many failed attempts. Please request a new OTP." });
//     }

//     // Verify OTP
//     if (storedOTP !== otp) {
//       if (user.reset_otp !== undefined) {
//         try {
//           await runQuery(
//             "users",
//             "update",
//             { reset_otp_attempts: otpAttempts + 1 },
//             { id: user.id }
//           );
//         } catch (error) {
//           console.log("Could not increment OTP attempts:", error.message);
//         }
//       }
//       return res.status(400).json({ error: "Invalid OTP code" });
//     }

//     // Generate temporary reset token for password change
//     const resetToken = crypto.randomBytes(32).toString("hex");
//     const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

//     // Clear OTP and set temporary token - handle both new and fallback methods
//     try {
//       if (user.reset_otp !== undefined) {
//         await runQuery(
//           "users",
//           "update",
//           {
//             reset_otp: null,
//             reset_otp_expires: null,
//             reset_otp_attempts: 0,
//             reset_token: resetToken,
//             reset_token_expires: resetTokenExpires.toISOString(),
//           },
//           { id: user.id }
//         );
//       } else {
//         await runQuery(
//           "users",
//           "update",
//           {
//             reset_token: resetToken,
//             reset_token_expires: resetTokenExpires.toISOString(),
//           },
//           { id: user.id }
//         );
//       }
//     } catch (error) {
//       await runQuery(
//         "users",
//         "update",
//         {
//           reset_token: resetToken,
//           reset_token_expires: resetTokenExpires.toISOString(),
//         },
//         { id: user.id }
//       );
//     }

//     res.json({
//       success: true,
//       message: "OTP verified successfully. You can now reset your password.",
//       resetToken: resetToken,
//     });
//   } catch (error) {
//     console.error("Verify reset OTP error:", error);
//     res.status(500).json({ error: "Failed to verify OTP" });
//   }
// });

// Verify reset OTP
router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    // Find user with this email - try new columns first, fallback to old
    let user;
    try {
      user = await findUserByEmailInsensitive(
        normalizedEmail,
        "id, email_verified, reset_otp, reset_otp_expires, reset_otp_attempts, reset_token, reset_token_expires"
      );
    } catch (error) {
      // Fallback to old columns if new ones don't exist
      user = await findUserByEmailInsensitive(
        normalizedEmail,
        "id, email_verified, reset_token, reset_token_expires"
      );
    }

    console.log("User data for OTP verification:", {
      email: normalizedEmail,
      hasResetOtp: user?.reset_otp !== undefined,
      resetOtp: user?.reset_otp,
      resetToken: user?.reset_token,
      otpExpires: user?.reset_otp_expires,
      tokenExpires: user?.reset_token_expires,
    });

    if (!user || !user.email_verified) {
      return res
        .status(400)
        .json({ error: "User not found or email not verified" });
    }

    // let storedOTP, otpExpires, otpAttempts = 0;

    let storedOTP,
      expirationTimestamp,
      otpAttempts = 0;

    // Check if using new OTP columns or fallback method
    if (
      user.reset_otp !== undefined &&
      user.reset_otp !== null &&
      user.reset_otp !== ""
    ) {
      // New method - parse timestamp directly
      console.log("Using new OTP method");
      storedOTP = user.reset_otp;
      // reset_otp_expires is ISO string in our implementation
      expirationTimestamp = new Date(user.reset_otp_expires).getTime();
      otpAttempts = user.reset_otp_attempts || 0;
      console.log(
        "📊 Raw expiration from DB:",
        user.reset_otp_expires,
        "Parsed as:",
        expirationTimestamp
      );
    } else if (user.reset_token && user.reset_token.startsWith("OTP:")) {
      // Fallback method
      console.log("Using fallback OTP method");
      const tokenParts = user.reset_token.split(":");
      if (tokenParts.length >= 3) {
        // Format: OTP:code:timestamp
        storedOTP = tokenParts[1];
        expirationTimestamp = parseInt(tokenParts[2]);
        console.log(
          "📊 Fallback expiration from token:",
          tokenParts[2],
          "Parsed as:",
          expirationTimestamp
        );
      } else {
        // Old format: OTP:code (use reset_token_expires)
        storedOTP = user.reset_token.replace("OTP:", "");
        expirationTimestamp = new Date(user.reset_token_expires).getTime();
        console.log(
          "📊 Fallback expiration from expires field:",
          user.reset_token_expires,
          "Parsed as:",
          expirationTimestamp
        );
      }
      otpAttempts = 0; // Can't track attempts in fallback mode
    } else {
      console.log("No valid OTP found:", {
        reset_otp: user.reset_otp,
        reset_token: user.reset_token,
      });
      return res
        .status(400)
        .json({ error: "No valid OTP found. Please request a new one." });
    }

    // When verifying the OTP
    const currentDate = new Date();
    const currentTimestamp = currentDate.getTime();
    const currentISOString = currentDate.toISOString();

    const timeDifference = (expirationTimestamp - currentTimestamp) / 1000 / 60; // minutes

    console.log("🔍 OTP verification details:", {
      storedOTP,
      providedOTP: otp,
      expirationTimestamp,
      currentTimestamp,
      expirationDate: new Date(expirationTimestamp).toISOString(),
      currentDate: new Date(currentTimestamp).toISOString(),
      timeDifferenceMinutes: timeDifference,
      isExpired: currentTimestamp > expirationTimestamp,
    });

    // Check if OTP has expired
    if (currentTimestamp > expirationTimestamp) {
      console.log("❌ OTP has expired by", Math.abs(timeDifference), "minutes");
      return res
        .status(400)
        .json({ error: "OTP has expired. Please request a new one." });
    } else {
      console.log("✅ OTP is still valid for", timeDifference, "minutes");
    }

    // Check attempts limit (only if using new method)
    if (user.reset_otp !== undefined && otpAttempts >= 5) {
      return res
        .status(400)
        .json({ error: "Too many failed attempts. Please request a new OTP." });
    }

    // Verify OTP
    if (storedOTP !== otp) {
      // Increment attempts (only if using new method)
      if (user.reset_otp !== undefined) {
        try {
          await runQuery(
            "users",
            "update",
            { reset_otp_attempts: otpAttempts + 1 },
            { id: user.id }
          );
        } catch (error) {
          console.log("Could not increment OTP attempts:", error.message);
        }
      }
      return res.status(400).json({ error: "Invalid OTP code" });
    }

    // Generate temporary reset token for password change
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Clear OTP and set temporary token - handle both new and fallback methods
    try {
      if (user.reset_otp !== undefined) {
        // New method - clear OTP columns
        await runQuery(
          "users",
          "update",
          {
            reset_otp: null,
            reset_otp_expires: null,
            reset_otp_attempts: 0,
            reset_token: resetToken,
            reset_token_expires: resetTokenExpires.toISOString(),
          },
          { id: user.id }
        );
      } else {
        // Fallback method - just update the token
        await runQuery(
          "users",
          "update",
          {
            reset_token: resetToken,
            reset_token_expires: resetTokenExpires.toISOString(),
          },
          { id: user.id }
        );
      }
    } catch (error) {
      // If new columns don't exist, use fallback
      await runQuery(
        "users",
        "update",
        {
          reset_token: resetToken,
          reset_token_expires: resetTokenExpires.toISOString(),
        },
        { id: user.id }
      );
    }

    res.json({
      success: true,
      message: "OTP verified successfully. You can now reset your password.",
      resetToken: resetToken,
    });
  } catch (error) {
    console.error("Verify reset OTP error:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});

// Reset password with token (after OTP verification)
router.post(
  "/reset-password-with-otp",
  validatePasswordReset,
  async (req, res) => {
    try {
      const { token, password } = req.body;

      // Find user with valid reset token
      const { data: users } = await supabase
        .from("users")
        .select("id")
        .eq("reset_token", token)
        .gt("reset_token_expires", new Date().toISOString())
        .limit(1);

      const user = users && users.length > 0 ? users[0] : null;

      if (!user) {
        return res
          .status(400)
          .json({ error: "Invalid or expired reset token" });
      }

      // Hash new password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Update password and clear reset token
      await runQuery(
        "users",
        "update",
        {
          password_hash: passwordHash,
          reset_token: null,
          reset_token_expires: null,
        },
        { id: user.id }
      );

      res.json({
        success: true,
        message:
          "Password reset successfully. You can now login with your new password.",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  }
);

// Validate reset token
router.post("/validate-reset-token", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.json({ valid: false, error: "Token is required" });
    }

    // Find user with valid reset token
    const { data: users } = await supabase
      .from("users")
      .select("id")
      .eq("reset_token", token)
      .gt("reset_token_expires", new Date().toISOString())
      .limit(1);

    const user = users && users.length > 0 ? users[0] : null;

    if (!user) {
      return res.json({
        valid: false,
        error: "Invalid or expired reset token",
      });
    }

    res.json({ valid: true });
  } catch (error) {
    console.error("Validate reset token error:", error);
    res.json({ valid: false, error: "Failed to validate token" });
  }
});

// Get current user (protected route)
router.get("/me", auth, async (req, res) => {
  try {
    const user = await getQuery(
      "users",
      { id: req.user.id },
      "id, email, email_verified, created_at"
    );
    const profile = await getQuery("user_profiles", { user_id: req.user.id });
    const shop = await getQuery("shops", { user_id: req.user.id });

    res.json({
      success: true,
      user: {
        ...user,
        profile: profile || null,
        shop: shop || null,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user information" });
  }
});

// Logout (client-side token removal)
router.post("/logout", auth, (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

module.exports = router;
