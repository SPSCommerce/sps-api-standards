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
"HTTP applications are not required to understand the meaning of all registered status codes, though such understanding is obviously desirable. However, applications **MUST** understand the class of any status code, as indicated by the first digit, and treat any unrecognized response as being equivalent to the x00 status code of that class, with the exception that an unrecognized response **MUST NOT** be cached" ([RFC 2626](https://www.ietf.org/rfc/rfc2616.txt)).
```

- Success **MUST** be reported with a status code in the `2xx` range.
- Reason phrases **MUST NOT** be modified or customized. The default reason phrases deliver an industry-standard experience for API consumers. Use the response payload as necessary to communicate further reasoning.
- HTTP status codes in the `2xx` range **MUST** be returned only if the complete code execution path is successful. There is no such thing as partial success.
    - Bulk request operations **MUST** return a 200 status code with a response body indicating failures as part of the payload for each processed entity, unless all processing failures due to a system issue, in which case its appropriate to issue standard `5xx` error message.
- Failures **MUST** be reported in the `4xx` or `5xx` range. This is true for both system errors and application errors.
- All status codes used in the `4xx` or `5xx` range **MUST** return standardized error responses as outlined under [Errors](errors.md).
- A server returning a status code in the `2xx` range **MUST NOT** return any error models defined in [Errors](errors.md), or any HTTP status code, as part of the response body. 
- For client errors in the `4xx` code range, the response message **SHOULD** provide enough information for the client to be able to determine what caused the error and how to fix it.
- For errors in the `4xx/5xx` code range, the response MUST contain an error message following [Errors](errors.md). The message **SHOULD** limit the amount of information to avoid exposing internal service implementation details to clients. This is true for both external-facing and internal APIs. Service developers should use logging and tracking utilities to provide additional information.
- By default, `3xx` status codes **SHOULD NOT** be used during API development. Exceptional usage use cases might be considered and require additional design discussion.

### Supported Status Codes

- All REST APIs **MUST** use only the following status codes. APIs **MUST NOT** return a status code that is not defined here to express contractual or defined output of the endpoint. API Consumers may receive other status codes not presented because other infrastructure and proxies live in between the API and the consumer or other operational and platform constraints may return certain status codes. 
- APIs may not use all status codes defined, or only require a subset for their operations.
- When an API must respond to a request that has potentially multiple valid status code responses, the API **SHOULD** respond with the "more-specific" status code. The "more-specific" status code is generally the highest number in the associated range.