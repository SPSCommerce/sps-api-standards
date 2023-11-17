# Bulk Operations

## Overview

The concept of bulk operations on RESTful endpoints is quite foreign, in the sense that it is not a common practice. However, there are some use cases where it makes sense to allow a client to perform multiple operations in a single request. For example, a client may want to create multiple entities at once, or update multiple entities at once. In these cases, it is often more efficient to allow the client to perform these operations in a single request, rather than making multiple requests. However, before adding support for bulk operations you should think twice if this feature is really needed. Often network performance is not what limits request throughput. Similarly, sending multiple in-parallel requests for standard REST endpoints can be a fine solution for some clients.

### Synchronous

Bulk operations **MUST** be synchronous when applied to an existing resource. This means that the client will receive a response to the bulk request only after all operations have been completed. This is in contrast to asynchronous operations, where the client receives a response immediately after the request is received, and then must poll for the result of the operation. Asynchronous bulk operations are applied to new resources specifically for bulk or import to enable subsequent status updates through additional endpoints.

- Bulk operations **MUST** be specific to a single resource type and NOT allow for updating multiple resource types in a single request.
- Bulk operations **MUST** be implemented as a PATCH request against a collection resource that not idempotent.
- Bulk operations **MUST** return a `200 (OK)` response code if all operations were received and a result is available for each operation. Bulk operations **MUST NOT** use status code `207 (Multi-Status)` response code as this incurs other implications for the response schema in relationship to WebDAV. System level errors may still result in a `500 (Internal Server Error)` response code where the request could not be processed or was prevented from trying specific operations.
- Bulk operations **MUST** accept a constrained number of operations in the request body that is indicated in the documentation of the endpoint. By default this value **MAY** be 100 operations, but should be adjusted according to the needs of the endpoint and the entity-size. Requests beyond the limit **MUST** return a `400` response code and standard [error format body](errors.md) similar to:
```json
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

#### Request

- Bulk operations **MUST** include a request body schema 
```json
{
    "transactionMode": "ATOMIC" | "ISOLATED",                               // OPTIONAL (enum): indication of transactionality of operations. default is "ISOLATED"
    "operations": [                                                         
        {                                                                   
            "operationId": "string" | null,                                 // OPTIONAL (string): consumer generated id to associate with the operation for comparison to result.
            "action": "CREATE" | "UPDATE" | "CREATE_UPDATE" | "DELETE",     // REQUIRED (enum): indicate intent of operation (can use subset, but do not extend)
            "ifMatch": "string" | null,                                     // OPTIONAL (string): if-match is an optional ETag value that can be passed for optimistic concurrency
            "entity": {
                ... MATCHING ENTITY...                                      // REQUIRED (object): must match entity schema resource from the collection (not dynamic)
            }                                                            
        }
    ]
}
```

- Bulk operation requests **MAY** be designated as `ATOMIC` or `ISOLATED` via the `transactionMode` field.
    - The default transaction mode type **MUST** be `ISOLATED`.
    - The transaction mode type **MAY** be optionally left out of the request schema in implementation.
    - `ATOMIC` transactions will either succeed or fail together.
    - `ISOLATED` transactions will allow for individual operations to succeed or fail independently.
- `operationId` **MAY** be used to associate the operation in the request with the resulting operation in the response. This is useful for tracking the outcome of each operation in the response where it might be ambiguous to reference via `entityId`.
- `action` enumeration **MUST NOT** be extended, but **MAY** be a subset of the enumeration values where not all actions are required.
- `ifMatch` **MUST** be supported in the request schema if ETags are used for other RESTful operations on the same resource.
- Operation collections in a request **MUST** include entities of the same `id` only once. If the collection contains multiple entities with the same `id`, then the request **MUST** return a `400 Bad Request` status code and error body.

#### Response

- Bulk operations **MUST** include a response body schema as follows, which is not extensible:
```json
{
    "status": "SUCCEEDED" | "FAILED" | "PARTIAL",                           // REQUIRED (enum): overall status of bulk operation
    "operations": [                                                         // REQUIRED (array): results of each operation from the request.
        {
            "operationId": "string",                                        // REQUIRED (string): matching operation id from the request body if provided, otherwise use index value as a string
            "action": "CREATE" | "UPDATE" | "CREATE_UPDATE" | "DELETE",     // REQUIRED (enum): repeat action type
            "entityId": "string" | null,                                    // OPTIONAL (string): the associated id of the entity, if available
            "entityRef": "sps-ref" | null,                                  // OPTIONAL (string): the associated sps-ref URN entity, if applicable
            "result": {                                                     // REQUIRED (object): result of the operation
                "status": "SUCCEEDED" | "FAILED",                           // REQUIRED (enum): status of individual operation
                "detail": "string" | null,                                  // OPTIONAL (string): Description or detailed human-readable message about the success or failure of the operation.
                "context": [                                                // OPTIONAL (array): List of objects providing additional context and detail on sub-reasons for any errors or failures.
                    {
                        "message": "string",                                // REQUIRED (string): Human-readable details or specific error about the request result.
                        "code": "string" | null,                            // OPTIONAL (string): Short, machine-readable, name of the validation result that occurred, such as an error code.
                        "field": "string" | null,                           // OPTIONAL (string): field indicates an associated field in the entity to highlight
                        "value": "string" | null                            // OPTIONAL (string): the value of the associated field highlighted in the detail
                    }
                ] | null
            }
        }
    ]
}
```

- `status` enumeration **MUST NOT** be extended or filtered.
- `operations` collection **SHOULD** be in the same order as the request body operations.
- `operationId` in the response **MUST** match the `operationId` of the request body where provided, otherwise it should fallback to the index of the operation in the request body as a string value.
- `entityId` and `entityRef` should both be used to identify the primary ID or an associated [ref](naming.md) value for the entity. These are optional and can be left out if not applicable.
- `detail` field **MAY** be included as a complex object following the identified schema. If it is include, then it **MUST** include a `message` field. It **MUST NOT** be extended. The additional fields around `code`, `field`, and `value` are optional and **MAY** be left out if not applicable to your resource

#### Example

The following example demonstrates various operations in a bulk request and response:

```json
// REQUEST
PATCH /articles
Content-Type: application/json
{
    "operations": [
        {
            "action": "CREATE_UPDATE",
            "ifMatch": "33a64df551425fcc55e4d42a148795d9f25f89d4",
            "entity": {
                "id": "bfd8f0c0-be67-4f81-bf82-e55e552609f4",
                "name": "my name",
                "description": "my description"
            }
        },
        {
            "action": "CREATE",
            "operationId": "my-unique-id-or-uuid", 
            "entity": {
                "id": null,
                "name": "my name",
                "description": "my description"
            }
        },
        {
            "action": "DELETE",
            "ifMatch": "44a64df551425fcc55e4d42a148795d9f25f89c5",     
            "entity": {
                "id": "d9bd5d91-fc25-4410-ae42-c8f631e8e9ff",
                "name": null,
                "description": null
            }
        }
    ]
}
 
// RESPONSE
200 OK
Content-Type: application/json
{
    "status": "PARTIAL",                                 
    "operations": [
        {
            "operationId": "0",
            "action": "CREATE_UPDATE",
            "entityId": "bfd8f0c0-be67-4f81-bf82-e55e552609f4",
            "entityRef": "sps:thing:bfd8f0c0-be67-4f81-bf82-e55e552609f4",
            "result": {
                "status": "SUCCEEDED",                         
                "detail": "Article was updated.",
                "context": null
            }
        },
        {
            "operationId": "my-unique-id-or-uuid",
            "action": "CREATE",
            "entityId": null,
            "entityRef": null,
            "result": {
                "status": "FAILED", 
                "detail": "Could not create article.",                    
                "context": [
                    {
                        "message": "An article with the same name already exists.",
                        "code": "UNIQUE_NAME_VIOLATION",
                        "field": "name",
                        "value": "my name"
                    }
                ]   
            } 
        },
        {
            "operationId": "2",
            "action": "DELETE",
            "entityId": "d9bd5d91-fc25-4410-ae42-c8f631e8e9ff",
            "entityRef": "sps:thing:d9bd5d91-fc25-4410-ae42-c8f631e8e9ff",
            "result": {
                "status": "SUCCEEDED",                         
                "detail": null,
                "context": null
            }
        }
    ]
}
```

```note
**PATCH REQUEST ATOMICITY**
While the [HTTP PATCH RFC](https://datatracker.ietf.org/doc/html/rfc5789) requires full atomicity in application of the patched document, this is not possible in the case of bulk operations. In the case of bulk operations, the request body is a collection of resources which means that the request body is not a single document. While not a perfect interpretation of PATCH execution, the boundaries of bulk operations require some compromise to benefit developer experience and consistency.
```