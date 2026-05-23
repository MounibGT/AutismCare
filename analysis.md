I've verified the session detail page code structure and it's correct:

- `AppointmentResponse` type extended to include `bookingFor` and `lovedOneInfo`
- Phone display logic uses IIFE to determine correct number based on `bookingFor`
- Only shows for `type === "phone"`
- Also updates "Call Client" button

The primary reason a professional wouldn't see the client's phone number is that **the client hasn't provided a phone number in their profile**. The phone field is optional during signup, and the booking form doesn't prompt for it if missing. When `clientId.phone` is empty, there's no number to display.

**Recommendation:** Make phone number required for phone session bookings. Add validation in the appointment booking flow: if `selectedType === "phone"` and user's profile phone is empty, prompt them to add their phone number before proceeding.

Would you like me to implement that validation to ensure phone numbers are always collected for phone sessions?