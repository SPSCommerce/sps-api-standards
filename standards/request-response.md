# Request & Response

## Overview

Alongside [URL Structure](url-structure.md), and other standards, the request and response standards help in part to enable and clarify our APIs as uniform interfaces.

```
// REQUEST
POST /articles HTTP/1.1
User-Agent: api-standards-v1
Content-Type: application/json
{
    "foo": "bar"
}
 
// RESPONSE
HTTP/1.1 200 OK
Content-Type: application/json
{
    "fooResult": "not-bar"
}
```

- All HTTP Requests and Responses to an API **MUST** support HTTP1.1. HTTP/1.0 is specifically unsupported given its age and limited protocol capability.

```note
Using HTTP/1.0 as a request to any API may result in unintended side effects. For example, the API may send back an error if it is unsupported, or your response might be returned as HTTP/1.1.

NOTE: For the examples available in this documentation the HTTP protocol version will be intentionally left out.
```

## HTTP Status Codes

### General

RESTful services use HTTP status codes to specify the outcomes of HTTP method execution. HTTP protocol specifies the outcome of a request execution using an integer and a message. The number is known as the status code and the message as the reason phrase. The reason phrase is a human-readable message used to clarify the outcome of the response. HTTP protocol categorizes status codes in ranges.

- An API **MUST** return HTTP response codes in conformance with [RFC-2616](https://www.ietf.org/rfc/rfc2616.txt) and common usage in addition to these standards.
When responding to API requests, the following status code ranges **MUST** be used. 

| Range | Reason | Meaning |
| --- | --- | --- |
| `2xx` | Success | Successful execution. It is possible for a method execution to succeed in several ways. This status code specifies which way it succeeded. |
| `4xx` | Client Error | Usually, these are problems with the request, the data in the request, invalid authentication or authorization, etc. In most cases, the client can modify their request and resubmit. |
| `5xx` | Server Error | The server was not able to execute the method due to a site outage or software defect. 5xx range status codes **SHOULD NOT** be used for validation or logical error handling. |

```note
"HTTP applications are not required to understand the meaning of all registered status codes, though such understanding is obviously desirable. However, applications **MUST** understand the class of any status code, as indicated by the first digit, and treat any unrecognized response as being equivalent to the x00 status code of that class, with the exception that an unrecognized response **MUST NOT** be cached" ([RFC 2616](https://www.ietf.org/rfc/rfc2616.txt)).
```

- Success **MUST** be reported with a status code in the `2xx` range.
- Reason phrases **MUST NOT** be modified or customized. The default reason phrases deliver an industry-standard experience for API consumers. Use the response payload as necessary to communicate further reasoning.
- HTTP status codes in the `2xx` range **MUST** be returned only if the complete code execution path is successful. There is no such thing as partial success.
    - [Bulk synchronous](bulkd.md) request operations **MUST** return a `200`` status code with a response body indicating failures as part of the payload for each processed entity.
- Failures **MUST** be reported in the `4xx` or `5xx` range. This is true for both system errors and application errors.
- All status codes used in the `4xx` or `5xx` range **MUST** return standardized error responses as outlined under [Errors](errors.md).
- A server returning a status code in the `2xx` range **MUST NOT** return any error models defined in [Errors](errors.md), or any HTTP status code, as part of the response body. 
- For client errors in the `4xx` code range, the response message **SHOULD** provide enough information for the client to be able to determine what caused the error and how to fix it.
- For errors in the `4xx/5xx` code range, the response **MUST** contain an error message following [Errors](errors.md). The message **SHOULD** limit the amount of information to avoid exposing internal service implementation details to clients. This is true for both external-facing and internal APIs. Service developers should use logging and tracking utilities to provide additional information.
- By default, `3xx` status codes **SHOULD NOT** be used during API development. Exceptional usage use cases might be considered and require additional design discussion.

### Supported Status Codes

- All REST APIs **MUST** use only the following status codes. APIs **MUST NOT** return a status code that is not defined here to express contractual or defined output of the endpoint. API Consumers may receive other status codes not presented because other infrastructure and proxies live in between the API and the consumer or other operational and platform constraints may return certain status codes. <a name="sps-invalid-status-code" href="#sps-invalid-status-code"><i class="fa fa-check-circle" title="#sps-invalid-status-code"></i></a>
- APIs may not use all status codes defined, or only require a subset for their operations.
- When an API must respond to a request that has potentially multiple valid status code responses, the API **SHOULD** respond with the "more-specific" status code. The "more-specific" status code is generally the highest number in the associated range.

<hr />

#### 200 OK

**Description**: Generic successful execution. Default successful response code to read requests.

**Example Usage**: Any type of request, unless more specific code fits better.

<hr />

#### 201 Created

**Description**: Used as a response to `POST` method execution to indicate the successful creation of a resource. If the resource was already created (by a previous execution of the same method, for example), then the server should return the status code `200 OK`.

**Example Usage**: Used as response code to `POST` requests and indicates successful creation of the resource. This request is NOT IDEMPOTENT, meaning each request with the same body will create a new entity on the server (exception is when entity identifier specified by client-side, then a `409` response code should be used for subsequent requests).

<hr />

#### 202 Accepted

**Description**: Used for asynchronous method execution to specify the server has accepted the request and will execute it at a later time.

**Example Usage**: Used as a response request that initiates an asynchronous request.

<hr />

#### 204 No Content

**Description**: The server has successfully executed the method, but there is no entity-body to return.

**Example Usage**: Indicates where there is no payload returned as part of the response. Usually, `PUT` and `DELETE` requests don't have the payload body returned.

<hr />

#### 400 Bad Request

**Description**: The request could not be understood by the server. Use this status code to specify:
- The data as part of the payload cannot be converted to the underlying data type.
- The data or parameters is not in the expected data format.
- The required field is not available.
- Simple data validation type of error.

**Example Usage**: Used to inform errors with accepting incoming requests that:
- Incorrectly formatted
- Does not correspond to the expected schema
- Has invalid values that do not correspond to defined data types of the field

<hr />

#### 401 Unauthorized

**Description**: The request requires valid authentication and none was provided or expired. Note the difference between this and `403 Forbidden`.

<hr />

#### 403 Forbidden

**Description**: The client is not authorized to access the resource, although it may have valid credentials. The API could use this status code to handle business-level authorization failures. For example, the requestor does not have permission to request the organization's information.

<hr />

#### 404 Not Found

**Description**: The server has not found anything matching the request URI. This either means that the URI is incorrect OR the resource is not available. For example, it may be that no data exists in the database at that key.

<hr />

#### 405 Method Not Allowed

**Description**: The server has not implemented the requested HTTP method. This is typically the default behavior for API frameworks.

<hr />

#### 406 Not Acceptable

**Description**: The server **MUST** return this status code when it cannot return the payload of the response using the media type requested by the client. For example, if the client sends an Accept: application/xml header and the API can only generate `application/json`, the server **MUST** return `406`.

<hr />

#### 409 Conflict

**Description**: This response is sent when a request conflicts with the current state of the server.

**Example Usage**: Used to indicate conflicting situations:
- `PUT` with a payload that violates the uniqueness of the attribute that requires unique values. Example: "Unique name of the organization"
- `POST` of the entity with predefined "Id" attribute value which already exists in the system.

<hr />

#### 412 Precondition Failed

**Description**: The client has indicated preconditions in its headers which the server does not meet.

**Example Usage**: Used to indicate when conditional requests on methods not fulfilled with one of the preconditions:
- `If-Unmodified-Since` specified, modification date earlier than specified.
- `If-Match specified`, but its value on the server is different.
- `If-None-Match` specified, but the server has matching data.

<hr />

#### 415 Unsupported Media Type

**Description**: The server **MUST** return this status code when the media type of the request's payload cannot be processed. For example, if the client sends a `Content-Type: application/xml header`, but the API can only accept `application/json`, the server **MUST** return a `415`.

<hr />

#### 428 Precondition Required

**Description**: The origin server requires the request to be conditional. This response is intended to prevent the 'lost update' problem, where a client `GETs` a resource's state, modifies it, and `PUTs` it back to the server, when meanwhile a third party has modified the state on the server, leading to a conflict.

**Example Usage**: Used to indicate when requests required to be conditional:
- `If-Unmodified-Since` is missing when expected.
- `If-Match` is missing when expected.
- `If-None-Match` is missing when expected.

<hr />

#### 429 Too Many Requests

**Description**: The server **MUST** return this status code if the rate limit for the user, the application, or the token has exceeded a predefined value. Defined in Additional HTTP Status Codes [RFC 6585](https://datatracker.ietf.org/doc/html/rfc6585).

**Retriable**: Yes

<hr />

#### 500 Internal Server Errors

**Description**: This is either a system or application error and generally indicates that although the client appeared to provide a correct request, something unexpected has gone wrong on the server. A `500` the response indicates a server-side software defect or site outage. 
- `500` **MUST NOT** be used for client validation or logic error handling.

**Retriable**: Yes

<hr />

## HTTP Headers

### Standard Headers

The purpose of HTTP headers is to provide metadata information about the body or the sender of the message and provide instructions to help negotiate between client and server in a uniform, standardized, and isolated way.

- HTTP header names **MUST NOT** be case sensitive.
- HTTP headers **SHOULD** only be used for the purpose of handling cross-cutting concerns, such as security, traceability, monitoring, cachability, and state validation.
- Headers **MUST NOT** include API or domain-specific values data. For example, `Location`, `Content-Type` are headers that imply instructions between client and server but do not include domain-specific data in the header, that is content often communicated through the body of a request or a response.
- Service Consumers and Service Providers **SHOULD NOT** expect that a particular HTTP header is available. It is possible that an intermediary component in the call chain can drop an HTTP header. This is the reason business logic **SHOULD NOT** be based on HTTP headers.
- Service Consumers and Service Providers **SHOULD NOT** assume the value of a header has not been changed as part of HTTP message transmission.

```note
**CLARIFICATION**: The following list of headers IS NOT meant as a complete list of headers that you as an API Consumer may send and/or receive. Rather it is intended as general guidelines of headers API Implementations are specifically meant to support for RESTful purposes.
```

<hr />

#### [Accept](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept)

**Type**: Request

**Support**: **MUST**

**Description**: This request header specifies the media types that the API client is capable of handling in the response.
- Systems issuing the HTTP request **SHOULD** send this header.
- Systems handling the request **SHOULD NOT** assume it is available.
- The header may **OPTIONALLY** be used to indicate a custom serialization model using the `vnd` specific format along with the Content-Type (See MIME Types below).
- The header **MUST NOT** indicate the version of the API contract and apply to content serialization formatting only.

**Example(s)**:

```
// CORRECT
Accept: application/json
Accept: text/html, application/xhtml+xml
```

<hr />

#### [Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)

**Type**: Request/Response

**Support**: **MUST**

**Description**: This request/response header indicates the media type of the request or response body.
- API client **MUST** include with the request if the request contains a body, e.g. it is a POST, PUT, or PATCH request.
- API developer **MUST** include it with a response if a response body is included (not used with 204 responses).
- If the content is a text-based type, such as JSON, the Content-Type **MAY** include a character-set parameter. The character-set **MUST** be UTF-8 if provided. 

Refer further to MIME-Types below for additional details and supported types.

**Example(s)**:

```
// CORRECT
Content-Type: application/json
Content-Type: application/json; charset=UTF-8
```

<hr />

#### [Location](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location)

**Type**: Response

**Support**: **MUST**

**Description**: This response-header field is used to redirect the recipient to a location other than the Request-URI for completion of the request or identification of a new resource.
- Usage of the `Location` header is **MUST** only be used with response codes 201 or 3xx. <a name="sps-invalid-location-header" href="#sps-invalid-location-header"><i class="fa fa-check-circle" title="#sps-invalid-location-header"></i></a>
- Relative URLs **MUST** be made relative to the URL host.

**Example(s)**:

```
// CORRECT
Location: /users/profiles/1
Location: https://api.spscommerce.com/users/profiles/1
 
// INCORRECT
Location: /profiles/1 // missing "users" root resource, after host
```

<hr />

#### [User-Agent](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent)

**Type**: Request

**Support**: **MUST**

**Description**: The User-Agent header helps API implementations to identify certain groups of consumers of their API.
- `User-Agent` **MUST** be provided for all API requests for identification purposes. Requests without a valid User-Agent **MUST** return a 403 response status code.
- `User-Agent` **SHOULD** contain product information, product version, and other comments as necessary to identify an API Consumer. Provided product versions should indicate major version numbers only in accordance with `User-Agent Client Hints`. Common syntax: 

```
User-Agent: <product>/<product-major-version> <comment>
User-Agent: my-calling-service/2
```

```note
It would be appropriate to supply a general `403` at the platform or central ingress if no `User-Agent` header is provided.
```

**Example(s)**:

```
// CORRECT
User-Agent: Mozilla/5.0 (platform; rv:geckoversion) Gecko/geckotrail Firefox/firefoxversion
```

<hr />

#### [Authorization](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization)

**Type**: Request

**Support**: **MUST**

**Description**: More information at [Authentication](authentication.md). <a name="sps-authorization-missing" href="#sps-authorization-missing"><i class="fa fa-check-circle" title="#sps-authorization-missing"></i></a>

**Example(s)**:

```
// CORRECT
Authorization: Bearer <token>
 
// INCORRECT
Authorization: <token>
Authorization: bearer <token>
Authorization: Basic <token>
```

<hr />

#### [Content-Language](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Language)

**Type**: Both

**Support**: OPTIONAL

**Description**: This request/response header is used to specify the language of the content.
- This header **MUST** be optional, and the default locale **MUST** be `en-US` when none is provided. <a name="sps-default-content-language" href="#sps-default-content-language"><i class="fa fa-check-circle" title="#sps-default-content-language"></i></a>
- API clients **SHOULD** identify the language of the data using the `Content-Language` header.
- APIs **SHOULD** provide this header in the response.

**Example(s)**:

```
// CORRECT
Content-Language: en-US
Content-Language: en-US, de-DE, en-CA
```

<hr />

#### [ETag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag)

**Type**: Response

**Support**: OPTIONAL

**Description**: The `ETag` response-header field provides the current value of the entity tag for the requested variant. Used with `If-Match`, `If-None-Match` and `If-Range` to implement optimistic concurrency control. Refer to `GET` request below.
- `ETag` **SHOULD** be returned for `GET` requests where the individual resource has a specific version.
- `ETags` **MAY** be returned more granularly for resource collections as described under [ETags with Collections](collections.md#etags-with-collections).

**Example(s)**:

```
// CORRECT
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

<hr />

#### [If-Match/If-None-Match](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Match)

**Type**: Request

**Support**: OPTIONAL

**Description**: Used in association to the response value within an `ETag` header. It can be a CSV list containing multiple values if needed.
- Values of the header **SHOULD** always be derived from the value returned from a response with an `ETag` header.

**Example(s)**:

```
// CORRECT
If-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

<hr />

#### [Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)

**Type**: Response

**Support**: OPTIONAL

**Description**: Responses **MUST** return no-store header value when sensitive data is present.

**Example(s)**:

```
// CORRECT
Cache-Control: max-age=<seconds>
Cache-Control: max-stale[=<seconds>]
Cache-Control: min-fresh=<seconds>
Cache-Control: no-cache
Cache-Control: no-store
Cache-Control: no-transform
Cache-Control: only-if-cached
```

<hr />

#### [Access-Control-*](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin)

**Type**: Response

**Support**: OPTIONAL

**Description**: The headers for Access-Control are intended for usage with CORS-enablement.
- `Access-Control-Allow-Origin` **SHOULD NOT** specify a wildcard ("*") for any API used by internal or external consumers.
- `Access-Control-Allow-Methods` **MUST NOT** use a wildcard ("*").
- `Access-Control-Allow-Headers` **MUST NOT** use a wildcard ("*") and **MUST** only be used to specify custom headers or headers used outside of the CORS-safelisted request headers.
- `Access-Control-Expose-Headers` **MUST NOT** use a wildcard("*") and **MUST** only be used to specify custom headers or headers used outside of the CORS-safelisted response headers.
- `Access-Control-Allow-Credentials` **MUST NOT** be set to `true` if `Access-Control-Allow-Origin` is wildcarded ("*").
- `Access-Control-Max-Age` **SHOULD NOT** exceed 7200 seconds (2 hours) due to browser caps and limitations.

**Example(s)**:

```
// CORRECT
Access-Control-Allow-Origin: https://cdn.domain.com/
Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS
 
// INCORRECT
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: *
```

### Custom Headers

- Custom Headers **MAY** be used and created as necessary.
- Custom Headers **MUST** only be used if not in conflict by a similar name or similar function to the standard headers or other widely used custom headers.
- Custom Headers **MUST** abide by the same rules and guidelines as standard headers.
- Custom Header names **MUST NOT** be longer than 50 characters. <a name="sps-invalid-custom-header-format" href="#sps-invalid-custom-header-format"><i class="fa fa-check-circle" title="#sps-invalid-custom-header-format"></i></a>
- Custom Header names **MUST** only contain alpha, numeric, and dash characters: [a-zA-Z0-9-] <a name="sps-invalid-custom-header-format" href="#sps-invalid-custom-header-format"><i class="fa fa-check-circle" title="#sps-invalid-custom-header-format"></i></a>
- Custom Headers **MUST** start with the prefix `Sps-` (Note: do not prefix with `X-`). <a name="sps-no-x-headers" href="#sps-no-x-headers"><i class="fa fa-check-circle" title="#sps-no-x-headers"></i></a>
- Custom Headers **SHOULD NOT** include sensitive data that applies to customers/employees or is subject to legal, regulatory, contractual, and business requirements. <a name="sps-sensitive-data-in-headers" href="#sps-sensitive-data-in-headers"><i class="fa fa-check-circle" title="#sps-sensitive-data-in-headers"></i></a>

```
// CORRECT
Sps-Claims: { "Custom": "Value" }
Sps-User: 123456789012345678901234567890
Sps-Meta-Information: YourInformation/Goes/Here
 
// INCORRECT
X-Sps-User: 123456789012345678901234567890
```

```note
The usage of non-standard headers is not considered custom headers. For example, your API may consume or interact with other infrastructure outside of the contract specification for your service, such as `X-Forwarded-Host` or `X-Request-ID`, these are appropriate to continue using, but would not expect to identify them in your Open API spec for example. As such these types of headers not relevant to REST are intentionally left out of this documentation.
```

#### Sps-Cors-Error

**Type**: Response

**Support**: OPTIONAL

**Description**: A [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) error from an invalid request will return a non-200 status code, but it can be difficult for an API consumer to understand the reason that their request was unsuccessful. A custom header provides more detailed information to the consumer on why their CORS preflight OPTIONS request was rejected.

- The header **MUST** be added when a `CORS` `OPTIONS` request is rejected.
- A response with this header **SHOULD** indicate a status code of `403 - Forbidden`.
- The header **MUST** contain one of the following values:
    - __bad origin__ - Indicates to the consumer that the provided request header `Origin` did not match the approved list of source hostnames.
    - __bad method__ - Indicates to the consumer that the provided request header `Access-Control-Request-Method` contained request methods that are not allowed.
    - __bad header__ - Indicates to the consumer that the provided request header `Access-Control-Request-Headers` contained request header names that are not allowed.

**Example(s)**:

```
// CORRECT
Sps-Cors-Error: bad origin
```

<hr />

#### Sps-Execution-Context

**Type**: Both

**Support**: OPTIONAL

**Description**: The Execution Context header provides a standard method of indicating the dataflow context that a request should be processed with. This is used to differentiate or test changes in customer configuration of non-production data. This isolates the version of the configuration state used in a request and allows identifying transactions that should leverage a specific tagged or aliased configuration set.

- A request without the presence of this header **MUST** indicate that the execution context is under the `production` dataflow and customer configuration, if applicable to this API.
- The header value contains any dynamic __string__ value representing a named configuration or tagged dataflow preset.
    - __preprod__ - Well-known value used to represent non-production customer configuration and can be supported as a static mode in some legacy services without full dynamic support. Usage of dynamically named configuration sets is preferred.
    - __prod__ - Well-known value used to represent production customer configuration and can be supported as a static mode in some legacy services without full dynamic support. Usage of dynamically named configuration sets is preferred. When no request or response header is provided for `Sps-Execution-Context` this is interpreted as the default value.
- An invalid or unsupported header value provided **MUST** result in a `400 - Bad Request` following standard [error format](errors.md#400-bad-request).
- The header value **MUST** be at minimum 1 character in length and  **MUST NOT** exceed a maximum length of 100 characters.
- The header value **MUST** be case-insensitive.
- The header value **SHOULD** contain human-readable tag for the context.
- The header **SHOULD** be propagated to any outgoing requests to retain the context for downstream usage.
- The header **MUST** be supplied in the response for every request containing the header, and match the original requested value.
- The header **SHOULD** be supplied in the response for every request in general, if applicable to the API, even if just defaulting to __prod__.

**Example(s)**:

```
// CORRECT
Sps-Execution-Context: prod
Sps-Execution-Context: preprod
Sps-Execution-Context: customer-testing
Sps-Execution-Context: example-customer-configuration

// INCORRECT
Sps-Execution-Context:                  // values must be at least a character long.
Sps-Execution-Context: 1                // valid, but SHOULD be human-readable.
```

<hr />

#### Sps-Service

**Type**: Both

**Support**: OPTIONAL

**Description**: The `Sps-Service` header conveys metadata about the requesting asset or service within the ecosystem. It includes details such as the requesting service's identifier, name, and potentially additional attributes. This information supports logging, monitoring, and auditing by identifying the service responsible for the request. Unlike the `User-Agent` header, which describes the client or user initiating the request, `Sps-Service` focuses on the ownership and identity of the service making the request.

- The header **MUST** follow a key-value format with `=` as the delimiter. Attributes **MUST** be delimited by a semicolon `;`.
- The header key names **MUST** follow `camelCase` naming conventions.
- The header value **MUST** provide the service identifier using the key name `id` as a valid UUID format.
- The header value **SHOULD** provide the service name using the key name `name`, represented by the following regex: `[a-z0-9-]{1,60}`.
- The header value **MAY** extend or include additional attributes as necessary for the service or application.
- The header value **MUST** represent the attributes of a single service or application (not multiple).
- The header **SHOULD** be used alongside `User-Agent` to provide complete requesting context.
- The header **SHOULD** be used for all requests made to a service by the requesting service or application (either server or client side).
- Library or Service metadata and versions **MUST NOT** be included in this header. This information **SHOULD** be included in the `User-Agent` header.
- Requests with an invalid `Sps-Service` formatted header **SHOULD** return a `400` response status code.
- Requests **MAY** validate the `Sps-Service` header `id` value against the associated authority or service registry. Validation failures **MUST** return a `400` indicating the reason.

```
// CORRECT
Sps-Service: id=d4f885c5-2196-49c0-ba69-bc70008585ad;name=transform-service                   // standard representation with id and name. Suffixing delimiter not required.
Sps-Service: id=d4f885c5-2196-49c0-ba69-bc70008585ad; name=transform-service                  // strip out whitespace between delimiters and keys.
Sps-Service: id=d4f885c5-2196-49c0-ba69-bc70008585ad                                          // permissable, but discouraged, if name is unknown (implementation specific).
Sps-Service: id=d4f885c5-2196-49c0-ba69-bc70008585ad;name=transform-service;custKey=thing     // extending with custom attributes

// INCORRECT
Sps-Service-Id: id=d4f885c5-2196-49c0-ba69-bc70008585ad                                       // incorrect header name
Sps-Service: id=24                                                                            // id must be in format of UUID. 
Sps-Service: id=d4f885c5-2196-49c0-ba69-bc70008585ad;custom-key=hello                         // attribute keys must be camelCase.
Sps-Service: id=d4f885c5-2196-49c0-ba69-bc70008585ad;appVersion=1.2.3                         // version does not relate to ownership, but rather user-agent.
Sps-Service: id=d4f885c5-2196-49c0-ba69-bc70008585ad;id=f5f844f3-6177-4474-b845-6d5cd9b00f48  // cannot have duplicate keys, or multiple ids represented.
Sps-Service: id=d4f885c5-2196-49c0-ba69-bc70008585ad;name=myService                           // name does not meet pattern requirements with an uppercase letter.
Sps-Service: id=d4f885c5-2196-49c0-ba69-bc70008585ad,name=myService                           // HTTP headers are delimited by semicolons when values describe a single entity, not commas (used for lists).
```

<hr />

#### Sps-Idempotency-Key

**Type**: Request

**Support**: OPTIONAL

**Description**: An idempotency key is a unique value generated by the client which the resource server uses to recognize subsequent retries of the same request. The HTTP `Idempotency-Key` request header field can be used to carry an "idempotency key" to make non-idempotent HTTP methods such as POST or PATCH fault-tolerant (related to expired RFC for [Idempotency HTTP Header Field](https://datatracker.ietf.org/doc/html/draft-idempotency-header-01)). An API must persist the Idempotency-Key in a stateful way to manage idempotency. It is common to include the idempotency key as part of the primary key or as a secondary index for the resource.

- The header value **MUST NOT** be shorter than 20 characters or longer than 255.
- The header value **MUST** not be used for `GET` requests.
- The header value **MUST** follow this regex format: `[a-z0-9-]{20,255}`.
- An API **MUST** return a `400` status code when the header value is in an invalid format with an appropriate error message.
- If an action is idempotent, an API **MUST** return a `2xx` status code on conflict.
- If an action is not idempotent, an API **MUST** return a `409` status code on conflict.
- An API **MAY** treat this as the final primary ID of the resource or as part of the ID.
- The header value **SHOULD** typically be a V4 UUID as a string or another random string with enough entropy to avoid collisions.
- The header value **MUST** be generated by the client or client library.

```
// CORRECT
Sps-Idempotency-Key: d4f885c5-2196-49c0-ba69-bc70008585ad
Sps-Idempotency-Key: d4f885c5-2196-49c0-ba69-bc70008585ad-custom
 
// INCORRECT
Sps-Idempotency-Key: a                          // not enough entropy, and below minimum character length.
Sps-Idempotency-Key: KG5Lxw!@#$&*()FBepaKHyUD   // non-url-safe special characters can be limiting for usage or later reference
```

## MIME Types

### Standard MIME Types

[MIME](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types) (or Media) types indicate the nature and format of a request or response body when supplied as a Content-Type header in an HTTP request.

- MIME types **MUST** be supplied in the `Content-Type` header for any request or response that includes a body.
- MIME types **SHOULD** be provided by API consumers as an `Accept` header to indicate formats supported by the client when content negotiation is required.
    - `application/json` **SHOULD** be the default return MIME type when an `Accept` header includes `application/json` and other possible types for content negotiation.
- Resource endpoints **MUST** support `application/json` as the content type for both request/response bodies (refer to "Standard Headers").
    - API endpoints that are responsible for returning data in different formats **MUST** support other content types depending on the requirements, in addition to `application/json`.
- MIME types provided **MUST** follow customization standards or be a common MIME type indicated in the [IANA Media Types](https://www.iana.org/assignments/media-types/media-types.xhtml).
- Requests made with unsupported `Content-Types` (and MIME types) **MUST** result in a standard error response with a `415` status code following the standard error response format.
- Request and Response media type formats **MUST NOT** be implied using extensions on resources (i.e. `.json` or `.xml`). Instead, use the standard resource path with the appropriate `Content-Type` header. <a name="sps-no-resource-extensions" href="#sps-no-resource-extensions"><i class="fa fa-check-circle" title="#sps-no-resource-extensions"></i></a>

```
// JSON SCENARIO                            // JSON media type MUST always be supported
// REQUEST
POST /articles                              // creating an article
Accept: application/json                    // this client making the request can only accept content back as JSON
Content-Type: application/json              // the serialization type of the request body
{
    "name": "New Article",
    "content": "The Best article because..."
}
 
// RESPONSE
201 OK
Content-Type: application/json              // the serialization type of the response body (negotiated based on common Accept header list).
Location: /articles/3
{
    "id": 3
}
 
// XML SCENARIO                             // other media types can be supported if needed, such as XML
// REQUEST
POST /articles                              // creating an article
Accept: application/xml                     // this client making the request can only accept content back as JSON or XML
Content-Type: application/json              // the serialization type of the request body can be different than the response, but likely rare.
{                                           // if the content-type provided for the request is not known or supported then this should result in a 415 status code.
    "name": "New Article",
    "content": "The Best article because..."
}
 
// RESPONSE
201 OK
Content-Type: application/xml       // the serialization type of the response body (negotiated based on common Accept header list, defaults to JSON if available).
Location: /articles/3
<response>
    <id>3</id>
</response>
```

### Custom MIME Types

- Custom MIME types **MUST** only be used to define the formatting or schema for the version of data that it is associated with. It is not a mechanism for versioning the contract of the Request, Response, URL, Headers, Query Parameters, etc.
    - Custom MIME types **MUST** use the following format: `application/vnd.sps-*+(json|xml)` (i.e. `application/vnd.sps-model+json`), where `*` can be adjusted accordingly. <a name="sps-invalid-mime-type" href="#sps-invalid-mime-type"><i class="fa fa-check-circle" title="#sps-invalid-mime-type"></i></a>
    - Custom MIME types **SHOULD** be limited in their usage as it provides an extra layer of complexity beyond the default `application/json` media type.
    - Documentation of your API **MUST** be clearly updated to indicate the purpose and usage of different MIME types on an endpoint.
    - Version information can be included in custom MIME types following the wildcard (i.e. `application/vnd.sps-model.v1+json`). The version number must follow the `v` indicator.

```
// INCORRECT
Content-Type: application/whatever                  // "whatever" does not follow the custom MIME type rules.
Content-Type: sps/vnd.whatever+json                 // Custom content type MUST be specified as an "application" type of content.
Content-Type: application/vnd.whatever              // MUST include "sps" as vendor prefix name, along with the format type of xml or json.
 
// CORRECT
Content-Type: application/vnd.sps-model+json        // Custom type indicates request or response has a body with model information specified in JSON format.
Content-Type: application/vnd.sps-model+xml         // Custom type indicates request or response has a body with model information specified in XML format.
Content-Type: application/vnd.sps-model.v1+json     // Version can be included in the custom Content Type if needed.
Content-Type: application/json                      // Default standard for all APIs to use.
```

```
// STANDARD JSON SCENARIO                   // JSON media type MUST always be supported
// REQUEST
POST /articles                              // creating an article
...
Content-Type: application/json              // the serialization type of the request body
{
    "name": "New Article",
    "content": "The Best article because..."
}
 
// RESPONSE
201 OK
Content-Type: application/json              // the serialization type of the response body (negotiated based on common Accept header list).
Location: /articles/3
{
    "id": 3
}
 
// ALTERNATIVE CUSTOM MIME TYPE             // a custom MIME type is used to indicate another JSON schema for creating articles // REQUEST
POST /articles                              // creating an article
Accept: application/json
Content-Type: application/vnd.sps-article-import.v1+json    // custom content-type indicates a standards method for importing articles from another source location
{                                                           // in this example that might be a third party provider or another system.
    "system": "third-party",
    "url": "https://example.com/old-system/article/10
}
 
// RESPONSE
201 OK
Content-Type: application/json              // the serialization type of the response body is unchanged, as it returns regular JSON still.
Location: /articles/3
{
    "id": 3
}
```

## HTTP Methods

### Overview

- Operations **MUST** use only the HTTP methods as outlined. <a name="sps-invalid-http-method" href="#sps-invalid-http-method"><i class="fa fa-check-circle" title="#sps-invalid-http-method"></i></a>
- Custom HTTP Methods **MUST NOT** be used.
- Operations **MUST** respect the identified idempotency and body for each method.
- Operations **SHOULD** use consistent schema's across different HTTP Methods when specifying the same addressable resource.

| Method | Description  | Request Body  | Response Body  | Idempotency  |
|--------|---|---|---|---|
| GET    | Return the current value of an object. | **MUST NOT**  | **MUST**  | **MUST** be Idempotent - requesting the same URL repeatedly results in the same response assuming the state is unmodified by separate requests.    |
| POST   | Create a new object based on the data provided, or submit a command. | **SHOULD**  | **SHOULD**  | **SHOULD NOT** be Idempotent - requesting the creation of a new object on a collection results in a different response and/or Location header each time. Exceptions might be when POST Method is used more as an Action as opposed to a RESTful Verb.  |
| PUT    | Replace an object, or create a named object, when applicable. | **MUST**  | **MUST NOT**  | **MUST** be Idempotent - requesting the replacement of an object in its entirety should execute repeatedly resulting in the exact same response.  |
| DELETE | Delete an object. | **MUST NOT**  | **MUST NOT**  | **SHOULD** be Idempotent - requesting the delete of an object should result in the same response even if deleted twice. It is desirable, when the application state allows for it, that a successful response should not be indicated for objects that never existed. This may only be possible if your API is tracking deletions or using soft-deletes.  |
| PATCH  | Apply a partial update to an object. | **MUST**  | **MUST NOT**  | **SHOULD** be Idempotent - requesting a partial update to an object often results in idempotent results. However since a partial update, unlike a PUT, may result in additional counters or behaviors in an object, it is not always idempotent in some cases.  |
| HEAD   | Return metadata (HTTP Headers) of an object for a `GET` response. Resources that support the `GET` method **MAY** support the `HEAD` method as well. | **MUST NOT** | **MUST NOT**  | **MUST** be Idempotent  |
| OPTIONS| Get information about a request. | **MUST NOT**  | **MUST NOT**  | **MUST** be Idempotent  |

```note
**Idempotency**: An idempotent method means that the result of a successfully performed request is independent of the number of times it is executed.
```

### HTTP Method to Status Code Mapping

For each HTTP method with only the status codes specified below, API developers **SHOULD** use only status codes marked as "X" in this table. Status codes not present in the table maybe be used across any HTTP Method under the correct behaviors identified for that status code above.

| Status Code               | GET | POST | PUT | PATCH | DELETE | HEAD | OPTIONS |
|---------------------------|-----|------|-----|-------|--------|------|---------|
| 200 OK                    |  X  |  X   |     |   X   |        |  X   |   X     |
| 201 Created               |     |  X   |     |       |        |      |         |
| 202 Accepted              |     |  X   |  X  |   X   |   X    |      |         |
| 204 No Content            |     |  X   |  X  |   X   |   X    |      |   X     |
| 409 Conflict              |     |  X   |  X  |   X   |   X    |      |         |
| 412 Precondition Failed   |     |      |  X  |   X   |   X    |      |         |

### GET

The purpose of the `GET` method is to retrieve a resource.

- HTTP `GET` Method **MUST NOT** accept a request body. <a name="sps-request-get-invalid-body" href="#sps-request-get-invalid-body"><i class="fa fa-check-circle" title="#sps-request-get-invalid-body"></i></a>
- HTTP `GET` Method **MUST** return a response body. <a name="sps-response-get-missing-body" href="#sps-response-get-missing-body"><i class="fa fa-check-circle" title="#sps-response-get-missing-body"></i></a>
    - The response body **SHOULD NOT** produce a complex response that requires unreasonable hierarchy traversal. Beyond three levels of an object reference becomes unwieldy and **SHOULD** be avoided for API designs in favor of additional resources.
- HTTP `GET` Method **MUST NOT** modify the state of the API resources as it is for retrieval purposes only.
- HTTP `GET` Method **MUST** be idempotent.
- HTTP `GET` Method **MUST** return a `404` status code when a resource is not present by a specified identifier unless there is intent to expose a soft-delete status.
- HTTP `GET` Method may return ETag Header and support conditional headers such as `If-None-Match` for targeted caching of resources based on state.
- HTTP `GET` Method returning a collection:
    - **MUST** return a `200` status code when returning the results of an empty collection (not a `404` or `204`).
    - **MUST** return a complex object following the [collection](collections.md) standards, and not an array as the root body object. <a name="sps-invalid-response-body" href="#sps-invalid-response-body"><i class="fa fa-check-circle" title="#sps-invalid-response-body"></i></a>


```
// REQUEST
GET /articles/2
 
// RESPONSE
200 OK
Content-Type: application/json
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
{
    "id": 2,
    "name": "Article 2",
    "content": "My nice content for the article"
}
```

```warning
Consider the size of your `GET` request parameters. Without the ability to include parameters in a request body, the size of your query parameters may become unwieldy and highly inconvenient. In certain situations, it may be appropriate to use a `POST` Method to pass along request parameters as the body. Also, refer to size considerations on the URL as a whole in [URL Structure](url-structure.md). 
```

### POST

The primary purpose of `POST` is to create a resource. It may also be used for non-RESTful actions when no other HTTP Method makes sense (see Actions in [URL Structure](url-structure.md)).

- HTTP `POST` Method that results in the successful creation of the resource:
    - **MUST** indicate so with a `201` status code.
    - **MUST** return a reference to the resource created either as a link or a resource identifier in the response body or Location header or both.
    - may **OPTIONALLY** return the newly created entity as a whole reference if it is different or resolved in comparison to the request body, understanding that it may not contain an `ETag` or appropriate cache-control headers the same as a GET request.
- HTTP `POST` Method **MUST** return a `200` status code when successful with non-RESTful-based actions (see Actions in [URL Structure](url-structure.md)).
- HTTP `POST` Method response body, if returned, **MUST NOT** be a primitive, but rather a complex object with the identifier or other response information.
- HTTP `POST` Method **MUST** indicate asynchronous acceptance of the request that is without resolution as a `202` status code.
- HTTP `POST` Method **MUST** return a `404` if other addressable resources in the URL do not exist as parents to the existing collection.
- HTTP `POST` Method **SHOULD** return a `409` when a resource cannot be created because it would result in an invalid state for a parent resource or be in violation of any constraints, including any database or persistent storage constraints.

```
// REQUEST
POST /articles
Content-Type: application/json
{
    "name": "New Article",
    "content": "The Best article because..."
}
 
// RESPONSE
201 OK
Content-Type: application/json
Location: /articles/3
{
    "id": 3
}
```

### PUT

The primary purpose of `PUT` is to replace or update an entity as a whole.

- HTTP `PUT` Method **MUST** replace an entity in its entirety, as it relates to the preceding collection specified in the URL. 
- HTTP `PUT` Method **MUST NOT** be used to create a new entity on a collection unless the collection as a whole is being replaced with new child entities on it.
- HTTP `PUT` Method **MUST** be idempotent.
- HTTP `PUT` Method **SHOULD** return a `204` status code for any success responses (implying no response body is appropriate), other than asynchronous acceptance with a `202` status code.
- HTTP `PUT` Method **SHOULD NOT** return a response body that is an echo of the request body.
- HTTP `PUT` Method **SHOULD** return a `409` when a resource cannot be updated because it would result in an invalid state for the resource, or be in opposition to any constraints, including any database or persistent storage constraints.

```
// REQUEST
PUT /articles/3
Content-Type: application/json
{
    "id": 3,
    "name": "New Article",
    "content": "Updated content for the article..."
}
 
// RESPONSE
204 OK
```

- HTTP `PUT` Method **SHOULD** be used on a resource collection when you intend to replace the entire collection with a new one, such as a bulk update scenario.
- HTTP `PUT` Method **SHOULD** be used to create a new resource when all aspects of the creation, including its primary identifier, are known by the client, and a fully addressable URL can be referenced with it. 

```
//// INCORRECT!!!
// REQUEST
PUT /articles
Content-Type: application/json                      // THE ID IS NOT KNOWN AT TIME OF CREATION
{                                                   // THE IDS IS RETURNED IN THE RESPONSE
    "name": "New Article",                          // SO CREATION INSTEAD SHOULD OCCUR AS A POST REQUEST
    "content": "The Best article because..."
}
 
// RESPONSE
201 OK
Content-Type: application/json
Location: /articles/3
{
    "id": 3
}
 
//// CORRECT
// REQUEST
PUT /books/ISBN-10-0199535566                       // CREATION VIA PUT REQUEST IS ALLOWED SINCE THE ISBN IS A WELL-KNOWN PRIMARY KEY
Content-Type: application/json                      // ITS MORE APPROPRIATE TO PROCESS THIS CREATE SIMILAR TO AN UPDATE OF THE WELL-KNOWN ITEM
{                                                   // THIS IS VERY COMMON WITH EXISTING WORLD UNIQUE IDENTIFIERS.
    "isbn": "ISBN-10-0199535566",
    "name": "My Book",
    "content": "The Best book because..."
}
 
// RESPONSE
201 OK
```

- HTTP `PUT` Method **SHOULD** use an `ETag` (Entity Tag) for state validation, if required, to ensure that the entity has not been modified since it was last retrieved by a client before replacing or updating it in its entirety.
    - `ETags` **MUST** always be retrieved from a server HTTP `GET` Request, provided in the `ETag` Response Header.
    - `ETags` **MUST** always be provided to the HTTP `PUT` Method via the `If-Match` Request Header.
    - `ETags` **MUST** be treated as opaque values.
    - State Validation failure in an HTTP `PUT` Method as a result of an invalid `If-Match` `ETag` value should result in a `412` status code (Precondition Failed).
    - HTTP `PUT` Method may not require the `If-Match` header for state validation, but if it does, and the header is not provided it should return a `428` status code (Precondition Required).

```
// REQUEST
PUT /articles/3
If-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
Content-Type: application/json
{
    "id": 3,
    "name": "New Article",
    "content": "Updated content for the article..."
}
 
// RESPONSE
204 OK
```

```note
**Consider**: Further information on resource versioning with `ETags` may be helpful, along with understanding the [differences between strong and weak ETags](https://developers.google.com/gdata/docs/2.0/reference#ResourceVersioning).
```

### DELETE

The primary purpose of `DELETE` is to remove an addressable entity in its entirety.

- HTTP `DELETE` Method **MUST NOT** accept a request body. <a name="sps-request-delete-invalid-body" href="#sps-request-delete-invalid-body"><i class="fa fa-check-circle" title="#sps-request-delete-invalid-body"></i></a>
- HTTP `DELETE` Method **MUST** return a status code of `204` when successfully responding with no response body. <a name="sps-response-delete-invalid-body" href="#sps-response-delete-invalid-body"><i class="fa fa-check-circle" title="#sps-response-delete-invalid-body"></i></a>
- HTTP `DELETE` Method **SHOULD** be idempotent in repeated deletions when the state is effectively available to identify previous delete requests and may return status code `204` instead of `404` as long as the resource no longer exists with the desired state.
- HTTP `DELETE` Method **SHOULD** return a `409` when a resource cannot be deleted because that would result in an invalid state for that resource representation, including related children resources that may be required to be deleted first, where cascade deletion is not present.
- HTTP `DELETE` Method **SHOULD** take advantage of the same `ETag` state validation, if required, for `DELETE` requests as described under HTTP `PUT` Method.

```
// REQUEST
DELETE /articles/3
 
// RESPONSE
204 OK
```

The [request body of a `DELETE` is not allowed](https://stackoverflow.com/questions/299628/is-an-entity-body-allowed-for-an-http-delete-request). At times an individual may intend to perform a [bulk `DELETE`](bulk.md) action and want to provide a request body or need information about the response of a `DELETE`. You will find that in this case, a `PATCH` request against the collection is an appropriate alternative.

```
// REQUEST
PATCH /articles
Content-Type: application/json 
{
    "op": "delete",   
    "ids": [1,2,3]
}
 
// RESPONSE
204 OK
```

### PATCH

The primary purpose of `PATCH` is to update parts of an entity and not replace them entirely.

- HTTP `PATCH` Method **MUST** only update parts or certain fields of an entity in compliance with JSON Merge Patch semantics.
    - Fields that are not intended to be updated **MUST** not be provided in the request body.
    - Fields that are intended to be removed, **MUST** be set to `NULL` in the request body.
    - Arrays that are provided in a `PATCH` request **MUST** replace the entire array on the destination field.
- HTTP `PATCH` Method **MUST NOT** be used to create a new entity on a collection.
- HTTP `PATCH` Method **SHOULD** return a `204` status code for any success responses, other than asynchronous acceptance with a `202` status code.
- HTTP `PATCH` Method **SHOULD NOT** return a response body that is an echo of the request body if they are the same. It is acceptable to return a similar resolved entity as a convenience from calling the GET method.
- HTTP `PATCH` Method **SHOULD** return a `409` when a resource cannot be updated because it would result in an invalid, or be in opposition to any constraints, including any database or persistent storage constraints.
- HTTP `PATCH` Method **SHOULD** be used when updating attributes of a resource collection.
- HTTP `PATCH` Method **SHOULD** take advantage of the same `ETag` state validation, if required, for `PATCH` requests as described under HTTP `PUT` Method.

```
// REQUEST
// OTHER FIELDS ARE LEFT OUT OF THE REQUEST THAT WE DO NOT INTEND TO UPDATE
PATCH /articles/3
Content-Type: application/json
{
    "content": "Updated only this field...",    // THIS FIELD IS UPDATED WITH THE NEW CONTENT
    "notes": null,                              // THIS FIELD IS SET TO NULL, AND ANY CONTENT IN NOTES IS REMOVED.
    "categories": [ "pets", "flowers" ]         // THIS ARRAY IS REPLACED WITH THESE 2 ITEMS
}
 
// RESPONSE
204 OK
```

```note
**Consider**: For updating multiple entities in bulk on a given resource refer to [bulk operations](bulk.md).
```

### HEAD

The HTTP `HEAD` request is used to check the attributes (e.g. availability, size, last modification date) of a resource without downloading or deserializing all the content. For example, you may use a `HEAD` option to validate that a resource exists, by receiving a `200` status code, without having to stream the entire contents of the resource or article. If the resource did not exist a status code of `400` may be returned by example. Execution of an HTTP HEAD request may result in a workload being completed to determine the idempotent response status code effectively.

- HTTP `HEAD` Method **MUST** be idempotent.
- HTTP `HEAD` Method **SHOULD** return the same status code as a GET Method would return under the same addressable resource. 
- HTTP `HEAD` Method **SHOULD** return a `200` even though there is no response body if that matches the typical status code returned by the `GET` Method request. <a name="sps-request-head-invalid-body" href="#sps-request-head-invalid-body"><i class="fa fa-check-circle" title="#sps-request-head-invalid-body"></i></a>
- HTTP `HEAD` Method **MUST NOT** contain a request or response body. <a name="sps-response-head-invalid-body" href="#sps-response-head-invalid-body"><i class="fa fa-check-circle" title="#sps-response-head-invalid-body"></i></a>
- HTTP `HEAD` Method **MUST NOT** be used to update the state of any resource or to retrieve the actual resource itself.
- HTTP `HEAD` Method **MUST NOT** be used with any sensitive data.
- HTTP `HEAD` Method responses **MUST** be cacheable.

```
// REQUEST
HEAD /articles/2
 
// RESPONSE
200 OK
```

### OPTIONS

The `OPTIONS` method is used to describe communication options for the target resource.

- HTTP `OPTIONS` Method **MUST** be idempotent.
- HTTP `OPTIONS` Method **MUST** only provide information on how to interact with a resource.
- HTTP `OPTIONS` Method **MUST NOT** contain a request or response body. <a name="sps-request-options-invalid-body" href="#sps-request-options-invalid-body"><i class="fa fa-check-circle" title="#sps-request-options-invalid-body"></i></a>
- HTTP `OPTIONS` Method **MUST NOT** be used to update the state of any resource or to retrieve the actual resource itself.
- HTTP `OPTIONS` Method **MUST NOT** be used with any sensitive data.
- HTTP `OPTIONS` Method responses **MUST NOT** be intended to be cached.
- HTTP `OPTIONS` Method used for `CORS` integration **MUST** provide standard `CORS` headers for access control (`Access-Control-Allow-*`).
    - Rejected `CORS` requests should return a `403` status code, including the [Sps-Cors-Error](#sps-cors-error) custom header indicating the reason for rejection.

```
// REQUEST
OPTIONS /articles/2
 
// RESPONSE
200 OK
Allow: GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS
Access-Control-Allow-Origin: https://api.spscommerce.com
Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS
Access-Control-Allow-Headers: Content-Type
```
