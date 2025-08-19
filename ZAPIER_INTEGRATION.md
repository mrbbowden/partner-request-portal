# Zapier Integration Guide

This guide shows you how to connect your Partner Request Portal with Zapier to automatically send form submissions to other apps and services.

## Setup Instructions

### 1. Create a Zapier Webhook

1. **Log into Zapier** at [zapier.com](https://zapier.com)
2. **Create a new Zap**
3. **Choose "Webhooks by Zapier" as the trigger app**
4. **Select "Catch Hook" as the trigger event**
5. **Copy the webhook URL** that Zapier provides (it looks like: `https://hooks.zapier.com/hooks/catch/XXXXXXX/XXXXXXX/`)

### 2. Configure Your Application

1. **Add the webhook URL** to your Replit environment variables:
   - Go to your Replit project
   - Click on "Secrets" in the left sidebar
   - Add a new secret with:
     - Key: `ZAPIER_WEBHOOK_URL`
     - Value: Your Zapier webhook URL from step 1

### 3. Test the Integration

1. **Submit a test form** in your Partner Request Portal
2. **Check Zapier** - you should see the test data appear in your Zap
3. **Set up your Zap actions** to send the data wherever you want (Google Sheets, Slack, email, etc.)

## Data Format Sent to Zapier

When a form is submitted, your app sends this data to Zapier:

```json
{
  "requestId": "uuid-string",
  "requestType": "technical_support",
  "urgency": "high",
  "description": "Request description text",
  "preferredContact": "email",
  "submittedAt": "2024-01-15T10:30:00Z",
  "partnerId": "1234",
  "partnerName": "Sarah Johnson",
  "partnerEmail": "sarah.johnson@example.com",
  "partnerPhone": "(555) 123-4567",
  "source": "Partner Request Portal",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Popular Zapier Integration Ideas

### Google Sheets
- **Action**: Add new row to spreadsheet
- **Use**: Track all partner requests in a Google Sheet

### Slack
- **Action**: Send channel message
- **Use**: Notify your team immediately when urgent requests come in

### Email
- **Action**: Send email
- **Use**: Forward high-priority requests to specific team members

### Trello/Asana
- **Action**: Create new card/task
- **Use**: Automatically create tasks for each request

### Customer Support Tools
- **Action**: Create ticket (Zendesk, Freshdesk, etc.)
- **Use**: Convert partner requests into support tickets

## Filtering in Zapier

You can set up filters in Zapier to only trigger actions for specific conditions:

- **Urgent requests only**: `urgency` equals `high`
- **Specific request types**: `requestType` equals `technical_support`
- **Specific partners**: `partnerId` contains specific IDs

## Troubleshooting

### Webhook Not Receiving Data
1. Check that `ZAPIER_WEBHOOK_URL` is correctly set in your environment variables
2. Make sure the URL starts with `https://hooks.zapier.com`
3. Check your Replit console logs for any error messages

### Missing Data Fields
- The webhook sends all available form data
- If a field is missing, check that it's properly filled in the form
- Optional fields may be empty or null

### Webhook Timeouts
- The app has a 10-second timeout for webhook calls
- If Zapier is slow, the webhook may fail but form submission will still succeed
- Check Zapier's webhook history for delivery status

## Advanced Features

### Multiple Webhooks
You can send to multiple services by adding more webhook URLs:
- `ZAPIER_WEBHOOK_URL` for Zapier
- `SLACK_WEBHOOK_URL` for direct Slack integration
- `CUSTOM_WEBHOOK_URL` for your own services

### Custom Data Formatting
The webhook data format can be customized in the `sendToZapier` function in `server/routes.ts`.

### Retry Logic
For production use, consider adding retry logic for failed webhook deliveries.