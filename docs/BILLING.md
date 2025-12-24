# Billing & Payments

StudioSync provides a robust billing system designed for recurring music lessons and one-time payments.

## Features

- **Automated Invoicing**: Generate invoices automatically based on scheduled lessons.
- **Online Payments**: Integrated with Stripe for secure credit card processing.
- **Payment Tracking**: Record manual payments (cash, check) and track outstanding balances.
- **Subscription Support**: Support for monthly flat-rate plans.

## Data Model

### Invoice
- `user`: Link to the student or parent.
- `items`: Individual line items for lessons or materials.
- `total`: Calculated total amount.
- `status`: Draft, Sent, Paid, Overdue, Cancelled.

### Payment
- `invoice`: Link to the invoice.
- `amount`: Paid amount.
- `method`: Stripe, Cash, Check, Bank Transfer.
- `stripe_id`: Transaction ID for online payments.

## Integration with Lessons

Invoices are typically generated at the end of the month or per lesson, depending on the studio configuration. The system checks the `Attendance` records to calculate the final amount for pay-as-you-go students.

## Stripe Setup

To enable online payments, you must configure your Stripe API keys in the [Settings](SETTINGS_COMPLETE.md) page or via environment variables.
