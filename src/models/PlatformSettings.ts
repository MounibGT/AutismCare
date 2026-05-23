import mongoose, { Schema, Document, Model } from "mongoose";

// Email notification types
export type EmailNotificationType =
  | "welcome"
  | "email_verification"
  | "password_reset"
  | "appointment_confirmation"
  | "appointment_professional_notification"
  | "appointment_reminder"
  | "appointment_cancellation"
  | "guest_booking_confirmation"
  | "guest_payment_confirmation"
  | "guest_payment_complete"
  | "payment_failed"
  | "payment_refund"
  | "meeting_link"
  | "professional_approval"
  | "professional_rejection";

export interface IEmailTemplateConfig {
  enabled: boolean;
  subject: string;
}

export interface IEmailBranding {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  companyName: string;
  footerText: string;
}

export interface ISmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  fromName: string;
  fromEmail: string;
}

export interface IEmailSettings {
  enabled: boolean;
  smtpConfigured: boolean;
  branding: IEmailBranding;
  templates: Record<EmailNotificationType, IEmailTemplateConfig>;
}

export interface IPlatformSettings extends Document {
  defaultPricing: {
    solo: number;
    couple: number;
    group: number;
  };
  platformFeePercentage: number;
  currency: string;
  cancellationPolicy: {
    clientCancellationHours: number;
    clientRefundPercentage: number;
    professionalCancellationHours: number;
  };
  emailSettings: IEmailSettings;
  createdAt: Date;
  updatedAt: Date;
}

// Default email template configurations
const defaultEmailTemplates: Record<
  EmailNotificationType,
  IEmailTemplateConfig
> = {
  welcome: {
    enabled: true,
    subject: "Welcome to JeChemine!",
  },
  email_verification: {
    enabled: true,
    subject: "Verify Your Email - JeChemine",
  },
  password_reset: {
    enabled: true,
    subject: "Reset Your Password - JeChemine",
  },
  appointment_confirmation: {
    enabled: true,
    subject: "Appointment Confirmed - JeChemine",
  },
  appointment_professional_notification: {
    enabled: true,
    subject: "New Appointment Request - JeChemine",
  },
  appointment_reminder: {
    enabled: true,
    subject: "Appointment Reminder - JeChemine",
  },
  appointment_cancellation: {
    enabled: true,
    subject: "Appointment Cancelled - JeChemine",
  },
  guest_booking_confirmation: {
    enabled: true,
    subject: "Booking Request Received - JeChemine",
  },
  guest_payment_confirmation: {
    enabled: true,
    subject: "Payment Required - Your Appointment is Confirmed",
  },
  guest_payment_complete: {
    enabled: true,
    subject: "Payment Confirmed - JeChemine",
  },
  payment_failed: {
    enabled: true,
    subject: "Payment Failed - Action Required",
  },
  payment_refund: {
    enabled: true,
    subject: "Refund Processed - JeChemine",
  },
  meeting_link: {
    enabled: true,
    subject: "Your Meeting Link is Ready - JeChemine",
  },
  professional_approval: {
    enabled: true,
    subject: "Welcome! Your Professional Account is Approved",
  },
  professional_rejection: {
    enabled: true,
    subject: "Application Update - JeChemine",
  },
};

const defaultEmailBranding: IEmailBranding = {
  primaryColor: "#8B7355",
  secondaryColor: "#6B5344",
  companyName: "JeChemine",
  footerText: "Your journey to wellness starts here.",
};

const EmailTemplateConfigSchema = new Schema<IEmailTemplateConfig>(
  {
    enabled: { type: Boolean, default: true },
    subject: { type: String, required: true },
  },
  { _id: false },
);

const EmailBrandingSchema = new Schema<IEmailBranding>(
  {
    primaryColor: { type: String, default: "#8B7355" },
    secondaryColor: { type: String, default: "#6B5344" },
    logoUrl: { type: String },
    companyName: { type: String, default: "JeChemine" },
    footerText: {
      type: String,
      default: "Your journey to wellness starts here.",
    },
  },
  { _id: false },
);

const PlatformSettingsSchema = new Schema<IPlatformSettings>(
  {
    defaultPricing: {
      solo: {
        type: Number,
        required: true,
        default: 120,
      },
      couple: {
        type: Number,
        required: true,
        default: 150,
      },
      group: {
        type: Number,
        required: true,
        default: 80,
      },
    },
    platformFeePercentage: {
      type: Number,
      required: true,
      default: 10,
      min: 0,
      max: 100,
    },
    currency: {
      type: String,
      default: "CAD",
    },
    cancellationPolicy: {
      clientCancellationHours: {
        type: Number,
        default: 24,
      },
      clientRefundPercentage: {
        type: Number,
        default: 100,
        min: 0,
        max: 100,
      },
      professionalCancellationHours: {
        type: Number,
        default: 12,
      },
    },
    emailSettings: {
      enabled: {
        type: Boolean,
        default: true,
      },
      smtpConfigured: {
        type: Boolean,
        default: false,
      },
      branding: {
        type: EmailBrandingSchema,
        default: () => defaultEmailBranding,
      },
      templates: {
        type: Map,
        of: EmailTemplateConfigSchema,
        default: () => defaultEmailTemplates,
      },
    },
  },
  {
    timestamps: true,
  },
);

// Helper to get default email settings
export function getDefaultEmailSettings(): IEmailSettings {
  return {
    enabled: true,
    smtpConfigured: false,
    branding: { ...defaultEmailBranding },
    templates: { ...defaultEmailTemplates },
  };
}

const PlatformSettings: Model<IPlatformSettings> =
  mongoose.models.PlatformSettings ||
  mongoose.model<IPlatformSettings>("PlatformSettings", PlatformSettingsSchema);

export default PlatformSettings;
