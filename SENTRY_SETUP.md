# Sentry Setup Guide

## Overview
Sentry has been integrated into the Give Protocol application for error tracking, performance monitoring, and user session replay.

## Setup Steps

### 1. Create a Sentry Account
1. Go to [https://sentry.io](https://sentry.io)
2. Sign up for a free account (includes 5K errors/month)
3. Create a new project:
   - Platform: React
   - Alert frequency: "Alert me on every new issue"

### 2. Get Your DSN
1. In your Sentry project settings, go to "Client Keys (DSN)"
2. Copy the DSN URL (looks like: `https://abc123@o123.ingest.sentry.io/123`)

### 3. Configure Environment Variables
Add to your `.env` file:
```env
VITE_SENTRY_DSN=your_dsn_here
VITE_APP_VERSION=1.0.0
```

### 4. Deploy Configuration
For production deployments (Netlify), add the same environment variables in your deployment settings.

## Features Implemented

### 1. Error Tracking
- All JavaScript errors are automatically captured
- React component errors are caught by ErrorBoundary
- Logger integration sends all error logs to Sentry

### 2. Performance Monitoring
- Page load performance tracking
- API call performance tracking
- Custom transaction tracking for donations

### 3. User Context
- Authenticated users are tracked with ID and email
- User type (donor/charity) is included in context
- Sessions are tracked across user actions

### 4. Custom Event Tracking
- Donation transactions (start/success/failure)
- Withdrawal requests
- Authentication events

### 5. Privacy & Security
- Sensitive data is filtered out
- User passwords and tokens are never sent
- Cookie data is stripped from requests

## What Gets Tracked

### Automatic Tracking:
- JavaScript errors and exceptions
- Network errors (failed API calls)
- Performance metrics
- User sessions

### Custom Tracking:
- Donation attempts and outcomes
- Wallet connection issues
- Authentication flows
- Smart contract interactions

### Filtered/Ignored:
- Browser extension errors
- User cancellation actions (wallet rejections)
- The old `/api/logs` 404 errors
- ResizeObserver warnings

## Testing in Development

Sentry is only active in production by default. To test in development:

1. Temporarily modify `src/lib/sentry.ts`:
   ```ts
   // Change this line:
   if (!import.meta.env.PROD) {
   // To:
   if (false) {
   ```

2. Trigger an error:
   ```ts
   throw new Error('Test Sentry Integration');
   ```

3. Check your Sentry dashboard for the error

4. **Important**: Revert the change before committing

## Monitoring Dashboard

Once configured, you can:
1. View real-time errors at sentry.io
2. Set up alerts for critical errors
3. Track performance regressions
4. Watch user session replays
5. Create custom dashboards for donation metrics

## Cost Considerations

The free tier includes:
- 5,000 errors/month
- 10,000 performance units
- 50 replays/month
- 1 team member

For a charity platform, this should be sufficient unless you have very high traffic.