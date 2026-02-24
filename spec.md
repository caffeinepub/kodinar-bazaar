# Specification

## Summary
**Goal:** Integrate Stripe payment processing into the Kodinar Bazaar order checkout flow so customers pay on the platform before their order is confirmed.

**Planned changes:**
- Extend order records with `paymentStatus` (pending | paid | failed) and `stripePaymentIntentId` fields on the backend.
- Add a backend function `createPaymentIntent(orderId)` that returns a Stripe client secret for the order total.
- Add a backend function `confirmPayment(orderId, paymentIntentId)` that updates the order's payment status to "paid".
- Orders remain incomplete until payment is confirmed.
- Replace the CartPage "Place Order" button flow with a Stripe Elements payment step (modal or dedicated checkout page) for secure card entry.
- Show loading/processing states, a success redirect to OrderConfirmationPage, and an error state with retry option on payment failure.

**User-visible outcome:** After clicking "Place Order," customers are presented with a Stripe card payment form. On successful payment the order is confirmed and they are taken to the order confirmation page; on failure they see an error and can retry without losing their cart.
