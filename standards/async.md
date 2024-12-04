# Asynchronous

## Overview

There are number of situations where REST API endpoints require longer processing time to handle specific requests. Those type of particular operations have to run in the background outside of the request processing scope. These API endpoints should be designed to handle asynchronous communication in order to make the results of the request available to the consumer.

There are couple ways to accomplish asynchronous communication in REST APIs and those are not mutually exclusive, including polling, websockets and webhooks.

```note
At this time only asynchronous communication through polling are provided in the API Standards.
```

## Polling (Resource without Status Monitor)

Overall guidelines for asynchronous requests are:
- API requests **SHOULD** be implemented as asynchronous if the 99th percentile response time is greater than 5s.
- API requests **SHOULD NOT** decide or interpret whether a response will be asynchronous or synchronous dynamically at runtime. An endpoint should be either synchronous or asynchronous, but not both.
- PATCH requests **MUST NOT** be used as asynchronous request initiation. If entity update is required and takes more than established time then it **MUST** be implemented as a POST request.

All asynchronous endpoint requests start with initiation. Since long-running requests need to be processed on background, asynchronous requests should initiate those processes with necessary input parameters. Background process details should be returned.

- Asynchronous requests **MUST** be a `POST` method, and should be represented as a resource, not an action-style endpoint.
- Asynchronous requests **SHOULD** be have an associated `GET` method for the same resource to retrieve the status of the request.
- Asynchronous requests **MUST** perform as much validation as possible before initiating the long-running process, and return 400 (Bad Request) [error response](errors.md) if validation fails.
- Asynchronous requests **MUST** return error details as part of completed long-running process response (other than request validation failures).
- Asynchronous requests **MUST** return 202 (Accepted) response status code when a long-running processing requests was successfully initiated.
    - No other 2xx codes **SHOULD** be returned in response to the asynchronous request initialization, even if request has completed before the initiating request returns.
- `Operation-Id` header is **MAY** be supported and can be provided as part of the request.
- Process ID **SHOULD** be automatically generated and returned to the client if `Operation-Id` header is not provided.
- Asynchronous request **MUST** have a response body that extends from the following schema:
```json
    {
        "id": "string",                                                                 // required: unique id representing the resource
        "ref": "sps-ref",                                                               // optional
        "status": "SUCCEEDED" | "FAILED" | "RUNNING" | "NOT_STARTED" | "CANCELED",      // required
        "detail": "same as detail from bulk... maybe error message? or complex object?",// required
        "result": "",                                                                   // optional
        "completenessDescription": "percentage?",                                       // optional
        "createdDateTime": "",                                                          // required
        "createdBy": "" | null,                                                         // optional
        "completedDateTime": "" | null,                                                 // required
        ...EXTENDED...
    }
```

Example workflow for an asynchronous resource creation request:

```
// REQUEST
POST /reports                               // initiates long running processing by posting job with new parameters
Operation-Id: f7cf8412-08ed-40c9-ac1b-296da9d1d970
{
    ...Custom Request Body Parameters
}

// RESPONSE
202 ACCEPTED
Operation-Location: /reports/f7cf8412-08ed-40c9-ac1b-296da9d1d970
{
    "id": "f7cf8412-08ed-40c9-ac1b-296da9d1d970",
    "result": null
}
```

Once new long-running request posted, corresponding instance of running process created for tracking purpose. To access details about process and completeness status GET operation **MUST** be used. Such request will return current status of the background process along with the request parameters.

- Status of long-running processing **MUST** be always returned via GET request with provided `id` of the asynchronous process

```
// request to get details about already posted asynchronous request
GET /reports/f7cf8412-08ed-40c9-ac1b-296da9d1d970

// RESPONSE
200 OK
{
    "id": "f7cf8412-08ed-40c9-ac1b-296da9d1d970",                                                               
    "ref": "sps:report::f7cf8412-08ed-40c9-ac1b-296da9d1d970",
    "status": "RUNNING",
    "detail": "same as detail from bulk... maybe error message? or complex object?",
    "result": null,
    "completenessDescription": "1 of 7",
    "createdDateTime": "2023-07-21T17:32:28.000Z",
    "createdBy": "user-xxxxx",
    "completedDateTime": "2023-07-21T17:32:28.000Z"
}
```

## Polling (Endpoint with Status Monitor)

Do we need to support this? https://github.com/microsoft/api-guidelines/blob/vNext/azure/ConsiderationsForServiceDesign.md#long-running-operations