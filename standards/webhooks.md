# Webhooks

```note
Webhook producer standards and best practices are still under development. Some relevant starting material: [Microsoft REST API Guidelines: Webhooks](https://github.com/Microsoft/api-guidelines/blob/master/Guidelines.md#14-push-notifications-via-webhooks)
```

## Overview

Webhooks are HTTP-based callbacks that enable lightweight, event-driven communication between APIs. A webhook delivers a **payload** (a small JSON message) to a **consumer-provided URL** whenever a specific event occurs. This push-model design provides near real-time notifications and avoids the need for polling for changes. Webhooks are particularly useful for integrating with third-party systems and are generally faster than periodically polling for updates.

* Services **MAY** implement push notifications or HTTP callbacks (webhooks) to notify other systems of events in real time.
* Services **MAY** act as webhook consumers by exposing internal endpoints to receive events from external systems. (See **Webhook Consumer** guidelines below.)

## Webhook Consumer

A **webhook consumer** is a service endpoint that receives and handles incoming webhooks from an external **webhook producer**. Because the producer (external system) controls the HTTP request format, consumers may need to diverge slightly from typical API design conventions to accommodate the producer’s requirements. The following standards ensure webhook endpoints are implemented consistently and securely:

* Webhook consumer endpoints **MUST** be treated as **internal** operations in the API design. In the OpenAPI spec, mark them with `x-internal: true` (indicating they are not for public client use but for receiving third-party calls).
* Webhook consumer endpoints **SHOULD** use the HTTP `POST` method to accept event payloads (as most webhook producers send `POST` requests).
* Webhook consumer endpoints **MUST** only be exposed over secure channels (`HTTPS`). There are no exceptions to this rule – all webhook calls must use TLS to protect data in transit.
* Webhook consumer endpoints **MUST** be protected by a **secret token or key** to verify the caller. The consumer’s endpoint should require a unique secret (e.g. as a header or URL parameter) or signature that the known webhook producer will include, in order to reject any unauthorized calls. This ensures that random third parties cannot spoof webhook calls.
* The URL path for consumer webhook endpoints **MUST** begin with the prefix `/_webhooks/` to clearly identify their purpose as webhook receivers. This prefix isolates webhook handlers from public API routes.
* The path after `/_webhooks/` **SHOULD** include an identifier for the webhook producer or system sending the callbacks. For example, a service consuming SendGrid webhooks might use paths like `/_webhooks/sendgrid/...`. This makes it obvious which external system the endpoint is for.
* If a single service consumes multiple distinct webhook event types from the same producer, the path **MAY** further include an event category to differentiate them. For example:

  ```
  POST /_webhooks/sendgrid/email-sent  
  POST /_webhooks/sendgrid/email-opened  
  POST /_webhooks/sendgrid/email-clicked  
  ```

Each endpoint could handle a different event from SendGrid. In cases where the producer expects one endpoint for all events, a generic path can be used (e.g. `POST /_webhooks/sendgrid`) and the event type distinguished inside the payload.

Endpoints **SHOULD** continue to follow general API best practices **when possible** (e.g. use consistent naming and response handling), but it is understood that webhook consumer endpoints **MAY** deviate from normal RESTful patterns if required by the external provider (this is acceptable as long as it doesn’t introduce security risks or degrade the overall API consumer experience).

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
* Requests **MUST** include an [`Sps-Signature`](request-response.md#sps-signature) header that contains a cryptographic signature of the payload. This signature is used to verify the authenticity and integrity of the webhook request. The signature is computed using a shared secret established between the producer and consumer at webhook creation time, typically using HMAC with SHA-256. The has function should be specified in the header value: `SPS-Signature: sha256=<HMAC hex digest>`.
    * [`Sps-Signature-Timestamp`](request-response.md#sps-signature-timestamp) **MUST** be included to prevent replay attacks. This timestamp is created whenever a new webhook signature is created using the consumer provided secret, as opposed to the `eventTimestamp` that is created only once.
    * `Sps-Signature` **MUST** be computed with the consumer provided secret, and **MUST** be computed over the entire request body contents along with the `Sps-Signature-Timestamp` header. The signature is computed as follows: `HMAC-SHA256(secret, {SPS-Signature-Timestamp} + ":" + {Request-Body})`
    * Consumers **MUST** specify the shared secret when configuring the webhook subscription. The secret **SHOULD** be a minimum of 32 characters long, including a mix of uppercase, lowercase, numbers, and special characters to ensure sufficient entropy.
* [`Sps-Idempotency-Key`](request-response.md#sps-idempotency-key) **MUST** be included in the request headers to allow producers to safely retry webhook deliveries, while informing the consumers the same event is being deliver twice via matching idempotenty key header values. This key should match the `eventId` and is used to deduplicate events on the consumer side.

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