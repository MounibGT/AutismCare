import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayment {
  price: number;
  platformFee: number;
  professionalPayout: number;
  status:
    | "pending"
    | "processing"
    | "paid"
    | "failed"
    | "refunded"
    | "cancelled";
  method?: "card" | "transfer" | "direct_debit" | "baridimobi";
  baridimobiTransactionId?: string;
  baridimobiReference?: string;
  paidAt?: Date;
  refundedAt?: Date;
  payoutTransferId?: string;
  payoutDate?: Date;
  paymentToken?: string;
  paymentTokenExpiry?: Date;
}

// Loved one information for third-party bookings
export interface ILovedOneInfo {
  firstName: string;
  lastName: string;
  relationship: string; // e.g., "spouse", "child", "parent", "sibling", "other"
  dateOfBirth?: Date;
  phone?: string;
  email?: string;
  notes?: string;
}

// Referral information for patient bookings (by healthcare professionals)
export interface IReferralInfo {
  referrerType: "doctor" | "specialist" | "other_professional";
  referrerName: string;
  referrerLicense?: string;
  referrerPhone?: string;
  referrerEmail?: string;
  referralReason?: string;
  documentUrl?: string; // URL to uploaded prescription/referral PDF
  documentName?: string;
  uploadedAt?: Date;
}

export interface IAppointment extends Document {
  clientId: mongoose.Types.ObjectId;
  professionalId?: mongoose.Types.ObjectId;
  date?: Date;
  time?: string;
  duration: number;
  type: "video" | "in-person" | "phone";
  therapyType: "solo" | "couple" | "group";
  status:
    | "scheduled"
    | "completed"
    | "cancelled"
    | "no-show"
    | "pending"
    | "ongoing";
  issueType?: string;
  notes?: string;
  cancelReason?: string;
  cancelledBy?: "client" | "professional" | "admin";
  cancelledAt?: Date;
  meetingLink?: string;
  location?: string;
  scheduledStartAt?: Date;
  reminderSent: boolean;
  payment: IPayment;
  
  // Booking context - who is this appointment for
  bookingFor: "self" | "patient" | "loved-one";
  
  // Loved one information (when bookingFor === "loved-one")
  lovedOneInfo?: ILovedOneInfo;
  
  // Referral information (when bookingFor === "patient")
  referralInfo?: IReferralInfo;
  
  // Routing status for professional assignment workflow
  routingStatus: "pending" | "proposed" | "accepted" | "refused" | "general";
  
  // Array of professional IDs this appointment has been proposed to
  proposedTo?: mongoose.Types.ObjectId[];
  
  // Array of professional IDs who refused this appointment
  refusedBy?: mongoose.Types.ObjectId[];
  
  // Preferred availability slots provided by client
  preferredAvailability?: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    price: {
      type: Number,
      required: true,
      default: 120,
    },
    platformFee: {
      type: Number,
      required: true,
      default: 12,
    },
    professionalPayout: {
      type: Number,
      required: true,
      default: 108,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "paid",
        "failed",
        "refunded",
        "cancelled",
      ],
      default: "pending",
    },
    method: {
      type: String,
      enum: ["card", "transfer", "direct_debit", "baridimobi"],
      default: "card",
    },
    baridimobiTransactionId: String,
    baridimobiReference: String,
    paidAt: Date,
    refundedAt: Date,
    payoutTransferId: String,
    payoutDate: Date,
    paymentToken: {
      type: String,
      index: true,
    },
    paymentTokenExpiry: Date,
  },
  { _id: false },
);

const LovedOneInfoSchema = new Schema<ILovedOneInfo>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    relationship: {
      type: String,
      required: true,
      enum: ["spouse", "child", "parent", "sibling", "friend", "other"],
    },
    dateOfBirth: Date,
    phone: String,
    email: String,
    notes: String,
  },
  { _id: false },
);

const ReferralInfoSchema = new Schema<IReferralInfo>(
  {
    referrerType: {
      type: String,
      required: true,
      enum: ["doctor", "specialist", "other_professional"],
    },
    referrerName: { type: String, required: true },
    referrerLicense: String,
    referrerPhone: String,
    referrerEmail: String,
    referralReason: String,
    documentUrl: String,
    documentName: String,
    uploadedAt: Date,
  },
  { _id: false },
);

const AppointmentSchema = new Schema<IAppointment>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    date: {
      type: Date,
      required: false,
    },
    time: {
      type: String,
      required: false,
    },
    duration: {
      type: Number,
      required: true,
      default: 60,
    },
    type: {
      type: String,
      enum: ["video", "in-person", "phone"],
      required: true,
      default: "video",
    },
    therapyType: {
      type: String,
      enum: ["solo", "couple", "group"],
      required: true,
      default: "solo",
    },
    status: {
      type: String,
      enum: [
        "scheduled",
        "completed",
        "cancelled",
        "no-show",
        "pending",
        "ongoing",
      ],
      default: "pending",
    },
    issueType: String,
    notes: String,
    cancelReason: String,
    cancelledBy: {
      type: String,
      enum: ["client", "professional", "admin"],
    },
    cancelledAt: Date,
    meetingLink: String,
    location: String,
    scheduledStartAt: Date,
    reminderSent: {
      type: Boolean,
      default: false,
    },
    payment: {
      type: PaymentSchema,
      required: true,
      default: () => ({}),
    },
    // Booking context - who is this appointment for
    bookingFor: {
      type: String,
      enum: ["self", "patient", "loved-one"],
      default: "self",
    },
    // Loved one information (when bookingFor === "loved-one")
    lovedOneInfo: {
      type: LovedOneInfoSchema,
      required: false,
    },
    // Referral information (when bookingFor === "patient")
    referralInfo: {
      type: ReferralInfoSchema,
      required: false,
    },
    // Routing status for professional assignment workflow
    routingStatus: {
      type: String,
      enum: ["pending", "proposed", "accepted", "refused", "general"],
      default: "pending",
    },
    // Array of professional IDs this appointment has been proposed to
    proposedTo: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    // Array of professional IDs who refused this appointment
    refusedBy: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    // Preferred availability slots provided by client
    preferredAvailability: [String],
  },
  {
    timestamps: true,
  },
);

AppointmentSchema.index({ clientId: 1, date: 1 });
AppointmentSchema.index({ professionalId: 1, date: 1 });
AppointmentSchema.index({ status: 1, date: 1 });
AppointmentSchema.index({ routingStatus: 1 });
AppointmentSchema.index({ proposedTo: 1, routingStatus: 1 });

const Appointment: Model<IAppointment> =
  mongoose.models.Appointment ||
  mongoose.model<IAppointment>("Appointment", AppointmentSchema);

export default Appointment;
