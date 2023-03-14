# Webhooks

## Overview

Webhooks are automated messages sent from apps when something happens, typically used to integrate two disconnected systems together, such as with a third-party provider. They have a message—or payload—and are sent to a unique URL configured by the customer or user. Webhooks are an advantage in an API as they are almost always faster than polling for an updated status or parsing to determine which events or changes are new within a timeline. 

- Services **SHOULD** implement push notifications, HTTP callbacks, and other event notifications via webhooks.
- Services **MAY** implement HTTP callback endpoints as a webhook consumer from other systems and/or APIs.

```note
Push notification via HTTP Callbacks, often called Web Hooks, to publicly-addressable servers.
```

## Webhook Consumer

Webhook consumption is necessary to integrate with other first-party and third-party systems. Often building specific API endpoints is necessary to receive webhook-specific payloads, headers and authorization in which the API producer cannot control or change. These webhook specific integration endpoints are usually not RESTful resources and may be required to deviate from expected design patterns within this API Style Guide. As a result webhook consumers should recognize this and organize webhook consuming endpoints accordingly.

Webhook consuming endpoints:
- **MAY NOT** follow API Standards or best practices when it does not pose inherit security risks or affect the rest of the API design consistency and experience.
- **MUST** be marked as **internal** usage only in the design specification (i.e. in Open API Spec, this would translate to `x-internal: true`). <a name="sps-webhooks-internal" href="#sps-webhooks-internal"><i class="fa fa-check-circle" title="#sps-webhooks-internal"></i></a>
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

```note
Webhook producer standards and best practices are still under development. Some relevant starting material: [Microsoft REST API Guidelines: Webhooks](https://github.com/Microsoft/api-guidelines/blob/master/Guidelines.md#14-push-notifications-via-webhooks)
```