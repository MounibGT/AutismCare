# 🧪 Complete Stripe Payment Testing Guide (ACCURATE VERSION)

## Prerequisites Checklist

Before starting, verify you have:

- [ ] ✅ Dev server running (`npm run dev`)
- [ ] ✅ `.env` file with correct values (see below)
- [ ] ✅ Browser ready (Chrome, Firefox, or Edge)
- [ ] ✅ Stripe test card: **4242 4242 4242 4242**

---

## 🎬 **PART 1: Create Professional Account FIRST**

> ⚠️ **CRITICAL:** You MUST create a professional account BEFORE creating a client account!  
> **Why?** Clients need professionals to book appointments with. No professionals = no bookings = nothing to pay for!

### **Step 1: Go to Signup Page**

1. Open browser
2. Go to: **http://localhost:3000**
3. Click **"Sign Up"** or **"Get Started"**
4. You should see TWO cards: **"Member"** and **"Professional"**
5. Click the **"Professional"** card (icon with briefcase)

---

### **Step 2: Professional Signup - Personal Information**

You'll see a **4-step process** with a stepper at the top.

**Step 1/4 - Personal Information:**

1. **First Name:** `Marie`
2. **Last Name:** `Dubois`
3. **Email:** `marie.prof@example.com`
4. **Phone:** `514-555-1234` (or any format)
5. Click **"Continue"** button (arrow icon →)

---

### **Step 3: Professional Signup - Professional Details**

**Step 2/4 - Professional Details:**

1. **License Number:** `PSY-12345` (can be any format)
2. **Specialty:** Select from dropdown:
   - Psychologist ✅ (recommended)
   - Psychiatrist
   - Therapist
   - Counselor
   - Social Worker
3. **Location:** `Montreal, QC` (or any city)
4. Click **"Continue"** button

---

### **Step 4: Professional Signup - Security**

**Step 3/4 - Password Setup:**

1. **Password:** `TestPassword123!`
   - Must be at least 8 characters
   - Use the eye icon to show/hide password
2. **Confirm Password:** `TestPassword123!`
   - Must match exactly
3. Click **"Continue"** button

---

### **Step 5: Professional Signup - Review & Confirm**

**Step 4/4 - Review Your Information:**

1. **Review all your information** displayed in the box:
   - Name: Marie Dubois
   - Email: marie.prof@example.com
   - Phone: 514-555-1234
   - License: PSY-12345
   - Specialty: Psychologist
   - Location: Montreal, QC

2. **✅ Check the "Agree to Terms" checkbox** (REQUIRED!)
   - "I agree to the Terms of Service and Privacy Policy"

3. Click **"Create Account"** button

4. Wait for account creation (loading spinner)

5. **Success!** You'll be automatically signed in and redirected to: `/professional/dashboard`

---

### **Step 6: Verify Professional Dashboard**

You should now see the professional dashboard with:

- Welcome message
- Dashboard sections (Schedule, Clients, Billing, etc.)
- Sidebar navigation

**✅ Professional account created successfully!**

---

### **Step 7: LOGOUT from Professional Account**

⚠️ **CRITICAL - Don't Skip This!**

1. Look for your profile icon or menu (usually top right)
2. Click it to open dropdown
3. Click **"Logout"** or **"Sign Out"**
4. You should be redirected to the homepage or login page

---

## 👤 **PART 2: Create Client Account**

Now that you have a professional, let's create a client who will book and pay.

### **Step 8: Go to Signup Page**

1. Go to: **http://localhost:3000**
2. Click **"Sign Up"**
3. You'll see two cards again
4. This time, click the **"Member"** card (icon with users)

---

### **Step 9: Client Signup - Personal Information**

You'll see a **3-step process** (simpler than professional).

**Step 1/3 - Personal Information:**

1. **First Name:** `John`
2. **Last Name:** `Doe`
3. **Email:** `john.client@example.com`
4. Click **"Continue"** button

---

### **Step 10: Client Signup - Security**

**Step 2/3 - Password Setup:**

1. **Password:** `TestPassword123!`
   - Must be at least 8 characters
2. **Confirm Password:** `TestPassword123!`
3. Click **"Continue"** button

---

### **Step 11: Client Signup - Review & Confirm**

**Step 3/3 - Review Your Information:**

1. **Review your information:**
   - Name: John Doe
   - Email: john.client@example.com

2. **✅ Check the "Agree to Terms" checkbox** (REQUIRED!)

3. Click **"Create Account"** button

4. Wait for account creation

5. **Success!** You'll be automatically signed in and redirected to: `/client/dashboard`

---

### **Step 12: Verify Client Dashboard**

You should see the client dashboard with:

- Welcome message
- Quick actions (Book Appointment, etc.)
- Dashboard sections

**✅ Client account created successfully!**

**✅ You're now ready to book an appointment!**

---

## 📅 **PART 3: Book an Appointment**

### **Step 13: Navigate to Book Appointment**

From the client dashboard:

**Option A:**

1. Click **"Book Appointment"** button on the dashboard

**Option B:**

1. Navigate to: **http://localhost:3000/appointment**

---

### **Step 14: Select Professional**

1. You should see a list of professionals
2. **You should see "Marie Dubois"** (the professional you created!)
   - Specialty: Psychologist
   - Location: Montreal, QC
3. Click on Marie's card
4. Click **"Select"** or the professional card itself to proceed

---

### **Step 15: Choose Date & Time**

1. **Select a Date:**
   - Use the dropdown/calendar
   - Choose a weekday (Monday-Friday)
   - Pick a date at least 1-2 days in the future

2. **View Available Time Slots:**
   - Wait for slots to load
   - You should see available times (e.g., 9:00 AM, 10:00 AM, 2:00 PM, etc.)

3. **Select a Time:**
   - Click on any available time slot button
   - It will highlight when selected

4. Click **"Next"** or **"Continue"**

---

### **Step 16: Enter Appointment Details**

1. **Session Type:** Choose one
   - Video Call (default) ✅
   - In-Person
   - Phone Call

2. **Primary Concern:** Select from dropdown (REQUIRED!)
   - Anxiety ✅ (recommended)
   - Depression
   - Stress Management
   - Relationship Issues
   - Trauma
   - Self-Esteem
   - Career Counseling
   - Family Issues
   - Other

3. **Additional Notes (Optional):**
   - Type anything you want to discuss
   - Example: "First session, looking forward to discussing stress management"

4. **Review Pricing:**
   - Should display: **$120.00 CAD**
   - For 60-minute session

5. Click **"Book Appointment"** button

---

### **Step 17: Appointment Confirmation**

You should see a beautiful success page with THREE cards:

**Card 1: Success Header**

- ✅ Green checkmark icon
- **"Appointment Booked Successfully!"** heading
- "Your appointment has been scheduled. You'll receive a confirmation email shortly."

**Card 2: Appointment Details** (Shows everything!)

- **Professional:** Marie Dubois (Psychologist)
- **Date & Time:** Full date like "Monday, November 18, 2025" and time
- **Session Type:** Video Call (or what you selected)
- **Primary Concern:** Anxiety (or what you selected)
- **Pricing:**
  - Session Price: $120.00 CAD
  - Payment Status: **"Pending"** (yellow badge with clock icon)

**Card 3: Next Steps**

- Text: "Complete your payment now to confirm your appointment, or pay later from your billing page."
- Three buttons:
  - **"Pay Now"** (blue button with wallet icon) ← Click this!
  - **"View Dashboard"** (outlined button)
  - **"Book Another Appointment"** (ghost button)

---

**What to Do Next:**

You have TWO options:

**Option A: Pay Immediately (Recommended)**

1. Click the **"Pay Now"** button
2. You'll be taken directly to the billing page
3. Continue with **Step 18** below

**Option B: Pay Later**

1. Click **"View Dashboard"**
2. Later, navigate to billing page manually
3. Then continue with **Step 18**

---

## 💳 **PART 4: Make Payment**

### **Step 18: Navigate to Billing Page**

**If you clicked "Pay Now" from Step 17:**

- You're already on the billing page! ✅
- Skip to **Step 19**

**If you clicked "View Dashboard" instead:**

1. Look for sidebar navigation
2. Click **"Billing"** or **"Billing & Payments"**
3. OR navigate directly to: **http://localhost:3000/client/dashboard/billing**

---

### **Step 19: View Pending Payment**

1. You should see **"Payments Owed"** tab (active by default)
2. Your appointment should be listed:

   ```
   Session - Marie Dubois
   Date: [Your selected date and time]
   Amount: $120.00 CAD
   Status: Pending (yellow/orange badge)
   ```

3. Locate the **"Pay Now"** button (blue button with credit card icon)

---

### **Step 20: Open Payment Modal**

1. Click the **"Pay Now"** button
2. A **modal (popup)** should open
3. Title: **"Complete Payment"**
4. Shows:
   - Professional name: Marie Dubois
   - Appointment date/time
   - Amount: $120.00 CAD

⏳ **Wait 5-10 seconds** for the Stripe payment form to load...

---

### **Step 21: Fill Out Stripe Payment Form**

The Stripe Elements form should appear with input fields:

1. **Card Information:**
   - **Card Number:** `4242 4242 4242 4242`
   - This is Stripe's test card that always succeeds

2. **Expiration Date:**
   - Enter any future date: `12/25` or `12/30`

3. **CVC:**
   - Enter any 3 digits: `123`

4. **Cardholder Name:**
   - Enter: `John Doe`

5. **Country:**
   - Should auto-select Canada (or select it)

6. **Postal Code:**
   - Canadian: `H2X 3Y7`
   - Or US: `12345`

---

### **Step 22: Submit Payment**

1. Review the amount one more time: **$120.00 CAD**
2. Click the **"Pay $120.00 CAD"** button at the bottom
3. You should see:
   - Loading spinner
   - Text: "Processing..."

⏳ **Wait 3-5 seconds** for Stripe to process...

---

### **Step 23: Payment Success!**

You should see ONE of these outcomes:

**Option A: Success in Modal** ✅

- Green checkmark icon
- "Payment Successful!" message
- "Your appointment has been confirmed"
- Modal closes automatically or has a close button

**Option B: Redirect to Success Page**

- Redirected back to appointments or billing page
- Success notification appears
- URL may have `?payment_success=true`

**Option C: Processing State** (if webhook not setup)

- "Your payment is processing" message
- This is NORMAL without webhooks!
- Payment DID go through in Stripe

---

## ✅ **PART 5: Verify Payment Worked**

### **Step 24: Check Appointment Status in Your App**

1. Go back to **Billing** page if not already there
2. OR go to **Appointments** page
3. Look for your appointment

**If Webhook IS Setup:**

- Status should show: **"Paid"** (green badge) ✅
- Payment date: Today's date
- Payment method may show

**If Webhook NOT Setup:**

- Status may still show: **"Pending"** or **"Processing"**
- Don't worry! Payment still went through
- We just need to verify in Stripe Dashboard...

---

### **Step 25: Verify in Stripe Dashboard** (MOST IMPORTANT!)

This is the definitive proof your payment worked:

1. Open a new browser tab
2. Go to: **https://dashboard.stripe.com/test/payments**
3. Login to Stripe if needed
4. Click **"Payments"** in the left sidebar

5. You should see your payment at the top of the list:

   ```
   Amount: $120.00 CAD
   Status: Succeeded ✅
   Customer: john.client@example.com (or customer ID)
   Description: Therapy session with Marie Dubois...
   ```

6. **Click on the payment** to see full details

7. In the payment details, scroll down to **"Metadata"** section:

   ```
   appointmentId: [your appointment MongoDB ID]
   clientId: [your user ID]
   professionalId: [Marie's user ID]
   sessionDate: [ISO date string]
   sessionTime: [time string]
   platformFee: 12
   professionalPayout: 108
   ```

8. **If you see this** → Payment is 100% successful! ✅

---

### **Step 26: Check Database (Optional)**

If you want to verify in MongoDB:

1. Go to: **https://cloud.mongodb.com**
2. Login and navigate to your cluster
3. Click **"Browse Collections"**
4. Select the **`appointments`** collection
5. Find your appointment by date or client name
6. Verify these fields exist:
   ```json
   {
     "clientId": ObjectId("..."),
     "professionalId": ObjectId("..."),
     "date": ISODate("2025-11-17..."),
     "price": 120,
     "platformFee": 12,
     "professionalPayout": 108,
     "paymentStatus": "paid",  // or "processing" without webhook
     "stripePaymentIntentId": "pi_xxxxxxxxxxxxx",
     "paidAt": ISODate("2025-11-17...")
   }
   ```

---

## 🎉 **SUCCESS!**

If you can see the payment in Stripe Dashboard with status "Succeeded", you've successfully:

- ✅ Created professional account
- ✅ Created client account
- ✅ Booked an appointment
- ✅ Processed payment through Stripe
- ✅ Stripe integration is working!

**Congratulations!** 🎊

---

## 🔧 **TROUBLESHOOTING**

### **Problem 1: Can't See Payment Form in Modal**

**Symptoms:**

- Modal opens but no payment form appears
- Just see "Preparing payment..." forever
- Or error message appears

**Check Console (F12 → Console tab):**
Look for errors related to:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Stripe.js loading issues

**Common Causes:**

1. **Missing or wrong publishable key**
   - Check `.env`: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`
   - MUST start with `pk_test_`
   - MUST have `NEXT_PUBLIC_` prefix

2. **Using secret key instead of publishable key**
   - Publishable: `pk_test_...` ✅
   - Secret: `sk_test_...` ❌ (backend only!)

3. **Didn't restart dev server after adding env var**
   - Stop server (`Ctrl+C`)
   - Run `npm run dev` again

**Fix:**

```bash
# In .env file
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE

# Restart server
npm run dev
```

---

### **Problem 2: "Failed to Create Payment Intent" Error**

**Symptoms:**

- Modal shows error: "Failed to initialize payment"
- Console shows 500 error from `/api/payments/create-intent`

**Check Terminal Logs:**
Look at your dev server terminal for errors.

**Common Causes:**

1. **Wrong secret key (using publishable key as secret)**

   ```bash
   # WRONG:
   STRIPE_SECRET_KEY=pk_test_xxx  ❌

   # CORRECT:
   STRIPE_SECRET_KEY=sk_test_xxx  ✅
   ```

2. **Get the correct secret key:**
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Find "Secret key" row
   - Click **"Reveal test key"**
   - Copy the key starting with `sk_test_`

3. **MongoDB connection issue**
   - Check `MONGODB_URI` in `.env`
   - Make sure database is accessible

**Fix:**

```bash
# In .env file
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY

# Restart server
npm run dev
```

---

### **Problem 3: Payment Succeeds but Status Still "Pending"**

**This is NORMAL without webhook setup!**

**What Happened:**

- ✅ Payment processed successfully in Stripe
- ❌ Your app didn't receive webhook notification
- ❌ Database wasn't auto-updated

**Verification:**

1. Go to Stripe Dashboard → Payments
2. If payment shows "Succeeded" → **Payment worked!** ✅
3. The money is collected, just status didn't update in your app

**To Fix (Optional - for auto-status updates):**
Set up webhooks - see "Webhook Setup" section below

**For Now:**
You can manually verify all payments in Stripe Dashboard. For testing purposes, this is fine!

---

### **Problem 4: Card Declined / Payment Failed**

**Make sure you're using the correct test card:**

| Card Number           | Result                |
| --------------------- | --------------------- |
| `4242 4242 4242 4242` | ✅ Success (always)   |
| `4000 0000 0000 0002` | ❌ Declined           |
| `4000 0000 0000 9995` | ❌ Insufficient funds |
| `4000 0025 0000 3155` | 🔒 Requires 3D Secure |

**Use:** `4242 4242 4242 4242` for basic testing

---

### **Problem 5: No Professionals to Book With**

**This means you skipped Part 1!**

You need to create a professional account first.

**Solution:**

1. Logout from client account
2. Go back to Part 1 of this guide
3. Create professional account
4. Then logout and login as client again

---

### **Problem 6: Appointment Not Created**

**Check:**

1. Did you select a primary concern? (required field)
2. Did you select both date AND time?
3. Check browser console for errors (F12)
4. Check terminal logs for API errors

**Common Issues:**

- Date in the past
- Time slot already taken
- Database connection issue

---

## 🔗 **OPTIONAL: Webhook Setup**

To make appointment status auto-update to "paid", you need webhooks.

### **Why Webhooks?**

Without webhooks:

- Payment succeeds in Stripe ✅
- Your app doesn't know about it ❌
- Status stays "pending" ❌

With webhooks:

- Payment succeeds in Stripe ✅
- Stripe notifies your app ✅
- Status auto-updates to "paid" ✅

### **Local Development Webhook Setup**

**Step 1: Install Stripe CLI**

**Windows (Scoop):**

```powershell
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Windows (Direct Download):**

1. Download from: https://github.com/stripe/stripe-cli/releases/latest
2. Extract `stripe.exe`
3. Add to PATH or use from download folder

**Mac:**

```bash
brew install stripe/stripe-cli/stripe
```

---

**Step 2: Login to Stripe CLI**

```bash
stripe login
```

- Browser will open
- Click "Allow access"
- Return to terminal

---

**Step 3: Forward Webhooks**

Open a **SECOND TERMINAL** (keep dev server running in first):

```powershell
stripe listen --forward-to localhost:3000/api/payments/webhook
```

You should see:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
```

---

**Step 4: Copy Webhook Secret**

1. Copy the `whsec_xxxxx` shown in terminal
2. Add to your `.env` file:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
   ```
3. Restart your dev server (in first terminal):
   - Press `Ctrl+C`
   - Run `npm run dev` again

---

**Step 5: Keep Both Running**

While testing with webhooks, you need:

- ✅ Terminal 1: `npm run dev` (dev server)
- ✅ Terminal 2: `stripe listen --forward-to localhost:3000/api/payments/webhook`

---

**Step 6: Test Payment Again**

1. Create a new appointment (or use existing pending one)
2. Make payment with test card
3. **Watch the Stripe CLI terminal (Terminal 2)**
4. You should see:
   ```
   --> payment_intent.succeeded [200]
   ```
5. Check appointment status → Should now show **"Paid"** ✅

---

## 📊 **Testing Checklist**

###Basic Functional Tests\*\*

- [ ] ✅ Create professional account with all 4 steps
- [ ] ✅ Professional redirects to `/professional/dashboard`
- [ ] ✅ Logout from professional
- [ ] ✅ Create client account with all 3 steps
- [ ] ✅ Client redirects to `/client/dashboard`
- [ ] ✅ Navigate to book appointment page
- [ ] ✅ See the professional you created listed
- [ ] ✅ Select professional
- [ ] ✅ Choose date and time
- [ ] ✅ Fill in appointment details
- [ ] ✅ Submit booking
- [ ] ✅ See success message
- [ ] ✅ Navigate to billing page
- [ ] ✅ See appointment listed as "pending"
- [ ] ✅ Click "Pay Now"
- [ ] ✅ Payment modal opens
- [ ] ✅ Stripe form loads
- [ ] ✅ Enter test card 4242...
- [ ] ✅ Submit payment
- [ ] ✅ See success message
- [ ] ✅ Verify in Stripe Dashboard (status: Succeeded)

### **Advanced Tests (With Webhook)**

- [ ] Payment updates appointment status to "paid"
- [ ] Paid date is recorded in database
- [ ] Payment intent ID is saved

### **Error Tests**

- [ ] Try declined card: `4000 0000 0000 0002`
- [ ] Try incomplete card number
- [ ] Try expired date

---

## 🎯 **What's Next?**

Once local testing works:

1. ✅ Test professional Stripe Connect setup (for payouts)
2. ✅ Test payment method saving
3. ✅ Test refunds
4. ✅ Deploy to production (still in test mode)
5. ✅ Set up production webhooks
6. ✅ Switch to live mode keys (when ready for real money)

---

## 📞 **Need Help?**

If stuck:

1. **Check browser console** (F12 → Console tab)
2. **Check terminal logs** (your dev server output)
3. **Check Stripe Dashboard** (Payments and Logs sections)
4. **Verify `.env` file** (all keys correct and formatted properly)

---

**Good luck testing! 🚀**
