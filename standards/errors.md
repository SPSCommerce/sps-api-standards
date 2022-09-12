# Errors

## Overview

APIs have a set of error status codes designed to inform the client about validation issues and errors. While the HTTP protocol itself has a decent amount of error [status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) defined, it is necessary to standardize on a response body JSON schema format that is universally consistent across your API to communicate error-specific details and context. This object includes general and more detailed information (if applicable) which allows API clients to understand the reason for the error and perform corrective action. Some of the errors, caused by the current operational state of the API, are retriable and may not require corrective actions before sending the same request. 

Just like an HTML error page that shows a useful error message to a visitor, an API should provide a useful error message in a known consumable format for both machine and human. The representation of an error should be no different than the representation of any resource, just with its own set of fields. Returning an error response is the only [exception to path resources returning a different shape](url-structure.md) in the response body dynamically because of the adjusted status code (`4xx` & `5xx`) & `Content-Type`.

## Error Schema

- All `4xx` & `5xx` series of status codes **MUST** come with a consumable JSON error representation as defined in this error schema.
- The error schema defined here **MUST NOT** be returned for a `2xx` series status code (including with the usage of the `207` multi-status code, which is restricted).
- An error or validation response **MUST** follow the error object schema and **SHOULD** have response `Content-Type` of: `application/problem+json`.
- An error or validation response **MUST** include a `requestId` attribute that is used to correlate requests.
- If the request includes a request identifier as an X-Request-ID header, it **MUST** be used as `requestId` value and `X-Request-ID` header should be carried over to the response.
- If a more detailed context is necessary to describe a problem or multiple problems, it **MUST** include the context extension, indicating validation violation per each field or object (if applicable).
- Optional attributes of the error schema that remain `null` **MUST** be excluded from the response payload during the serialization process.
- Error messages **SHOULD** be descriptive and grammatically correct in single or multiple sentence format, so they can be surfaced by API clients without the need for modification.
- All content in the error response **MUST NOT** expose implementation details as part of API error response (i.e. stack trace). Using the provided schema, references, and request ids can be used to gather debug information at other authorized locations.

```
// REQUEST
POST /articles HTTP/1.1
User-Agent: api-standards-v1
Content-Type: application/json
{
    "foo": "bar",
    "foo2": null
}
 
// RESPONSE
HTTP/1.1 403 Forbidden
Content-Type: application/problem+json                          // Should return updated content-type indicating the change in JSON schema returned.
{   
    "title": "You do not have enough credit.",                  // REQUIRED (string): Short human-readable title of the error that occurred.
    "status": 403,                                                // REQUIRED (number): Number representation of the error and MUST match the response status code.
    "detail": "Your current balance is 30, but that costs 50.", // OPTIONAL (string): Description or detailed human-readable message about the error that occurred.
                                                                // The detail should focus on helping the client correct the problem, rather than giving debug information (non machine parseable).
    "instance": "/account/12345/msgs/abc",                      // OPTIONAL (URI): Specific URI/Resource that represents a link to the issue, or reference from "detail" (specific account, resource, log record, etc)
                                                                // This may be an absolute or relative URL. It can often represent the exact resource URL of the requested resource path.
    "type": "https://example.com/probs/out-of-credit",          // OPTIONAL (URI): URI to human-readable and actionable info about the error reported.
                                                                // This may reference existing readable web page about the error that exists in DevCenter or other public location that is relevant.
                                                                // This may be an absolute or relative URL. Using this field indicates a business problem that is a sub-type of the provided status code.
                                                                // The referenced material is in association to a domain or business problem, and not purely technical in nature.
    "requestId": "979f3d3b-a04a-43d7-b55f-8d5609b48783",        // REQUIRED (string): Request ID that correlates original request to response and other events in the API (for example logs).
                                                                // Request ID should be carried over from the X-Request-ID header of the request, otherwise, it's automatically generated GUID value.
    "context": [                                                // OPTIONAL (array): List of objects providing additional context and detail on sub-reasons for the validation issue or error.
         {
            "code": "INPUT_NOT_NULL",                           // OPTIONAL (string): Short, machine-readable, name of the validation error that occurred.
                                                                // To infer that these are machine codes, usage MUST be CAPITAL_SNAKE_CASE.
            "message": "Attribute 'foo2' must not be null.",  // REQUIRED (string): Human-readable details or message specific error about the request failure.
             ....                                               // EXTENSIONS: (any): The context list object can be extended with additional properties as needed for your application.
        }
    ]
    ...                                                         // EXTENSIONS: (any): The root can be extended with additional properties as needed for your application.
                                                                // Extending the format is an indication you should consider creating a new "type". See RFC.
}
```

## Problem Details

The [problem details RFC 7807](https://datatracker.ietf.org/doc/html/rfc7807) provides a basis for standardizing schema for an API experiencing an issue. It provides standardized naming at the root level properties with guidance on how to use each of those attributes while leaving them optional. This means the schema is very flexible and extensible for specific domains. SPS uses this as a starting point and adds additional requirements and optional standardization to provide a detailed context where appropriate. RFC 7807 can be found in use across the API development community. Take a [look at the introduction](https://www.youtube.com/watch?v=UNdUjBqsUqg&t=1s), and additionally find reusable parsers across core language ecosystems:

- [Typescript: http-problem-details-parser](https://github.com/PDMLab/http-problem-details-parser/)
- [Java + Spring Boot: problem-spring-web-starter](https://shekhargulati.com/2019/12/10/problem-details-for-http-apis-with-spring-boot/)
- [NET Core: ProblemDetails Class in ASP.NET Core Web API](https://code-maze.com/using-the-problemdetails-class-in-asp-net-core-web-api/)
- [Python: python-httproblem](https://github.com/cbornet/python-httpproblem)
- [Go: go-problemdetails](https://github.com/mvmaasakkers/go-problemdetails)

The Problem Details Working Group and ongoing issues with requests are also available at [core-problem-details](https://github.com/core-wg/core-problem-details).

## Common Errors

- Common error responses identified here **SHOULD** be followed for matching status codes and details. It is important that the responses that our services return are consistent in voice and message where possible. 
- Deviations are expected and **MUST** be in alignment with the defined error schema. 
- Any listed response **MAY** also be extended with any field or context.

The following common error examples assume the following request unless indicated otherwise:

```
PUT /documents/203
Authorization: Bearer <token>
Content-Type: application/json
{
    ... request object schema irrelevant...
}
```

### 400 Bad Request

```
// EXAMPLE 1: Generic Bad Request
// No "type" property is defined since no additional details beyond a bad request is known (there is no sub type).
// REQUEST
PUT /documents/203
...
// RESPONSE
HTTP/1.1 400
Content-Type: application/problem+json
{
    "title": "Bad Request",
    "status": 400,
    "requestId": "b6d9a290-9f20-465b-bcd3-4a5166eeb3d7",
    "instance": "/documents/203"
}
 
// -----------------------------------------------------------------------------------
 
// EXAMPLE 2: Validation Bad Request
PUT /documents/203
If-Match: empty
{
    "id": 203,
    "email": "testuser",
    "description": "",
    "tags": [],
    "pages": [
        {
            "number": 320,
            "description: ''
        }
    ]
}
 
// RESPONSE
HTTP/1.1 400
Content-Type: application/problem+json
{
    "title": "Invalid Data",
    "status": 400,
    "detail": "Missing content or invalid input provided.",
    "instance": "/documents/203",
    "requestId": "b6d9a290-9f20-465b-bcd3-4a5166eeb3d7",
    "context": [
        {
            "code": "INPUT_INVALID",                                   
            "message": "Attribute 'email' must be a valid email address.",
            "field": "email",                                              
            "source": "body",                                              
            "value": "testuser"                                            
        },
        {
            "code": "INPUT_NOT_NULL",
            "message": "Attribute 'reason' must not be null.",
            "field": "reason",
            "source": "body"
        },
        {
            "code": "INPUT_NOT_BLANK",
            "message": "Attribute 'description' must not be blank.",
            "field": "description",
            "source": "body"
        },
        {
            "code": "INPUT_NOT_BLANK",
            "message": "Attribute 'pages[0].description' must not be blank.",
            "field": "pages[0].description",
            "source": "body"
        },
        {
            "code": "INPUT_NOT_EMPTY",
            "message": "Attribute 'tags' must not be empty.",
            "field": "tags",
            "source": "body"
        },
       {
            "code": "INPUT_MIN_VALUE",
            "message": "Attribute 'limit' must be greater than or equal to 1.",
            "field": "limit",
            "source": "query",
            "value": "0"
        },
        {
            "code": "INPUT_MAX_VALUE",
            "message": "Attribute 'pages[0].number' must be less than or equal to 300.",
            "field": "pages[0].number",
            "source": "body",
            "value": "1"
        }, 
        {
            "code": "INPUT_MIN_VALUE",
            "message": "Attribute 'limit' must be greater than or equal to 1.",
            "field": "limit",
            "source": "query",
            "value": "0"
        },
        {
            "code": "INPUT_INVALID",
            "message": "Attribute 'If-Match' does not match the expected format.",
            "field": "If-Match",
            "source": "header",
            "value": "empty"
        }
    ]
}
```

### 401 Unauthorized

```
// EXAMPLE 1: Generic 401 Error
// RESPONSE
HTTP/1.1 401
Content-Type: application/problem+json
{
    "title": "Unauthorized",
    "status": 401,
    "detail": "Request is not authenticated for resource '/documents/203'.",
    "instance": "/documents/203",
    "requestId": "b6d9a290-9f20-465b-bcd3-4a5166eeb3d7"
}
 
// EXAMPLE 2: Request Does Not Supply Authorization Header
// RESPONSE
HTTP/1.1 401
Content-Type: application/problem+json
{
    "title": "Invalid Request",
    "status": 401,
    "detail": "Access token was not provided in an Authorization header.",
    "instance": "/documents/203",
    "requestId": "b6d9a290-9f20-465b-bcd3-4a5166eeb3d7"
}
 
// -----------------------------------------------------------------------------------
 
// EXAMPLE 3: Supplied Authorization Token is Invalid or Expired
// RESPONSE
HTTP/1.1 401
Content-Type: application/problem+json
{
    "title": "Invalid Token",
    "status": 401,
    "detail": "The access token provided is invalid or expired.",
    "instance": "/documents/203",
    "requestId": "b6d9a290-9f20-465b-bcd3-4a5166eeb3d7"
}
```

### 403 Forbidden

```
// RESPONSE
HTTP/1.1 403
Content-Type: application/problem+json
{    
    "title": "Forbidden",
    "status": 403,
    "detail": "Request does not have permissions to access '/documents/203'.",
    "instance": "/documents/203",
    "requestId": "b6d9a290-9f20-465b-bcd3-4a5166eeb3d7"
}
```

### 404 Not Found

```
// REQUEST
GET /documents/203

// RESPONSE
HTTP/1.1 404
Content-Type: application/problem+json
{
    "title": "Not Found",
    "status": 404,
    "detail": "Requested resource '/documents/203' not found.",    
    "instance": "/documents/203",    
    "requestId": "b6d9a290-9f20-465b-bcd3-4a5166eeb3d7"
}
```

- Assuming the endpoint exists, when a resource identifier in the URL path is not found while addressing a child, the resource not found **SHOULD** be indicated in the `detail` message and the `instance` accordingly:

```
// REQUEST
GET /documents/203/instances

// RESPONSE
HTTP/1.1 404
Content-Type: application/problem+json
{
    "title": "Not Found",
    "status": 404,
    "detail": "Requested resource '/documents/203' not found.",    
    "instance": "/documents/203",    
    "requestId": "b6d9a290-9f20-465b-bcd3-4a5166eeb3d7"
}
```

### 405 Method Not Allowed

```
// RESPONSE
HTTP/1.1 405
Content-Type: application/problem+json
{    
    "title": "Method Not Allowed",
    "status": 405,
    "detail": "Requested HTTP method 'POST' is not allowed.",    
    "instance": "/documents/203",
    "requestId": "b6d9a290-9f20-465b-bcd3-4a5166eeb3d7"
}
```

### 406 Not Acceptable

```
// RESPONSE
HTTP/1.1 406
Content-Type: application/problem+json
{    
    "title": "Not Acceptable",
    "status": 406,
    "detail": "Accept 'application/xml' is not supported.",    
    "instance": "/documents/203",
    "requestId": "b6d9a290-9f20-465b-bcd3-4a5166eeb3d7"
}
```

### 409 Conflict

```
// RESPONSE
HTTP/1.1 409
Content-Type: application/problem+json
{    
    "title": "Conflict",
    "status": 409,
    "detail": "Resource '/documents/203' already exists.",      // This message may change if the 409 represents a different outcome or detail.    
    "instance": "/documents/203",
    "requestId": "b6d9a290-9f20-465b-bcd3-4a5166eeb3d"
}
```

### 412 Precondition Failed

```
// RESPONSE
HTTP/1.1 412
Content-Type: application/problem+json
{    
    "title": "Precondition Failed",
    "status": 412,
    "detail": "Header 'If-Match' was invalid.",     
    "instance": "/documents/203",
    "requestId": "b6d9a290-9f20-465b-bcd3-4a5166eeb3d"
}
```

### 415 Unsupported Media Type

```
// RESPONSE
HTTP/1.1 415
Content-Type: application/problem+json
{    
    "title": "Unsupported Media Type",
    "status": 415,
    "detail": "Content-Type 'application/xml' is not supported.",       
    "instance": "/documents/203",
    "requestId": "b6d9a290-9f20-465b-bcd3-4a5166eeb3d"
}
```

### 428 Precondition Required

```
// RESPONSE
HTTP/1.1 428
Content-Type: application/problem+json
{    
    "title": "Precondition Required",
    "status": 428,
    "detail": "Header 'If-Match' must be provided.",       
    "instance": "/documents/203",
    "requestId": "b6d9a290-9f20-465b-bcd3-4a5166eeb3d"
}
```

### 429 Too Many Requests

```
// RESPONSE
HTTP/1.1 429
Content-Type: application/problem+json
{    
    "title": "Too Many Requests",
    "status": 429,
    "detail": "Request for resource '/documents/203' has been rate-limited.",       // Message should provide tokenized specific values on throttling if available. 
    "instance": "/documents/203",
    "requestId": "b6d9a290-9f20-465b-bcd3-4a5166eeb3d"
}
```

### 500 Internal Server Error

```
// EXAMPLE 1: 500 Error No Details
// RESPONSE
HTTP/1.1 500
Content-Type: application/problem+json
{
    "title": "Internal Server Error",
    "status": 500,
    "detail": "Request for '/documents/203' failed unexpectedly.",          // This message is likely to be modified if further detail can be added.
    "instance": "/documents/203",
    "requestId": "b6d9a290-9f20-465b-bcd3-4a5166eeb3d7"
}
 
// EXAMPLE 2: 500 Error with Details
// RESPONSE
HTTP/1.1 500
Content-Type: application/problem+json
{
    "title": "Internal Server Error",
    "status": 500,
    "detail": "A downstream dependency connection timed out accessing requested resource '/documents/203'.", // Example of more specific detail.
    "instance": "/documents/203",
    "requestId": "b6d9a290-9f20-465b-bcd3-4a5166eeb3d7"
}
 
// EXAMPLE 3: 500 Error with Context
// RESPONSE
HTTP/1.1 500
Content-Type: application/problem+json
{
    "title": "Internal Server Error",
    "status": 500,
    "detail": "Request for '/documents/203' failed unexpectedly.",
    "instance": "/documents/203",
    "requestId": "b6d9a290-9f20-465b-bcd3-4a5166eeb3d7",
    "context": [
        {
            "code": "CONNECTION_TIMEOUT",                               // Machine readable CAPITAL_SNAKE_CASE
                                                                        // Using a context list to provide a known machine readable error code is appropriate even for a single item.                      
            "message": "A downstream dependency connection timed out."  // Human readable, be careful not to give away any implementation details.
        },
        ... 1 or more context items...
    ]
}
```