# Webhooks

## Overview

A webhook is an HTTP-based callback function that allows lightweight, usually event-driven communication between two APIs. Webhooks are used by a wide variety of web apps to receive small amounts of data from other apps when specific events occur. This is especially useful for integration with third-party APIs. They have a message—or payload—and are sent to a unique URL configured by the consumer. Webhooks are an advantage in an API as they are almost always faster than polling for an updated status or parsing to determine which events or changes are new within a timeline. 


- Services **MAY** implement push notifications, HTTP callbacks, and other event notifications via webhooks.
- Services **MAY** implement HTTP callback endpoints as a webhook consumer from other systems and/or APIs.

```note
Push notification via HTTP Callbacks, often called Webhooks, to publicly-addressable servers.
```

## Webhook Consumer

Webhook consumption often requires building API endpoints to receive webhook-specific request schemas, headers and authorization that is different from current API style and standards as webhook requests are owned by its producer and not the consumer. As a result webhook consumers should recognize this and organize webhook consuming endpoints accordingly.

Webhook consuming endpoints:
- **MAY NOT** follow API Standards or best practices when it does not pose inherit security risks or affect the rest of the API design consistency and experience.
- **MUST** be marked as **internal** usage only in the design specification. Internal usage implies that the endpoint should only be used by the API owner themselves, including the configuration of that endpoint by them against a third party system if needed. Internal usage does not imply the endpoint is not publicly addressable (i.e. in Open API Spec, this would translate to `x-internal: true`). <a name="sps-webhooks-internal" href="#sps-webhooks-internal"><i class="fa fa-check-circle" title="#sps-webhooks-internal"></i></a>
- **SHOULD** be `POST` endpoints unless specifically needing an alternative by the webhook producer. <a name="sps-webhooks-post" href="#sps-webhooks-post"><i class="fa fa-check-circle" title="#sps-webhooks-post"></i></a>
- **MUST** be sent over `HTTPS` without exception.
- **MUST** be secured with a unique secret key or token that prevents general requests to the webhook endpoint not from the webhook producer.
- **MUST** use a route with path prefix `/_webhooks/` to clearly identify the endpoint intention and purpose for internal usage. <a name="sps-webhooks-path" href="#sps-webhooks-path"><i class="fa fa-check-circle" title="#sps-webhooks-path"></i></a>
- **SHOULD** indicate the webhook producer or product in the route path if the endpoint is intended for a vendor specific request only, for example `/_webhooks/product-name/` (e.g. `/_webhooks/sendgrid/`).
- **MAY** indicate a particular type of event or purpose in the route path if needed to disambiguate between different types of webhook events coming from the same webhook producer, for example `/_webhooks/product-name/specific-event` (e.g. `/_webhooks/sendgrid/email-sent`).

Example:
```
// CORRECT
POST /_webhooks/sendgrid/email-sent             # variations of different events for sendgrid email SaaS offering
POST /_webhooks/sendgrid/email-opened
POST /_webhooks/sendgrid/email-clicked
POST /_webhooks/sendgrid                        # some webhoosk producers may want a single endpoint to send all events too
                                                # the request payload typically would indicate the event type
POST /_webhooks/email-event                     # a more generic event that might be used in more confiurable webhook producers
                                                # where a single hook and event structure makes sense (same payload schema)
                                    
// INCORRECT
GET /_webhooks/sendgrid/email-sent              # should be a POST request      
POST /_webhooks/                                # requires at least one identifier after /_webhooks/
POST /hooks/sendgrid/email-sent                 # prefix path must be /_webhooks/
POST /hooks/sendgrid/email_sent                 # continue to support API Standards where you can, using kebab-case in the URL.
                                                # typically, the webhook producer must at least make the path configurable.
```

## Webhook Producer

A **webhook producer** is a service that sends outbound webhook notifications to subscribers (external clients or systems) when certain events occur. The following standards ensure webhook events are created consistently and securely:

* Webhook events **MUST** be defined and documented in the API specification (such as [Webhooks in OpenAPI 3.1](https://learn.openapis.org/examples/v3.1/webhook-example.html)).
* Webhook events **MUST** be configurable by the consumer via standard API endpoints implementing events as a RESTful style resource. 
* Webhook events **MUST** support at least `application/json` as the request Content Type. Other formats may be supported, but JSON is the minimum requirement.
* Webhook events **MUST** be sent over secure channels (`HTTPS`). All webhook requests must use TLS to protect data in transit.
* Webhook events **MUST** send requests as HTTP `POST` requests to the consumer’s provided URL. This is the standard method for delivering webhook payloads.

### Webhook Requests

When designing the JSON schema for webhook event payloads, use a clear, standardized structure. A well-structured payload improves developer experience and eases integration. The following conventions are for all webhook payloads:

* Webhook payloads **MUST** follow the same modeling and naming conventions as the rest of the API, identified in these API Standards. For example, use consistent data types and structures for common entities, and adhere to the standard property naming rules (e.g. **camelCase** for JSON property names). This consistency makes it easier for developers to intuit the structure of webhook data based on existing API knowledge.
* Each webhook payload **MUST** be an object that contains a few standard metadata fields *plus* a nested `payload` object with the event-specific details:
  * **eventType** – a string describing what event occurred, using enum casing as the event type is likely described through an enumeration in the API specification. The event type naming **SHOULD** be descriptive and include a domain or resource name and action alongside a version number following format: `[DOMAIN]_[ACTION]_[V1]`. For example, an order service might emit `ORDER_CREATED_V1`, `ORDER_CANCELLED_V1`. If a payload breaking schema change is required, the version is incremented. Support of both versions would be required for a period of time to allow consumers to migrate.
  * **eventId** - – a UUID or similar unique string for the event instance. This is important for tracing and deduplication. Consumers can use the `eventId` to detect duplicate deliveries (in case of retries or redundant events) and to acknowledge specific events.
  * **eventTimestamp** – the date/time when the event occurred (or was emitted) in ISO 8601 UTC format (e.g. `"2025-06-05T15:30:00Z"`). This field lets consumers know when the event happened and can be used for ordering or deduplicating messages. All timestamps **MUST** conform to the ISO 8601 standard and include a timezone of UTC. This is not to be confused with the signature timestamp, which is used for security purposes.
  * **webhookId** - a unique identifier for the webhook subscription that generated this event. This allows consumers to track which webhook configuration triggered the event, especially if they have multiple subscriptions.
  * The **payload** object – a nested JSON object carrying the detailed data of the event. This typically contains the resource or data that changed, in a format similar to the resource’s representation in your API. For example, for an `ORDER_CREATED_v1` event, the payload might include an order object with its ID, status, and relevant fields at the time of creation. Keeping this under a distinct `payload` (or `data`) field helps clearly separate metadata from the core event data.
* Full Payloads **SHOULD** be sent when possible, to reduce the need for consumers to make additional API calls to fetch data. This means including all relevant information in the payload, such as resource IDs, names, and any other necessary details. This approach minimizes the number of API calls required by the consumer to process the event. This includes the usage of standardized reusable models to represent common resources like `org`, etc. Payload request size **MUST NOT** exceed `25 MB`. If the payload exceeds this limit, then sending a link to the resource instead of the full object would be required.

```json
POST /abc/client/destination/configured
Content-Type: application/json
User-Agent: Sps-Order-Service-Webhook/1.0   // Identifies the webhook producer and version.
Sps-Signature: sha256=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef   // HMAC signature of the payload based on customer secret.
Sps-Signature-Timestamp: 2025-06-05T15:30:00Z  // Timestamp of the signature creation, used to prevent replay attacks.
Sps-Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000  // Same as the event ID.
{
    "eventType": "ORDER_CREATED_V1",                    // REQUIRED: identifies the type of payload to expect: [DOMAIN]_[ACTION]_[V1]
    "eventId": "550e8400-e29b-41d4-a716-446655440000",  // REQUIRED (string): identifies the unique event, can be used to deduplicate events. Often is a UUID.
    "eventTimestamp": "2025-06-05T15:30:00Z",           // REQUIRED (datetime): identifies the time the event was initially created. 
    "webhookId": "1234567890abcdef1234567890abcdef",    // REQUIRED (string): identifies the webhook subscription that generated this event.
    "payload": {                                        // REQUIRED: the actual event data, structured as an object.
        // ... custom payload object
    }
}
```

* Requests **MUST** include a `User-Agent` header that identifies the webhook producer and version. This helps consumers filter or identify webhook traffic and aids debugging. For example, a webhook from an order service might use: `User-Agent: SPS-Order-Service-Webhook/1.0`
* Requests **MUST** include an [`Sps-Signature`](request-response.md#sps-signature) header that contains a cryptographic signature of the payload. This signature is used to verify the authenticity and integrity of the webhook request. The signature is computed using a shared secret established between the producer and consumer at webhook creation time, typically using HMAC with SHA-256. The hash function should be specified in the header value: `SPS-Signature: sha256=<HMAC hex digest>`.
    * [`Sps-Signature-Timestamp`](request-response.md#sps-signature-timestamp) **MUST** be included to prevent replay attacks. This timestamp is created whenever a new webhook signature is created using the consumer provided secret, as opposed to the `eventTimestamp` that is created only once.
    * `Sps-Signature` **MUST** be computed with the consumer provided secret, and **MUST** be computed over the entire request body contents along with the `Sps-Signature-Timestamp` header. The signature is computed as follows: `HMAC-SHA256(secret, {SPS-Signature-Timestamp} + ":" + {Request-Body})`
    * Consumers **MUST** specify the shared secret when configuring the webhook subscription. The secret **SHOULD** be a minimum of 32 characters long, including a mix of uppercase, lowercase, numbers, and special characters to ensure sufficient entropy.
* [`Sps-Idempotency-Key`](request-response.md#sps-idempotency-key) **MUST** be included in the request headers to allow producers to safely retry webhook deliveries, while informing the consumers the same event is being deliver twice via matching idempotency key header values. This key should match the `eventId` and is used to deduplicate events on the consumer side.

### Webhook Responses

The webhook producer expects the consumer’s endpoint to respond with an HTTP status code indicating receipt of the webhook:

* A **2xx** status code from the consumer **MUST** be treated as a successful delivery. This means the consumer has accepted the event. The producer can then consider the webhook delivered and will not retry that event.
* **Non-2xx** statuses **MUST** indicate the event was not successfully received. Next steps depend on the specific status code returned:
    * **404 Not Found** or **410 Gone**: These indicate the consumer endpoint is invalid or no longer available. The producer **SHOULD NOT** retry these events, as they are likely permanent failures. The producer may consider the webhook subscription cancelled or notify the consumer that their endpoint is no longer valid and render the webhook subscription inactive.
    * **429 Too Many Requests** or **503 Service Unavailable**: These suggest the consumer is overloaded or unavailable temporarily. The producer **SHOULD** retry these with backoff, as the condition may resolve sooner rather than later. If a []`Retry-After`](https://datatracker.ietf.org/doc/html/rfc7231#section-7.1.3) header is provided, the producer **MUST** respect it and wait that duration before retrying.
    * Other **4xx** errors typically indicate a bad request – possibly a problem with the webhook payload or an unauthorized request. These are not usually recoverable by retrying. The producer **SHOULD** retry a 4xx a limited number of times in case it was a transient issue, but generally these should trigger a review and automated alert and disabling of the webhook.
    * **3xx HTTP Redirection** codes are not expected in webhook responses. If they occur, the producer **SHOULD NOT** follow redirects automatically, as this could lead to unexpected behavior or security issues. Instead, the producer should log the redirect and alert the consumer to fix their endpoint.
    * **5xx** indicate server errors on the consumer side. These are presumably temporary, so **MUST** be retried with backoff for an extended period of time.
* When Retrying webhook deliveries, the producer **MUST** implement a retry policy that includes exponential backoff and a maximum number of retries. This prevents overwhelming the consumer’s endpoint with repeated requests in case of transient failures.
  * Use **exponential backoff** between retries to avoid overwhelming a struggling endpoint. For example, after the initial attempt, wait 1 minute before the first retry, then 2 minutes, then 4 minutes, etc., or some similar progressive delay strategy.
  * Retries **MUST** have a documented limit. The webhook producer **MUST NOT** retry indefinitely. A common approach is to try a few times (e.g. 3 to 5 attempts in total) over an increasing time window. 
  * Failed deliveries **MUST** log and alert webhook outcomes. If after the final retry an event still fails, that should be recorded (for later analysis or audit). It’s often useful to surface these failures to the consumer via alerts and also via resource and API access to the webhook subscription status.
  * Webhook calls **MUST** have a reasonable timeout (e.g. 15 seconds) to avoid infinite blocking. If the consumer doesn’t respond in that time, treat it as a failure and trigger a retry. This prevents the producer service from hanging indefinitely on a bad/slow endpoint.
  * Webhook events **MUST NOT** be considered concurrent or sequential. Requests may be delivered out of order depending on retry and failures. Newer events will be sent regardless of the deliverability of the last event. Consumers should consider the `eventTimestamp` to order events and handle them accordingly.

```note
**Event Destinations**: Webhooks have long been left unstandardized, leading to fragmentation and inconsistent implementations. The [Event Destinations](https://eventdestinations.org/) initiative aims to create a common standard for webhook producers and consumers, including security, payload structure, and delivery guarantees. Consider alignment with this emerging standard for future-proofing webhook implementations, adding more flexibility around destinations.
```