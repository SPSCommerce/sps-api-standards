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
* Webhook events **SHOULD** be configurable by the consumer via standard API endpoints implementing events as a RESTful style resource. 
* Webhook events **SHOULD** follow the same modeling and naming conventions as the rest of the API, identified in these API Standards. For example, use consistent data types and structures for common entities, and adhere to the standard property naming rules (e.g. **camelCase** for JSON property names). This consistency makes it easier for developers to intuit the structure of webhook data based on existing API knowledge.








------------------------

- what about webhook namining conventions?

### Webhook Payload Structure

When designing the JSON schema for webhook event payloads, use a clear, standardized structure. A well-structured payload improves developer experience and eases integration. The following conventions are **RECOMMENDED** for all webhook payloads:

* **Envelope with Standard Fields** – Each webhook payload **SHOULD** be an object that contains a few standard metadata fields *plus* a nested `payload` (or `data`) object with the event-specific details. For example, include:

  * An **event type** indicator, e.g. `eventType` – a string describing what event occurred. Use a consistent format for event types across your API (for instance, `"order.created"` or `"orderCreated"`). This allows consumers to easily distinguish and handle different kinds of events. The event type naming should be descriptive and may include a domain or resource name and action. For example, an order service might emit `order.created`, `order.cancelled`, etc.
  * A **timestamp** – the date/time when the event occurred (or was emitted) in ISO 8601 UTC format (e.g. `"2025-06-05T15:30:00Z"`). This field lets consumers know when the event happened and can be used for ordering or deduplicating messages. All timestamps **MUST** conform to the ISO 8601 standard and include a timezone (preferably UTC).
  * A **unique event identifier** – e.g. `eventId` or simply `id` – a UUID or similar unique string for the event instance. This is important for tracing and deduplication. Consumers can use the `eventId` to detect duplicate deliveries (in case of retries or redundant events) and to acknowledge specific events.
  * The **payload** object – a nested JSON object carrying the detailed data of the event. This typically contains the resource or data that changed, in a format similar to the resource’s representation in your API. For example, for an `order.created` event, the payload might include an order object with its ID, status, and relevant fields at the time of creation. Keeping this under a distinct `payload` (or `data`) field helps clearly separate metadata from the core event data.

* **Example –** A sample webhook JSON payload structure is shown below for an imaginary Order Created event:

  ```json
  {
    "eventType": "order.created",
    "timestamp": "2025-06-05T15:30:00Z",
    "eventId": "550e8400-e29b-41d4-a716-446655440000",
    "payload": {
      "orderId": "12345",
      "status": "NEW",
      "createdDateTime": "2025-06-05T15:30:00Z",
      "customerId": "ABC-001",
      "totalAmount": 250.00
    }
  }
  ```

  In this example, the top-level fields provide context: the type of event, a timestamp, and a unique ID. The `payload` contains the actual order data relevant to the event. All property names use camelCase in accordance with SPS naming standards.

* **Required vs Optional Fields** – Clearly define which fields in the payload are required. At minimum, the event type and timestamp **MUST** be present in every webhook. The unique event ID is also highly recommended as a required field. In the nested `payload`, include all information that a consumer will likely need to handle the event. If certain fields may not always be present (e.g. a value that might be null or omitted), document them as optional in the schema.

* **“Thin” vs “Full” Payloads** – Decide whether to send **full resource data** or a **thin payload** with just a reference/ID. Industry practice varies: some webhooks provide the entire resource (full payload), while others only send minimal info (like an ID) and require the consumer to call back for details. **Prefer** including all necessary data in the webhook to avoid forcing extra API calls, unless payload size or sensitivity is a concern. If using thin payloads, ensure the webhook includes enough information (such as resource ID and perhaps a URL to fetch more data) so the consumer can easily retrieve the full context.

* **Data Format** – Webhook payloads **MUST** be in JSON format (per SPS standards). Use standard JSON types for fields (string, number, boolean, object, array) as appropriate. Follow the SPS Serialization guidelines for data formats (e.g. date-time strings, number precision, etc.) to maintain consistency with the rest of the API.

### Authentication and Verification

Webhooks must be delivered securely and include a means for the consumer to verify that the request genuinely came from the expected producer (and not a malicious third party). The following are **required** or **strongly recommended** practices for webhook authentication:

* **HMAC Signatures** – All outgoing webhook requests **MUST** be cryptographically signed using a shared secret (established between the producer and consumer). The most common approach is to generate an HMAC signature (e.g. using SHA-256) of the webhook payload (or selected parts like the payload plus timestamp) using the secret key. The resulting signature is sent with the request in a header. For example, an API might include a header:
  `X-SPS-Signature: sha256=<HMAC hex digest>`
  Consumers would compute the HMAC on the received payload using the same secret and verify that it matches the signature in the header. This mechanism ensures the payload wasn’t tampered with in transit and that it came from someone with the shared secret. Industry experts consider webhook signatures a recommended best practice for security, as they are a simple and effective way to validate authenticity.
* **Secret Management** – Each subscribing consumer should have a unique secret/token for their webhooks. Never hard-code secrets in code or expose them publicly. Store them securely (as you would API keys) and only use them to sign/verify messages. If a secret is compromised or needs to be rotated, support a transition: e.g. generate a new secret and for a period sign webhooks with both old and new (using separate headers or a combined header format). The webhook header scheme should allow for key identification if multiple signatures are present (for instance, include a key ID or timestamp).
* **Additional Verification Fields** – It’s a good practice to include a timestamp in the signature or as a separate header (e.g. `X-SPS-Timestamp`) along with the HMAC. The consumer can then not only check the signature but also ensure the timestamp is recent (within a tolerated skew, say 5 minutes). This mitigates replay attacks by preventing old intercepted messages from being replayed. Some providers also include other metadata (like a unique delivery ID or event ID in headers) to assist with logging and verification.
* **Alternative Authentication** – If HMAC signatures are not feasible for some reason, at minimum the webhook **MUST** include a secret token in a header that the consumer can pre-validate. For instance, some webhooks send a known token in an `X-Webhook-Token` header which the consumer checks against a stored value. This is simpler but less robust than HMAC (since it doesn’t guarantee integrity of the payload). Avoid sending secrets as query parameters in the URL, as those can be logged or exposed; headers are preferred for secrets and signatures.
* **HTTPS and SSL** – As noted in the consumer section, all webhooks **must** be sent over HTTPS. The producer should enforce TLS 1.2+ and validate the TLS certificates of consumers if possible. This prevents man-in-the-middle attacks and eavesdropping. (Consumers should also enable strict HTTPS and certificate verification on their endpoint.)

### Delivery Protocol and Retry Behavior

To provide a reliable webhook experience, the delivery of events should follow a consistent protocol regarding HTTP headers, expected responses, and retry logic:

* **HTTP Headers** – Webhook requests **MUST** include appropriate HTTP headers:

  * `Content-Type: application/json; charset=utf-8` – to signify a JSON payload. Use UTF-8 encoding for text.
  * `User-Agent` – **SHOULD** be set to a recognizable string identifying the service and webhook (e.g. `"SPS-Order-Service-Webhook/1.0"`). This helps consumers filter or identify webhook traffic and aids debugging.
  * **Signature/Token Header** – as discussed above, include the `X-SPS-Signature` or equivalent header for authentication. If additional metadata is needed (timestamp, key id), include those in their own headers (e.g. `X-SPS-Signature-Timestamp`, `X-SPS-Key-Id`) or within the signature header format.
  * `X-Delivery-ID` or similar – **SHOULD** be included to carry a unique identifier for that delivery attempt (for example, a UUID for the webhook call). This is useful for tracing and for consumers to log and correlate webhook deliveries with their processing (and to detect duplicates across retries).
  * Any other standard headers as applicable (for example, some providers send `X-Event-Type` as a header in addition to the payload field, or `X-Event-Id` as a header). While not strictly required if the info is in the JSON body, these can be convenient. Use a consistent naming scheme (prefix custom headers with `X-` or a specific prefix like `X-SPS-`).
* **Response Handling** – The webhook producer expects the consumer’s endpoint to respond with an HTTP status code indicating receipt/success or failure:

  * A **2xx** status (200 OK, 204 No Content, etc.) from the consumer **SHALL** be treated as a successful delivery. This means the consumer has accepted the event. The producer can then consider the webhook delivered and will not retry that event.
  * **Non-2xx** statuses indicate the event was not successfully received. The producer **SHOULD** implement retries for robustness (details below). Certain status codes might be handled specially:

    * **410 Gone**: If a consumer responds with 410, it typically means the endpoint is no longer available or the subscription is gone. The producer **SHOULD NOT** retry in this case and **SHOULD** consider the webhook subscription cancelled or notify the subscriber that their endpoint is gone.
    * **404 Not Found**: Similar to 410, this likely means the endpoint is bad. Retries likely won’t help. The producer might attempt a few retries in case it was a temporary DNS issue, but generally 404 means the consumer needs to fix the URL. It may be treated as a permanent failure.
    * **429 Too Many Requests** or **503 Service Unavailable**: These suggest the consumer is overloaded or unavailable temporarily. The producer **SHOULD** retry these with backoff, as the condition may resolve.
    * **5xx** errors (500, 502, 504, etc.): Indicate server errors on the consumer side. These are presumably temporary, so **SHOULD** be retried with backoff.
    * **4xx** errors (other than 404/410/429): These typically indicate a bad request – possibly a problem with the webhook payload or an unauthorized request (401/403). These are not usually recoverable by retrying. The producer **MAY** retry a 4xx a limited number of times in case it was a transient issue, but generally these should trigger a review (the implementation may have a bug or the consumer endpoint is misconfigured).
* **Retry Policy** – Implement a robust retry mechanism for webhook deliveries that fail or time out:

  * Use **exponential backoff** between retries to avoid overwhelming a struggling endpoint. For example, after the initial attempt, wait 1 minute before the first retry, then 2 minutes, then 4 minutes, etc., or some similar progressive delay strategy.
  * **Limit the number of retries.** The webhook producer **MUST NOT** retry indefinitely. A common approach is to try a few times (e.g. 3 to 5 attempts in total) over an increasing time window. For instance, attempt 1 (initial), then retries at \~1 min, \~2 min, \~5 min, \~10 min intervals. If all fail, the event is considered undeliverable. The exact numbers can vary, but they should be documented and consistent.
  * **Log and alert** on failed deliveries. The producer system should keep track of webhook outcomes. If after the final retry an event still fails, that should be recorded (for later analysis or audit). It’s often useful to surface these failures to the subscribing developer (e.g. via email or a dashboard) so that they know their endpoint is not working and can take action.
  * **No infinite blocking** – Webhook calls should have a reasonable timeout (e.g. 10 seconds). If the consumer doesn’t respond in that time, treat it as a failure and trigger a retry. This prevents the producer service from hanging indefinitely on a bad/slow endpoint.
  * **Concurrent deliveries** – If order of events matters, the producer **SHOULD** avoid sending events out-of-order to the same subscriber. Typically, this means if an earlier event is still in retry, you might serialize delivery to that endpoint. However, if events are independent, concurrent delivery is acceptable. Document any ordering guarantees (or lack thereof). In general, consumers should be built to handle out-of-order or duplicate deliveries gracefully, as network conditions can vary.

### Versioning and Evolving Webhooks

Webhook event schemas and behavior should remain as stable as possible over time. Changes will impact all subscribers, so handle versioning carefully:

* **Non-Breaking Changes** – Adding new fields to webhook payloads (that are optional) is usually considered backward-compatible. Consumers written to ignore unknown fields will continue working. When introducing such changes, update the documentation and consider notifying consumers (especially if the changes are significant or could affect signature computation if not implemented properly – e.g. if signatures cover the whole payload, adding fields can change the signature outcome for consumers computing it themselves).
* **Breaking Changes** – Removing or renaming fields, or changing the semantic meaning or structure of the payload, is a breaking change and **MUST** be treated as a new version of the webhook. Options for versioning include:

  * **Event Type Versioning**: Publish the changed event under a new event type name (for example, if originally `order.created`, a breaking update might introduce `order.created.v2` or `order.created_v2`). The new event type would have its own schema. Consumers can choose to subscribe/handle the new events when ready. The old event type could be deprecated but should ideally continue to be sent for consumers who haven’t migrated, for some deprecation period.
  * **Separate Webhook URL or Path**: If using an explicit version in URLs (not common, since the consumer provides the URL), you could ask consumers to register a new URL for v2 events. More typically though, versioning is communicated via the event payload or headers, not the URL.
  * **Version Field**: Alternatively, include a version indicator in the payload (e.g. `"version": 2` at the top level). This is straightforward, but requires every consumer to implement logic branching on version – this approach is less common compared to using distinct event types, but it’s a possible strategy.
* **Parallel Support and Sunset** – When releasing a new webhook version, consider supporting the old and new versions in parallel for a time to allow consumers to migrate. Communicate clearly in documentation and possibly through developer announcements that a new payload version is available and the timeline for deprecation of the old one (if applicable).
* **Consistency with API Versioning** – If the rest of the API has a versioning scheme (e.g. v1, v2), align webhook versions in a way that makes sense. Webhooks sometimes can be version-agnostic (they just report events), but if the event content corresponds to resources from a versioned API, then a v2 API might naturally produce v2 webhook payloads. Use your judgment to keep versioning logical and easy to understand.
* **Schema Evolution Best Practices** – Design webhook schemas with evolution in mind. For instance, prefer using object properties for extensibility rather than array positions, so new properties can be added later. Avoid making breaking changes unless absolutely necessary – instead, extend schemas or introduce new events. Remember that each change can be costly for all integrators to update their code.

### Additional Best Practices for Developer Experience

Beyond the core specifications, adopting certain practices can greatly enhance the developer experience for those building against your webhooks:

* **Provide Testing Tools** – Offer a way for developers to simulate webhooks. This could be a “Send Test Event” feature in a developer portal or sandbox environment, or even examples in documentation that show how to manually trigger sample webhooks (e.g. via `curl`). This helps consumers validate that their endpoint handling logic works before going live.
* **Clear Documentation and Examples** – Documentation should include comprehensive examples of each webhook event: what triggers it, the exact JSON structure of the payload (with field descriptions), and example values. If certain fields have only a few possible values (enums), list them. If the webhook signing method is used, document how to verify the signature with a code snippet. The goal is to make integration as straightforward as possible.
* **Consistent Naming and Conventions** – Maintain consistency across all webhooks in your product. Use similar patterns for naming events (e.g. don’t mix `order.created` and `Invoice_Paid` with different styles – pick a convention for eventType formatting and stick to it). Ensure that common fields (like `timestamp`, `eventId`, `payload`) are named and used uniformly in all webhook payloads. This consistency reduces cognitive load for developers using multiple webhooks.
* **Idempotency and Deduplication** – Encourage consumers to implement idempotent processing for webhook events. Given that retries or duplicate events may occur, consumers should safely handle receiving the same event more than once. Providing the `eventId` in the payload (as recommended) facilitates this – consumers can track which IDs they’ve processed. Similarly, if an event could be delivered out of order, consumers should not make assumptions about sequence based solely on time; they may need to query the API for the latest state if order is critical.
* **Error Handling and Monitoring** – As a producer, monitor the success/failure of webhook deliveries. If certain consumers consistently fail, consider reaching out or disabling their subscription after a threshold to protect your system. Provide consumers with tools or information to debug issues – for example, include error messages in logs or allow them to query the status of their webhook deliveries (some systems expose an endpoint or UI to check recent delivery attempts and their statuses).
* **Security Best Practices** – Regularly review the security of your webhook implementation. For example, ensure secrets used for signing are rotated periodically, use secure random generation for any tokens, and do not expose sensitive personal data in webhook payloads unless necessary (remember that webhook data will be stored on the consumer side, which might not have the same protections as your system). Also, consider documenting the expected source IP ranges for your webhooks (if known/stable), so consumers can whitelist your calls as an extra layer of security.
* **Consider Industry Standards** – When SPS-specific policies do not dictate a certain approach, look to industry standards for guidance. For instance, the [CloudEvents](https://cloudevents.io/) specification defines a standard structure for event payloads (with fields like `type`, `source`, `id`, `time`, etc.), and the emerging **Standard Webhooks** convention provides guidance on payload design, signatures, headers, and operational considerations. You don’t have to adopt a standard wholesale, but aligning with well-known patterns can make your webhooks more familiar to developers. For example, using HMAC signatures as described earlier is an industry-standard approach, and including event timestamps and types in payloads is a universally followed practice.
* **Feedback and Iteration** – Finally, treat webhook design as an iterative process. Gather feedback from integrators on your webhooks: Are the payloads providing the right data? Are the events named intuitively? Is the retry policy reasonable? Use this feedback to refine the standards over time. A great developer experience with webhooks can significantly increase the adoption of your API, as it enables smooth real-time integration between systems.

By adhering to these standards for defining webhook schemas, authentication, payload structure, delivery policies, versioning, and best practices, SPS teams will ensure that webhooks across all services are implemented in a consistent, secure, and developer-friendly manner. Webhooks should feel like a natural extension of the SPS API ecosystem – as reliable and well-documented as any other API endpoint. Following the guidance above will help achieve a high level of consistency and quality for all webhook integrations.

**Sources:** *SPS API Standards documentation and industry best-practice references including Standard Webhooks guidelines and security recommendations for webhook implementations.*


https://eventdestinations.org/???

Alerts for destination failures
At-least-once event delivery guarantee
Auto-disabling of failing destinations after too many failures
Manual retries via UI or API
Filtering based on payload content