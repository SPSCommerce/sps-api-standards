# Bulk Operations

## Overview

The concept of bulk operations on RESTful endpoints is quite foreign, in the sense that it is not a common practice. However, there are some use cases where it makes sense to allow a client to perform multiple operations in a single request. For example, a client may want to create multiple entities at once, or update multiple entities at once. In these cases, it is often more efficient to allow the client to perform these operations in a single request, rather than making multiple requests. However, before adding support for bulk operations you should think twice if this feature is really needed. Often network performance is not what limits request throughput. Similarly, sending multiple in-parallel requests for standard REST endpoints can be a fine solution for some clients.

### Synchronous

Bulk operations **MUST** be synchronous when applied to an existing resource. This means that the client will receive a response to the bulk request only after all operations have been completed. This is in contrast to asynchronous operations, where the client receives a response immediately after the request is received, and then must poll for the result of the operation. Asynchronous bulk operations are applied to new resources specifically for bulk or import to enable subsequent status updates through additional endpoints.

- Bulk operations **MUST** be specific to a single resource type and NOT allow for updating multiple resource types in a single request.
- Bulk operations **MUST** be implemented as a PATCH request against a collection resource.
- Bulk operations **MUST** return a `200 (OK)` response code if all operations were received and a result is available for each operation, regardless of success. Bulk operations **MUST NOT** use status code `207 (Multi-Status)` response code as this incurs other implications for the response schema in relationship to Web DAV.
- Bulk operations **MUST** accept a constrained number of operations in the request body that is indicated in the documentation of the endpoint. By default this value **MAY** be 100 operations, but should be adjusted according to the needs of the endpoint and the entity-size. Requests beyond the limit **MUST** return a `400` response code and standard [error format body](errors.md) similar to:
```
// RESPONSE
HTTP/1.1 400
Content-Type: application/problem+json
{
    "title": "Invalid Data",
    "status": 400,
    "detail": "Operations collection may only contain a maximum of '100' actions per request.",
    "instance": "/articles",
    "requestId": "b6d9a290-9f20-465b-bcd3-4a5166eeb3d7"
}
```

- Bulk operations **MUST** include a request body schema following: 
```json
{
    "operations": [
        {
            "action": "CREATE" | "UPDATE" | "CREATE_UPDATE" | "DELETE",     // indicate intent of operation
            "ifMatch": "string" | null,                                     // if-match is an optional ETag that can be passed for optimistic concurrency
            "entity": {
                ... MATCHING ENTITY...                                      // must match entity schema resource from the collection
            }                                                               // schema on entity is static and not dynamic
        },
    ]
}
```

- Bulk operations **MUST** include a response body schema following:
```json
{
    "status": "SUCCEEDED" | "FAILED" | "PARTIAL",                           // overall status of bulk operation, partial indicating 
    "operations": [                                                         // there are some operations that failed and succeeded
        {
            "ordinal": 0,                                                   // position in original ordered operation collection
            "action": "CREATE" | "UPDATE" | "CREATE_UPDATE" | "DELETE",     // repeat action type
            "id": "string" | null,                                          // the associated id of the entity, if available
            "ref": "sps-ref" | null,                                        // the associated sps-ref URN entity, if applicable
            "status": "SUCCEEDED" | "FAILED",                               // status of individual operation
            "detail": "string",                                             // indicates details on the operation result, such as an error message.
        }
    ]
}
```

The following example demonstrates various operations in a bulk request and response:

```
// REQUEST
PATCH /articles
Content-Type: application/json
{
    "operations": [
        {
            "action": "CREATE_UPDATE"
            "ifMatch": "33a64df551425fcc55e4d42a148795d9f25f89d4",
            "entity": {
                "id": "bfd8f0c0-be67-4f81-bf82-e55e552609f4",
                "name": "my name",
                "description": "my description"
            }
        },
        {
            "action": "CREATE"  
            "entity": {
                "id": null,
                "name": "my name",
                "description": "my description"
            }
        },
        {
            "action": "DELETE" 
            "ifMatch": "44a64df551425fcc55e4d42a148795d9f25f89c5",     
            "entity": {
                "id": "d9bd5d91-fc25-4410-ae42-c8f631e8e9ff",
                "name": null,
                "description": null
            }
        },
    ]
}
 
// RESPONSE
200 OK
Content-Type: application/json
{
    "status": "PARTIAL",                                 
    "operations": [
        {
            "ordinal": 0,
            "action": "CREATE_UPDATE",
            "id": "bfd8f0c0-be67-4f81-bf82-e55e552609f4",
            "ref": "sps:...",
            "status": "SUCCEEDED",                         
            "detail": "Article was updated.",  
        },
        {
            "ordinal": 1,
            "action": "CREATE",
            "id": null,
            "ref": null,
            "status": "FAILED",                         
            "detail": "Could not create article, since the name already exists.",  
        },
        {
            "ordinal": 2,
            "action": "DELETE",
            "id": "d9bd5d91-fc25-4410-ae42-c8f631e8e9ff",
            "ref": "sps:...",
            "status": "SUCCEEDED",                         
            "detail": null,  
        }
    ]
}
```

```note
**PATCH REQUEST ATOMICITY**
While the [HTTP PATCH RFC](https://datatracker.ietf.org/doc/html/rfc5789) requires full atomicity in application of the patched document, this is not possible in the case of bulk operations. In the case of bulk operations, the request body is a collection of resources which means that the request body is not a single document. While not a perfect interpretation of PATCH execution, the boundaries of bulk operations require some compromise to benefit developer experience and consistency.
```