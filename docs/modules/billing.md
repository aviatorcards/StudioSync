# Billing & Payments Module

The Billing & Payments module provides comprehensive invoicing, payment tracking, and financial management for music studios.

## Overview

The billing system helps studios:

- Generate professional invoices
- Track payments and balances
- Support multiple payment methods
- Send payment reminders
- Generate financial reports
- Process online payments (via Stripe)

## Invoices

### Invoice Structure

Each invoice contains:

**Header Information:**
- Unique invoice number (e.g., INV-2025-001)
- Issue date and due date
- Billing entity (family or band)
- Status (draft, sent, paid, overdue, cancelled)

**Line Items:**
- Description
- Quantity and unit price
- Total price
- Optional link to lesson

**Financial Summary:**
- Subtotal, tax, total
- Amount paid
- Balance due

### Invoice Statuses

- **Draft:** Being prepared, not yet sent
- **Sent:** Emailed to customer
- **Partial:** Some payment received
- **Paid:** Fully paid
- **Overdue:** Past due date
- **Cancelled:** Invoice voided

### Creating Invoices

**Manual Creation:**
1. Select billing entity (family/band)
2. Set issue and due dates
3. Add line items (lessons, fees, etc.)
4. Calculate tax if applicable
5. Save or send

**Automated Creation:**
- Monthly recurring invoices
- Auto-generate from completed lessons
- Template-based invoicing

## Payments

### Recording Payments

Track all payments against invoices:

- Payment amount
- Payment method (cash, check, card, etc.)
- Transaction ID (if electronic)
- Payment date
- Notes

### Payment Methods

Supported payment methods:

1. **Cash:** In-person payment
2. **Check:** Check number recorded
3. **Credit/Debit Card:** Via Stripe or manual
4. **Bank Transfer:** ACH/wire transfers
5. **Online:** PayPal, Venmo, etc.
6. **Stripe:** Integrated online payments

### Partial Payments

Support multiple payments per invoice:
- First payment → "Partial" status
- Final payment → "Paid" status

### Refunds

Process payment refunds:
- Full or partial refunds
- Update invoice balance
- For Stripe payments, process through API

## Stripe Integration

### Online Payment Processing

Features:
- Secure card processing
- Automatic receipt generation
- Refund processing
- Multiple payment methods supported

**Payment Flow:**
1. Customer receives invoice with "Pay Online" link
2. Secure payment page
3. Stripe processes payment
4. Payment automatically recorded
5. Customer receives receipt
6. Invoice marked as paid

## Billing Reports

### Financial Reports

Generate insights:

1. **Revenue Report:** Total revenue by period
2. **Outstanding Balances:** Unpaid invoices
3. **Payment History:** All payments received
4. **Teacher Revenue:** Revenue per teacher
5. **Student/Family Billing:** Billing history per customer

### Export Options

- PDF reports
- CSV exports
- Email delivery

## Automation

### Recurring Billing

Automate monthly invoicing:
- Define billing cycle
- Configure invoice template
- Auto-send or review before sending

### Reminder Automation

Configure automatic payment reminders:
- Due date reminders
- Overdue reminders
- Custom schedule

## Integration

### Lessons Integration

- Auto-populate from completed lessons
- Include teacher, student, date, and rate

### Inventory Integration

- Equipment rental fees
- Practice room charges
- Late return fees

### Messaging Integration

- New invoice notifications
- Payment confirmations
- Overdue reminders

## Best Practices

### Invoicing

1. Send invoices on consistent schedule
2. Use detailed line item descriptions
3. Send invoices before due date
4. Use branded invoice templates

### Payment Processing

1. Accept various payment methods
2. Enable Stripe for convenience
3. Record payments promptly
4. Send payment confirmations

### Collections

1. Communicate payment terms clearly
2. Use automatic reminder emails
3. Consider grace period before late fees
4. Reach out for overdue accounts

## Related Documentation

- [Billing System](../BILLING.md) - Detailed billing features
- [API Reference](../api.md) - Billing API endpoints
- [Database Schema](../database.md) - Billing data models
- [Students & Families](students.md) - Managing billing entities
