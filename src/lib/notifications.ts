/**
 * Email notification utilities for appointment scheduling
 * Uses nodemailer with SMTP for sending emails
 * Configurable from admin portal via PlatformSettings
 */

import nodemailer from "nodemailer";
import connectToDatabase from "@/lib/mongodb";
import PlatformSettings, {
  type EmailNotificationType,
  type IEmailSettings,
  type IEmailBranding,
  getDefaultEmailSettings,
} from "@/models/PlatformSettings";

// =============================================================================
// Types
// =============================================================================

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

interface BaseAppointmentData {
  date?: string;
  time?: string;
  duration: number;
  type: "video" | "in-person" | "phone";
}

interface AppointmentEmailData extends BaseAppointmentData {
  clientName: string;
  clientEmail: string;
  professionalName?: string;
  professionalEmail: string;
  meetingLink?: string;
  location?: string;
}

interface GuestBookingEmailData extends BaseAppointmentData {
  guestName: string;
  guestEmail: string;
  professionalName?: string;
  therapyType: "solo" | "couple" | "group";
  price: number;
  meetingLink?: string;
  paymentLink?: string;
}

interface MeetingLinkEmailData {
  guestName: string;
  guestEmail: string;
  professionalName?: string;
  date?: string;
  time?: string;
  duration: number;
  type: "video" | "in-person" | "phone";
  meetingLink: string;
}

interface WelcomeEmailData {
  name: string;
  email: string;
  role: "client" | "professional" | "guest";
}

interface VerificationEmailData {
  name: string;
  email: string;
  verificationCode: string;
  verificationUrl: string;
}

interface PasswordResetEmailData {
  name: string;
  email: string;
  resetLink: string;
}

interface PaymentEmailData {
  name: string;
  email: string;
  amount: number;
  appointmentDate?: string;
  appointmentTime?: string;
  professionalName?: string;
}

interface ProfessionalStatusEmailData {
  name: string;
  email: string;
  reason?: string;
}

type EmailTheme = "success" | "info" | "warning" | "danger";

// =============================================================================
// Settings Cache
// =============================================================================

let cachedEmailSettings: IEmailSettings | null = null;
let settingsCacheTime: number = 0;
const CACHE_TTL_MS = 60000; // 1 minute cache

async function getEmailSettings(): Promise<IEmailSettings> {
  const now = Date.now();

  // Return cached settings if still valid
  if (cachedEmailSettings && now - settingsCacheTime < CACHE_TTL_MS) {
    return cachedEmailSettings;
  }

  try {
    await connectToDatabase();
    const settings = await PlatformSettings.findOne().lean();

    if (settings?.emailSettings) {
      // Handle the templates Map from MongoDB
      const templates =
        settings.emailSettings.templates instanceof Map
          ? Object.fromEntries(settings.emailSettings.templates)
          : settings.emailSettings.templates;

      cachedEmailSettings = {
        ...settings.emailSettings,
        templates: templates as IEmailSettings["templates"],
      };
      settingsCacheTime = now;
      return cachedEmailSettings;
    }
  } catch (error) {
    console.error("Error fetching email settings:", error);
  }

  // Return defaults if database fetch fails
  return getDefaultEmailSettings();
}

// Clear cache (call when settings are updated)
export function clearEmailSettingsCache(): void {
  cachedEmailSettings = null;
  settingsCacheTime = 0;
}

// =============================================================================
// Configuration & Transport
// =============================================================================

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// =============================================================================
// Formatting Helpers
// =============================================================================

const formatEmailDate = (dateString?: string): string => {
  if (!dateString) return "To be scheduled";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "To be scheduled";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (time?: string): string => {
  return time || "To be scheduled";
};

const formatProfessionalName = (name?: string): string => {
  return name || "To be assigned";
};

const formatAppointmentType = (
  type: "video" | "in-person" | "phone",
): string => {
  const types: Record<string, string> = {
    video: "Video Call",
    "in-person": "In-Person",
    phone: "Phone Call",
  };
  return types[type] || type;
};

const formatSessionType = (type?: "solo" | "couple" | "group"): string => {
  const types: Record<string, string> = {
    solo: "Individual Session",
    couple: "Couple Session",
    group: "Group Session",
  };
  return types[type || "solo"] || "Individual Session";
};

// =============================================================================
// Theme Colors (configurable via branding)
// =============================================================================

const getThemeColors = (
  theme: EmailTheme,
  branding?: IEmailBranding,
): { primary: string; secondary: string; bg: string; text: string } => {
  const primaryColor = branding?.primaryColor || "#8B7355";
  const secondaryColor = branding?.secondaryColor || "#6B5344";

  const themes = {
    success: {
      primary: "#22c55e",
      secondary: "#16a34a",
      bg: "#f0fdf4",
      text: "#166534",
    },
    info: {
      primary: primaryColor,
      secondary: secondaryColor,
      bg: "#faf8f6",
      text: "#5c4a3a",
    },
    warning: {
      primary: "#f59e0b",
      secondary: "#d97706",
      bg: "#fffbeb",
      text: "#92400e",
    },
    danger: {
      primary: "#ef4444",
      secondary: "#dc2626",
      bg: "#fef2f2",
      text: "#991b1b",
    },
  };

  return themes[theme] || themes.info;
};

// =============================================================================
// Email Template Components
// =============================================================================

const getBaseStyles = (branding?: IEmailBranding): string => {
  const primaryColor = branding?.primaryColor || "#8B7355";

  return `
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${primaryColor}; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #666; font-size: 14px; }
    .detail-value { font-weight: 600; color: #333; }
    .button { display: inline-block; background: linear-gradient(135deg, ${primaryColor} 0%, ${branding?.secondaryColor || "#6B5344"} 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: 500; }
    .footer { text-align: center; color: #666; font-size: 12px; padding: 20px; }
    .footer a { color: ${primaryColor}; text-decoration: none; }
  `;
};

const createHeader = (
  title: string,
  subtitle?: string,
  theme: EmailTheme = "info",
  branding?: IEmailBranding,
): string => {
  const colors = getThemeColors(theme, branding);
  return `
    <div class="header" style="background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
      ${branding?.logoUrl ? `<img src="${branding.logoUrl}" alt="${branding.companyName}" style="max-height: 40px; margin-bottom: 15px;">` : ""}
      <h1 style="margin: 0; font-weight: 300; font-size: 28px;">${title}</h1>
      ${subtitle ? `<p style="margin: 10px 0 0; opacity: 0.9; font-size: 16px;">${subtitle}</p>` : ""}
    </div>
  `;
};

const createDetailRow = (
  label: string,
  value: string,
  isLink = false,
  branding?: IEmailBranding,
): string => {
  const primaryColor = branding?.primaryColor || "#8B7355";
  const valueHtml = isLink
    ? `<a href="${value}" style="color: ${primaryColor};">${value.includes("Join") ? "Join Session" : value}</a>`
    : value;
  return `
    <div class="detail-row">
      <span class="detail-label">${label}</span>
      <span class="detail-value">${valueHtml}</span>
    </div>
  `;
};

const createDetailsSection = (
  details: Array<{ label: string; value: string; isLink?: boolean }>,
  borderColor = "#8B7355",
  branding?: IEmailBranding,
): string => {
  const rows = details
    .map((d) => createDetailRow(d.label, d.value, d.isLink, branding))
    .join("");
  return `<div class="details" style="border-left-color: ${borderColor};">${rows}</div>`;
};

const createPriceSection = (
  amount: number,
  note: string,
  theme: EmailTheme = "info",
  branding?: IEmailBranding,
): string => {
  const colors = getThemeColors(theme, branding);
  return `
    <div style="background: ${colors.primary}; color: white; padding: 15px 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <div style="font-size: 24px; font-weight: 600;">$${amount.toFixed(2)} CAD</div>
      <div style="font-size: 12px; opacity: 0.9; margin-top: 5px;">${note}</div>
    </div>
  `;
};

const createInfoBox = (
  title: string,
  content: string,
  theme: EmailTheme = "info",
  branding?: IEmailBranding,
): string => {
  const colors = getThemeColors(theme, branding);
  return `
    <div style="background: ${colors.bg}; border: 1px solid ${colors.primary}40; padding: 15px 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px; color: ${colors.primary}; font-size: 16px;">${title}</h3>
      <p style="margin: 0; color: ${colors.text}; font-size: 14px;">${content}</p>
    </div>
  `;
};

const createButton = (
  text: string,
  url: string,
  branding?: IEmailBranding,
): string => {
  const primaryColor = branding?.primaryColor || "#8B7355";
  const secondaryColor = branding?.secondaryColor || "#6B5344";
  return `<div style="text-align: center;"><a href="${url}" style="display: inline-block; background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: 500;">${text}</a></div>`;
};

const createFooter = (branding?: IEmailBranding): string => {
  const year = new Date().getFullYear();
  const url = process.env.NEXTAUTH_URL || "";
  const companyName = branding?.companyName || "JeChemine";
  const footerText =
    branding?.footerText || "Your journey to wellness starts here.";
  const primaryColor = branding?.primaryColor || "#8B7355";

  return `
    <div class="footer">
      <p style="margin: 0 0 5px;">${footerText}</p>
      <p style="margin: 0;">&copy; ${year} ${companyName}. All rights reserved.</p>
      <p style="margin: 10px 0 0;"><a href="${url}" style="color: ${primaryColor};">Visit our website</a></p>
    </div>
  `;
};

const createBadge = (
  text: string,
  theme: EmailTheme = "success",
  branding?: IEmailBranding,
): string => {
  const colors = getThemeColors(theme, branding);
  return `<span style="display: inline-block; background: ${colors.bg}; color: ${colors.text}; padding: 8px 16px; border-radius: 20px; font-size: 14px;">${text}</span>`;
};

// =============================================================================
// Email Template Builder
// =============================================================================

interface EmailTemplateOptions {
  title: string;
  subtitle?: string;
  theme?: EmailTheme;
  greeting: string;
  intro: string;
  details?: Array<{ label: string; value: string; isLink?: boolean }>;
  detailsBorderColor?: string;
  price?: { amount: number; note: string; theme?: EmailTheme };
  infoBox?: { title: string; content: string; theme?: EmailTheme };
  badge?: { text: string; theme?: EmailTheme };
  button?: { text: string; url: string };
  outro?: string;
  branding?: IEmailBranding;
}

const buildEmailHtml = (options: EmailTemplateOptions): string => {
  const {
    title,
    subtitle,
    theme = "info",
    greeting,
    intro,
    details,
    detailsBorderColor,
    price,
    infoBox,
    badge,
    button,
    outro,
    branding,
  } = options;

  const colors = getThemeColors(theme, branding);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${getBaseStyles(branding)}</style>
      </head>
      <body>
        <div class="container">
          ${createHeader(title, subtitle, theme, branding)}
          <div class="content">
            ${badge ? `<div style="text-align: center; margin-bottom: 20px;">${createBadge(badge.text, badge.theme, branding)}</div>` : ""}
            <p>${greeting}</p>
            <p>${intro}</p>
            ${details ? createDetailsSection(details, detailsBorderColor || colors.primary, branding) : ""}
            ${price ? createPriceSection(price.amount, price.note, price.theme || theme, branding) : ""}
            ${infoBox ? createInfoBox(infoBox.title, infoBox.content, infoBox.theme, branding) : ""}
            ${button ? createButton(button.text, button.url, branding) : ""}
            ${outro ? `<p style="color: #666; font-size: 14px;">${outro}</p>` : ""}
          </div>
          ${createFooter(branding)}
        </div>
      </body>
    </html>
  `;
};

const buildEmailText = (sections: string[]): string => {
  return (
    sections.filter(Boolean).join("\n\n") +
    `\n\n© ${new Date().getFullYear()} JeChemine. All rights reserved.`
  );
};

// =============================================================================
// Email Sender
// =============================================================================

const sendEmail = async (
  data: EmailData,
  emailType: EmailNotificationType,
): Promise<boolean> => {
  try {
    const settings = await getEmailSettings();

    // Check if emails are globally enabled
    if (!settings.enabled) {
      console.log("Email notifications are disabled globally");
      return false;
    }

    // Check if this specific email type is enabled
    const templateConfig = settings.templates[emailType];
    if (templateConfig && !templateConfig.enabled) {
      console.log(`Email type "${emailType}" is disabled`);
      return false;
    }

    // Check SMTP configuration
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      console.log("SMTP not configured. Email would be sent:", {
        to: data.to,
        subject: data.subject,
        type: emailType,
      });
      return true;
    }

    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${settings.branding?.companyName || "JeChemine"}" <${process.env.SMTP_USER}>`,
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
    });

    console.log(`Email sent successfully [${emailType}] to:`, data.to);
    return true;
  } catch (error) {
    console.error(`Error sending email [${emailType}]:`, error);
    return false;
  }
};

// Helper to get subject from settings or use default
async function getSubject(
  emailType: EmailNotificationType,
  defaultSubject: string,
): Promise<string> {
  const settings = await getEmailSettings();
  return settings.templates[emailType]?.subject || defaultSubject;
}

// Helper to get branding
async function getBranding(): Promise<IEmailBranding | undefined> {
  const settings = await getEmailSettings();
  return settings.branding;
}

// =============================================================================
// Public Email Functions - Authentication
// =============================================================================

export async function sendWelcomeEmail(
  data: WelcomeEmailData,
): Promise<boolean> {
  const branding = await getBranding();
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/${data.role}/dashboard`;

  const roleMessages: Record<string, string> = {
    client:
      "You can now browse professionals, book appointments, and access resources to support your wellness journey.",
    professional:
      "Your account is pending approval. Once approved, you'll be able to manage appointments, connect with clients, and grow your practice.",
    guest: "You can track your appointment and receive updates via email.",
  };

  const html = buildEmailHtml({
    title: "Welcome!",
    subtitle: `You've joined ${branding?.companyName || "JeChemine"}`,
    theme: "success",
    greeting: `Dear ${data.name},`,
    intro: `Thank you for creating an account with us. ${roleMessages[data.role] || ""}`,
    button:
      data.role !== "guest"
        ? { text: "Go to Dashboard", url: dashboardUrl }
        : undefined,
    outro:
      "If you have any questions, please don't hesitate to reach out to our support team.",
    branding,
  });

  const text = buildEmailText([
    `Welcome to ${branding?.companyName || "JeChemine"}!`,
    `Dear ${data.name},`,
    `Thank you for creating an account with us.`,
    roleMessages[data.role] || "",
    data.role !== "guest" ? `Visit your dashboard: ${dashboardUrl}` : "",
  ]);

  const subject = await getSubject("welcome", "Welcome to JeChemine!");

  return sendEmail({ to: data.email, subject, html, text }, "welcome");
}

export async function sendVerificationEmail(
  data: VerificationEmailData,
): Promise<boolean> {
  const branding = await getBranding();

  const html = buildEmailHtml({
    title: "Verify Your Email",
    subtitle: "Complete your registration",
    theme: "info",
    greeting: `Dear ${data.name},`,
    intro:
      "Thank you for creating an account. Please verify your email address by entering the code below:",
    details: [
      { label: "Verification Code", value: data.verificationCode },
    ],
    detailsBorderColor: branding?.primaryColor,
    infoBox: {
      title: "Didn't create this account?",
      content:
        "If you didn't create this account, you can safely ignore this email.",
      theme: "warning",
    },
    outro: "This verification code will expire in 24 hours.",
    branding,
  });

  const text = buildEmailText([
    "Verify Your Email - JeChemine",
    `Dear ${data.name},`,
    "Thank you for creating an account. Please verify your email address.",
    `Verification Code: ${data.verificationCode}`,
    `Verification Link: ${data.verificationUrl}`,
    "This code will expire in 24 hours.",
    "If you didn't create this account, you can safely ignore this email.",
  ]);

  const subject = await getSubject(
    "email_verification",
    "Verify Your Email - JeChemine",
  );

  return sendEmail({ to: data.email, subject, html, text }, "email_verification");
}

export async function sendPasswordResetEmail(
  data: PasswordResetEmailData,
): Promise<boolean> {
  const branding = await getBranding();

  const html = buildEmailHtml({
    title: "Reset Your Password",
    theme: "info",
    greeting: `Dear ${data.name},`,
    intro:
      "We received a request to reset your password. Click the button below to create a new password.",
    button: { text: "Reset Password", url: data.resetLink },
    infoBox: {
      title: "Didn't request this?",
      content:
        "If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.",
      theme: "warning",
    },
    outro: "This link will expire in 1 hour for security reasons.",
    branding,
  });

  const text = buildEmailText([
    "Password Reset Request",
    `Dear ${data.name},`,
    "We received a request to reset your password.",
    `Reset your password: ${data.resetLink}`,
    "This link will expire in 1 hour.",
    "If you didn't request this, you can safely ignore this email.",
  ]);

  const subject = await getSubject(
    "password_reset",
    "Reset Your Password - JeChemine",
  );

  return sendEmail({ to: data.email, subject, html, text }, "password_reset");
}

// =============================================================================
// Public Email Functions - Guest Booking
// =============================================================================

export async function sendGuestBookingConfirmation(
  data: GuestBookingEmailData,
): Promise<boolean> {
  const branding = await getBranding();
  const formattedDate = formatEmailDate(data.date);
  const formattedTime = formatTime(data.time);
  const professionalName = formatProfessionalName(data.professionalName);
  const sessionType = formatSessionType(data.therapyType);
  const appointmentType = formatAppointmentType(data.type);
  const isPendingSchedule = !data.date || !data.time || !data.professionalName;

  const intro = isPendingSchedule
    ? "We've received your booking request and will match you with a professional shortly."
    : "Your booking request has been received and is being processed.";

  const nextSteps = isPendingSchedule
    ? "A professional will be assigned to you soon. You'll receive another email with payment details once confirmed."
    : "Please wait for confirmation from your assigned professional. You'll receive payment instructions once your appointment is confirmed.";

  const html = buildEmailHtml({
    title: "Booking Request Received",
    subtitle: isPendingSchedule
      ? "We'll find the right professional for you"
      : "Your session details",
    theme: "info",
    badge: {
      text: isPendingSchedule
        ? "⏳ Pending Assignment"
        : "📅 Awaiting Confirmation",
      theme: "warning",
    },
    greeting: `Dear ${data.guestName},`,
    intro,
    details: [
      { label: "Session Type", value: sessionType },
      { label: "Appointment Type", value: appointmentType },
      { label: "Professional", value: professionalName },
      { label: "Date", value: formattedDate },
      { label: "Time", value: formattedTime },
      { label: "Duration", value: `${data.duration} minutes` },
    ],
    infoBox: {
      title: "Next Steps",
      content: nextSteps,
    },
    outro:
      "Thank you for choosing us. We'll be in touch soon with more details.",
    branding,
  });

  const textNextSteps = isPendingSchedule
    ? [
        "NEXT STEPS:",
        "1. A professional will be assigned to you soon",
        "2. You'll receive confirmation with payment details",
        "3. Complete payment to secure your appointment",
        "4. Receive your meeting link before the session",
      ]
    : [
        "NEXT STEPS:",
        "1. Wait for professional confirmation",
        "2. You'll receive payment instructions once confirmed",
        "3. Complete payment to secure your appointment",
        "4. Receive your meeting link before the session",
      ];

  const text = buildEmailText([
    "Booking Request Received",
    `Dear ${data.guestName},`,
    intro,
    "SESSION DETAILS:",
    `Session Type: ${sessionType}`,
    `Appointment Type: ${appointmentType}`,
    `Professional: ${professionalName}`,
    `Date: ${formattedDate}`,
    `Time: ${formattedTime}`,
    `Duration: ${data.duration} minutes`,
    ...textNextSteps,
  ]);

  const subject = await getSubject(
    "guest_booking_confirmation",
    "Booking Request Received - JeChemine",
  );

  return sendEmail(
    { to: data.guestEmail, subject, html, text },
    "guest_booking_confirmation",
  );
}

export async function sendGuestPaymentConfirmation(
  data: GuestBookingEmailData,
): Promise<boolean> {
  const branding = await getBranding();
  const formattedDate = formatEmailDate(data.date);
  const formattedTime = formatTime(data.time);
  const professionalName = formatProfessionalName(data.professionalName);
  const sessionType = formatSessionType(data.therapyType);
  const appointmentType = formatAppointmentType(data.type);

  const details = [
    { label: "Session Type", value: sessionType },
    { label: "Appointment Type", value: appointmentType },
    { label: "Professional", value: professionalName },
    { label: "Date", value: formattedDate },
    { label: "Time", value: formattedTime },
    { label: "Duration", value: `${data.duration} minutes` },
  ];

  const html = buildEmailHtml({
    title: "Payment Required",
    subtitle: "Your appointment has been confirmed",
    theme: "info",
    badge: { text: "✅ Appointment Confirmed", theme: "success" },
    greeting: `Dear ${data.guestName},`,
    intro:
      "Great news! Your appointment has been confirmed by your professional. Please complete the payment to secure your session.",
    details,
    detailsBorderColor: branding?.primaryColor,
    price: {
      amount: data.price,
      note: "Session fee (taxes included)",
      theme: "info",
    },
    button: data.paymentLink
      ? { text: "Complete Payment", url: data.paymentLink }
      : undefined,
    infoBox: {
      title: "Payment Information",
      content:
        "Your payment is secure and processed through Stripe. You'll receive your meeting link after payment is confirmed.",
    },
    outro:
      "Please complete your payment within 48 hours to keep your appointment slot.",
    branding,
  });

  const text = buildEmailText([
    "Payment Required - Appointment Confirmed",
    `Dear ${data.guestName},`,
    "Your appointment has been confirmed. Please complete the payment.",
    "SESSION DETAILS:",
    `Session Type: ${sessionType}`,
    `Appointment Type: ${appointmentType}`,
    `Professional: ${professionalName}`,
    `Date: ${formattedDate}`,
    `Time: ${formattedTime}`,
    `Duration: ${data.duration} minutes`,
    `Amount Due: $${data.price.toFixed(2)} CAD`,
    data.paymentLink ? `Complete payment: ${data.paymentLink}` : "",
  ]);

  const subject = await getSubject(
    "guest_payment_confirmation",
    "Payment Required - Your Appointment is Confirmed",
  );

  return sendEmail(
    { to: data.guestEmail, subject, html, text },
    "guest_payment_confirmation",
  );
}

export async function sendGuestPaymentComplete(
  data: GuestBookingEmailData,
): Promise<boolean> {
  const branding = await getBranding();
  const formattedDate = formatEmailDate(data.date);
  const formattedTime = formatTime(data.time);
  const professionalName = formatProfessionalName(data.professionalName);
  const sessionType = formatSessionType(data.therapyType);
  const appointmentType = formatAppointmentType(data.type);

  const details: Array<{ label: string; value: string; isLink?: boolean }> = [
    { label: "Session Type", value: sessionType },
    { label: "Appointment Type", value: appointmentType },
    { label: "Professional", value: professionalName },
    { label: "Date", value: formattedDate },
    { label: "Time", value: formattedTime },
    { label: "Duration", value: `${data.duration} minutes` },
  ];

  if (data.meetingLink) {
    details.push({
      label: "Meeting Link",
      value: data.meetingLink,
      isLink: true,
    });
  }

  const html = buildEmailHtml({
    title: "Payment Confirmed",
    subtitle: "You're all set for your session",
    theme: "success",
    badge: { text: "💳 Payment Complete", theme: "success" },
    greeting: `Dear ${data.guestName},`,
    intro:
      "Thank you! Your payment has been successfully processed. Your appointment is now fully confirmed.",
    details,
    detailsBorderColor: "#22c55e",
    price: {
      amount: data.price,
      note: "Payment received - Thank you!",
      theme: "success",
    },
    button: data.meetingLink
      ? { text: "Join Session", url: data.meetingLink }
      : undefined,
    infoBox: {
      title: "Before Your Session",
      content: data.meetingLink
        ? "Your meeting link is ready. Make sure to join a few minutes early and ensure you have a stable internet connection."
        : "Your meeting link will be sent to you before your scheduled session time.",
    },
    outro:
      "We look forward to supporting you on your wellness journey. If you need to reschedule, please contact us at least 24 hours in advance.",
    branding,
  });

  const text = buildEmailText([
    "Payment Confirmed - You're All Set!",
    `Dear ${data.guestName},`,
    "Your payment has been processed successfully.",
    "APPOINTMENT DETAILS:",
    `Session Type: ${sessionType}`,
    `Professional: ${professionalName}`,
    `Date: ${formattedDate}`,
    `Time: ${formattedTime}`,
    `Duration: ${data.duration} minutes`,
    `Amount Paid: $${data.price.toFixed(2)} CAD`,
    data.meetingLink ? `Meeting Link: ${data.meetingLink}` : "",
  ]);

  const subject = await getSubject(
    "guest_payment_complete",
    "Payment Confirmed - JeChemine",
  );

  return sendEmail(
    { to: data.guestEmail, subject, html, text },
    "guest_payment_complete",
  );
}

// =============================================================================
// Public Email Functions - Appointments
// =============================================================================

export async function sendAppointmentConfirmation(
  data: AppointmentEmailData,
): Promise<boolean> {
  const branding = await getBranding();
  const formattedDate = formatEmailDate(data.date);
  const formattedTime = formatTime(data.time);
  const professionalName = formatProfessionalName(data.professionalName);
  const appointmentType = formatAppointmentType(data.type);

  const details: Array<{ label: string; value: string; isLink?: boolean }> = [
    { label: "Professional", value: professionalName },
    { label: "Date", value: formattedDate },
    { label: "Time", value: formattedTime },
    { label: "Duration", value: `${data.duration} minutes` },
  ];

  if (data.meetingLink) {
    details.push({
      label: "Meeting Link",
      value: data.meetingLink,
      isLink: true,
    });
  } else if (data.location) {
    details.push({ label: "Location", value: data.location });
  }

  const html = buildEmailHtml({
    title: "Appointment Confirmed",
    theme: "success",
    greeting: `Dear ${data.clientName},`,
    intro: `Your ${appointmentType.toLowerCase()} appointment has been confirmed.`,
    details,
    button: data.meetingLink
      ? { text: "Join Session", url: data.meetingLink }
      : undefined,
    outro:
      "If you need to reschedule or cancel, please do so at least 24 hours in advance.",
    branding,
  });

  const text = buildEmailText([
    "Appointment Confirmed",
    `Dear ${data.clientName},`,
    `Your ${appointmentType.toLowerCase()} appointment has been confirmed.`,
    "DETAILS:",
    `Professional: ${professionalName}`,
    `Date: ${formattedDate}`,
    `Time: ${formattedTime}`,
    `Duration: ${data.duration} minutes`,
    data.meetingLink ? `Meeting Link: ${data.meetingLink}` : "",
    data.location ? `Location: ${data.location}` : "",
  ]);

  const subject = await getSubject(
    "appointment_confirmation",
    "Appointment Confirmed - JeChemine",
  );

  return sendEmail(
    { to: data.clientEmail, subject, html, text },
    "appointment_confirmation",
  );
}

export async function sendProfessionalNotification(
  data: AppointmentEmailData,
): Promise<boolean> {
  const branding = await getBranding();
  const formattedDate = formatEmailDate(data.date);
  const formattedTime = formatTime(data.time);
  const professionalName = formatProfessionalName(data.professionalName);
  const appointmentType = formatAppointmentType(data.type);
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/professional/dashboard/requests`;

  const html = buildEmailHtml({
    title: "New Appointment Request",
    theme: "info",
    greeting: `Dear ${professionalName},`,
    intro:
      "You have received a new appointment request. Please review the details below.",
    details: [
      { label: "Client", value: data.clientName },
      { label: "Email", value: data.clientEmail },
      { label: "Type", value: appointmentType },
      { label: "Date", value: formattedDate },
      { label: "Time", value: formattedTime },
    ],
    button: { text: "View Request", url: dashboardUrl },
    outro:
      "Please respond to this request as soon as possible to confirm or reschedule.",
    branding,
  });

  const text = buildEmailText([
    "New Appointment Request",
    `Dear ${professionalName},`,
    "You have a new appointment request.",
    "CLIENT DETAILS:",
    `Client: ${data.clientName}`,
    `Email: ${data.clientEmail}`,
    `Type: ${appointmentType}`,
    `Date: ${formattedDate}`,
    `Time: ${formattedTime}`,
    `View requests: ${dashboardUrl}`,
  ]);

  const subject = await getSubject(
    "appointment_professional_notification",
    "New Appointment Request - JeChemine",
  );

  return sendEmail(
    { to: data.professionalEmail, subject, html, text },
    "appointment_professional_notification",
  );
}

export async function sendAppointmentReminder(
  data: AppointmentEmailData,
): Promise<boolean> {
  const branding = await getBranding();
  const formattedDate = formatEmailDate(data.date);
  const formattedTime = formatTime(data.time);
  const professionalName = formatProfessionalName(data.professionalName);

  const details: Array<{ label: string; value: string; isLink?: boolean }> = [
    { label: "Professional", value: professionalName },
    { label: "Date", value: formattedDate },
    { label: "Time", value: formattedTime },
  ];

  if (data.meetingLink) {
    details.push({
      label: "Meeting Link",
      value: data.meetingLink,
      isLink: true,
    });
  }

  const html = buildEmailHtml({
    title: "Appointment Reminder",
    theme: "warning",
    greeting: `Dear ${data.clientName},`,
    intro: "This is a friendly reminder about your upcoming appointment.",
    details,
    infoBox: {
      title: "Prepare for Your Session",
      content:
        "Please ensure you're in a quiet, private space with a stable internet connection. Join a few minutes early to test your audio and video.",
      theme: "info",
    },
    button: data.meetingLink
      ? { text: "Join Session", url: data.meetingLink }
      : undefined,
    outro: "We look forward to seeing you!",
    branding,
  });

  const text = buildEmailText([
    "Appointment Reminder",
    `Dear ${data.clientName},`,
    "Reminder about your upcoming appointment:",
    `Professional: ${professionalName}`,
    `Date: ${formattedDate}`,
    `Time: ${formattedTime}`,
    data.meetingLink ? `Join: ${data.meetingLink}` : "",
  ]);

  const subject = await getSubject(
    "appointment_reminder",
    "Appointment Reminder - JeChemine",
  );

  return sendEmail(
    { to: data.clientEmail, subject, html, text },
    "appointment_reminder",
  );
}

export async function sendMeetingLinkNotification(
  data: MeetingLinkEmailData,
): Promise<boolean> {
  const branding = await getBranding();
  const formattedDate = formatEmailDate(data.date);
  const formattedTime = formatTime(data.time);
  const professionalName = formatProfessionalName(data.professionalName);
  const appointmentType = formatAppointmentType(data.type);

  const html = buildEmailHtml({
    title: "Meeting Link Ready",
    subtitle: "Your Session Details",
    theme: "success",
    badge: { text: "🔗 Link Ready", theme: "success" },
    greeting: `Dear ${data.guestName},`,
    intro:
      "Your meeting link is now ready. You can join the session using the link below.",
    details: [
      { label: "Professional", value: professionalName },
      { label: "Type", value: appointmentType },
      { label: "Date", value: formattedDate },
      { label: "Time", value: formattedTime },
      { label: "Duration", value: `${data.duration} minutes` },
      { label: "Meeting Link", value: data.meetingLink, isLink: true },
    ],
    detailsBorderColor: "#22c55e",
    button: { text: "Join Session", url: data.meetingLink },
    outro:
      "Please join the session a few minutes early and ensure you have a stable internet connection.",
    branding,
  });

  const text = buildEmailText([
    "Your Meeting Link is Ready",
    `Dear ${data.guestName},`,
    "Your session details:",
    `Professional: ${professionalName}`,
    `Type: ${appointmentType}`,
    `Date: ${formattedDate}`,
    `Time: ${formattedTime}`,
    `Duration: ${data.duration} minutes`,
    `Meeting Link: ${data.meetingLink}`,
  ]);

  const subject = await getSubject(
    "meeting_link",
    "Your Meeting Link is Ready - JeChemine",
  );

  return sendEmail(
    { to: data.guestEmail, subject, html, text },
    "meeting_link",
  );
}

export async function sendCancellationNotification(
  data: AppointmentEmailData & { cancelledBy: "client" | "professional" },
): Promise<boolean> {
  const branding = await getBranding();
  const formattedDate = formatEmailDate(data.date);
  const formattedTime = formatTime(data.time);
  const isClientCancellation = data.cancelledBy === "client";
  const recipientEmail = isClientCancellation
    ? data.professionalEmail
    : data.clientEmail;
  const recipientName = isClientCancellation
    ? formatProfessionalName(data.professionalName)
    : data.clientName;
  const cancellerName = isClientCancellation
    ? data.clientName
    : formatProfessionalName(data.professionalName);

  const hasSchedule = data.date && data.time;
  const intro = hasSchedule
    ? `The appointment scheduled for ${formattedDate} at ${formattedTime} has been cancelled by ${cancellerName}.`
    : `An appointment request has been cancelled by ${cancellerName}.`;

  const html = buildEmailHtml({
    title: "Appointment Cancelled",
    theme: "danger",
    greeting: `Dear ${recipientName},`,
    intro,
    details: hasSchedule
      ? [
          { label: "Original Date", value: formattedDate },
          { label: "Original Time", value: formattedTime },
          { label: "Cancelled By", value: cancellerName },
        ]
      : undefined,
    detailsBorderColor: "#ef4444",
    outro:
      "If you have any questions or would like to reschedule, please contact us.",
    branding,
  });

  const text = buildEmailText([
    "Appointment Cancelled",
    `Dear ${recipientName},`,
    intro,
    hasSchedule ? `Original Date: ${formattedDate}` : "",
    hasSchedule ? `Original Time: ${formattedTime}` : "",
  ]);

  const subject = await getSubject(
    "appointment_cancellation",
    `Appointment Cancelled${isClientCancellation ? " by Client" : ""} - JeChemine`,
  );

  return sendEmail(
    { to: recipientEmail, subject, html, text },
    "appointment_cancellation",
  );
}

// =============================================================================
// Public Email Functions - Payments
// =============================================================================

export async function sendPaymentFailedNotification(
  data: PaymentEmailData,
): Promise<boolean> {
  const branding = await getBranding();
  const paymentUrl = `${process.env.NEXTAUTH_URL}/payment`;

  const html = buildEmailHtml({
    title: "Payment Failed",
    subtitle: "Action Required",
    theme: "danger",
    greeting: `Dear ${data.name},`,
    intro:
      "Unfortunately, we were unable to process your payment. Please update your payment method and try again.",
    details: data.appointmentDate
      ? [
          { label: "Amount", value: `$${data.amount.toFixed(2)} CAD` },
          {
            label: "Appointment Date",
            value: formatEmailDate(data.appointmentDate),
          },
          {
            label: "Professional",
            value: formatProfessionalName(data.professionalName),
          },
        ]
      : [{ label: "Amount", value: `$${data.amount.toFixed(2)} CAD` }],
    button: { text: "Retry Payment", url: paymentUrl },
    infoBox: {
      title: "Need Help?",
      content:
        "If you continue to experience issues, please contact our support team for assistance.",
      theme: "info",
    },
    outro: "Please resolve this within 24 hours to keep your appointment slot.",
    branding,
  });

  const text = buildEmailText([
    "Payment Failed - Action Required",
    `Dear ${data.name},`,
    "Your payment could not be processed.",
    `Amount: $${data.amount.toFixed(2)} CAD`,
    `Retry payment: ${paymentUrl}`,
  ]);

  const subject = await getSubject(
    "payment_failed",
    "Payment Failed - Action Required",
  );

  return sendEmail({ to: data.email, subject, html, text }, "payment_failed");
}

export async function sendRefundConfirmation(
  data: PaymentEmailData,
): Promise<boolean> {
  const branding = await getBranding();

  const html = buildEmailHtml({
    title: "Refund Processed",
    theme: "info",
    greeting: `Dear ${data.name},`,
    intro:
      "Your refund has been successfully processed. The funds should appear in your account within 5-10 business days.",
    details: [
      { label: "Refund Amount", value: `$${data.amount.toFixed(2)} CAD` },
      ...(data.appointmentDate
        ? [
            {
              label: "Original Appointment",
              value: formatEmailDate(data.appointmentDate),
            },
          ]
        : []),
    ],
    infoBox: {
      title: "Processing Time",
      content:
        "Refunds typically take 5-10 business days to appear on your statement, depending on your bank.",
    },
    outro:
      "If you have any questions about this refund, please contact our support team.",
    branding,
  });

  const text = buildEmailText([
    "Refund Processed",
    `Dear ${data.name},`,
    "Your refund has been processed.",
    `Amount: $${data.amount.toFixed(2)} CAD`,
    "Funds should appear in your account within 5-10 business days.",
  ]);

  const subject = await getSubject(
    "payment_refund",
    "Refund Processed - JeChemine",
  );

  return sendEmail({ to: data.email, subject, html, text }, "payment_refund");
}

// =============================================================================
// Public Email Functions - Professional Status
// =============================================================================

export async function sendProfessionalApprovalEmail(
  data: ProfessionalStatusEmailData,
): Promise<boolean> {
  const branding = await getBranding();
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/professional/dashboard`;

  const html = buildEmailHtml({
    title: "Application Approved!",
    subtitle: "Welcome to the Team",
    theme: "success",
    badge: { text: "✅ Approved", theme: "success" },
    greeting: `Dear ${data.name},`,
    intro:
      "Congratulations! Your professional application has been approved. You can now start accepting appointments and connecting with clients.",
    infoBox: {
      title: "Getting Started",
      content:
        "Complete your profile, set your availability, and start accepting appointment requests from clients who need your expertise.",
    },
    button: { text: "Go to Dashboard", url: dashboardUrl },
    outro: "Thank you for joining us. We're excited to have you on board!",
    branding,
  });

  const text = buildEmailText([
    "Application Approved!",
    `Dear ${data.name},`,
    "Your professional application has been approved.",
    "You can now start accepting appointments.",
    `Go to your dashboard: ${dashboardUrl}`,
  ]);

  const subject = await getSubject(
    "professional_approval",
    "Welcome! Your Professional Account is Approved",
  );

  return sendEmail(
    { to: data.email, subject, html, text },
    "professional_approval",
  );
}

export async function sendProfessionalRejectionEmail(
  data: ProfessionalStatusEmailData,
): Promise<boolean> {
  const branding = await getBranding();

  const html = buildEmailHtml({
    title: "Application Update",
    theme: "info",
    greeting: `Dear ${data.name},`,
    intro:
      "Thank you for your interest in joining our platform. After careful review, we're unable to approve your application at this time.",
    infoBox: data.reason
      ? {
          title: "Feedback",
          content: data.reason,
        }
      : undefined,
    outro:
      "If you believe this decision was made in error or would like to provide additional information, please contact our support team.",
    branding,
  });

  const text = buildEmailText([
    "Application Update",
    `Dear ${data.name},`,
    "We're unable to approve your application at this time.",
    data.reason ? `Feedback: ${data.reason}` : "",
    "Please contact support if you have questions.",
  ]);

  const subject = await getSubject(
    "professional_rejection",
    "Application Update - JeChemine",
  );

  return sendEmail(
    { to: data.email, subject, html, text },
    "professional_rejection",
  );
}
