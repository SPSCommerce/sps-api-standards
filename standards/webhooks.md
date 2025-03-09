# Webhooks

## Overview

A webhook is an HTTP-based callback mechanism that enables event-driven communication between two APIs. Unlike traditional polling, where an application repeatedly requests data from a server, webhooks allow applications to receive real-time updates when specific events occur. Webhooks consist of a message—or payload—that is sent to a unique URL configured by the consumer.

Webhooks are widely used for integrating third-party APIs, improving responsiveness, and reducing unnecessary API calls.

### Benefits of Webhooks:
- **Efficiency**: Webhooks push data instantly, eliminating the need for polling.
- **Scalability**: Reduces server load and API rate limits.
- **Flexibility**: Supports various use cases, such as payment notifications, messaging updates, and CI/CD triggers.

### Implementation Considerations:
- Services **MAY** implement push notifications, HTTP callbacks, and other event-driven mechanisms using webhooks.
- Services **MAY** act as webhook consumers by exposing HTTP callback endpoints for external systems or APIs.

> **Note:** Webhooks rely on publicly addressable endpoints, meaning they should be secured to prevent unauthorized access.

---

## Webhook Consumer

A webhook consumer is responsible for handling incoming webhook requests from a producer. Unlike traditional API endpoints, webhook endpoints must accommodate request schemas, headers, and authorization mechanisms defined by the producer.

### Webhook Consumer Guidelines:
- **MAY NOT** strictly follow API standards if doing so does not introduce security risks or compromise API design consistency.
- **MUST** be marked as **internal** in API design specifications, meaning it is managed and configured by the API owner (e.g., `x-internal: true` in OpenAPI Spec).
- **SHOULD** use `POST` as the HTTP method unless the producer explicitly requires an alternative.
- **MUST** enforce `HTTPS` for secure data transmission.
- **MUST** require authentication via a secret key or token to prevent unauthorized access.
- **MUST** use a predefined route path format: `/_webhooks/`.
- **SHOULD** include the webhook producer name in the path (e.g., `/_webhooks/sendgrid/`).
- **MAY** specify event types in the route path for better clarity (e.g., `/_webhooks/sendgrid/email-sent`).

### Example Webhook Consumer Endpoints:
#### Correct:
```plaintext
POST /_webhooks/sendgrid/email-sent   # Specific event webhook
POST /_webhooks/sendgrid/email-opened
POST /_webhooks/sendgrid/email-clicked
POST /_webhooks/sendgrid               # Single endpoint for multiple event types (payload indicates event type)
POST /_webhooks/email-event            # Generic event-based webhook
```

#### Incorrect:
```plaintext
GET /_webhooks/sendgrid/email-sent    # Webhook endpoints should use POST
POST /_webhooks/                      # Requires an identifier after /_webhooks/
POST /hooks/sendgrid/email-sent       # Must use /_webhooks/ prefix
POST /hooks/sendgrid/email_sent       # Use kebab-case for consistency
```

### Testing Webhook Consumers
Before deploying webhook consumers, validate their functionality using testing tools such as:
- **[Beeceptor](https://beeceptor.com/)** – A powerful tool for debugging and testing webhook requests.
- **[RequestBin (Pipedream)](https://pipedream.com/requestbin)** – A simple webhook request collector and visualizer.

---

## Webhook Producer

A webhook producer is responsible for sending event notifications to a consumer's registered webhook endpoint. Producers must ensure reliable delivery, authentication, and retry mechanisms.

> **Note:** Webhook producer standards and best practices are still under development. Refer to [Microsoft REST API Guidelines: Webhooks](https://github.com/Microsoft/api-guidelines/blob/master/Guidelines.md#14-push-notifications-via-webhooks) for initial guidance.

### Best Practices for Webhook Producers:
- **Authentication**: Include an HMAC signature or secret token to validate requests.
- **Retries & Idempotency**: Implement retry logic with exponential backoff to handle failures.
- **Logging & Monitoring**: Log webhook deliveries and failures for debugging.
- **Payload Design**: Ensure payloads are lightweight, structured, and versioned.
- **Subscription Management**: Allow consumers to manage webhook subscriptions dynamically.
