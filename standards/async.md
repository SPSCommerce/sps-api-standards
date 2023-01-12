# Asynchronous

## Overview

There are number of situations where REST APIs cannot be handled in small amount of time and requires longer processing time to handle specific request. Those type of particular operations have to run in the background outside of the request processing scope. Those type of APIs (or specific API endpoints) should be designed to handle asychronous communication.

There are couple ways to accomplish asynchronous communication in REST APIs and those are not mutually exclusive.

## Polling

All asynchronous API requests starts with initiation. Since long-running requests need to be processed on background, asynchronous requests should initiate those processes with necessary input parameters. Background process details should be returned 

```
// REQUEST
POST https://api.spscommerce.com/v1/reports   // initiates long running processing by posting job with new parameters
{
    "startDate": "2022-01-01",
    "endDate": "2022-12-31",
    "reportType": "CompletedTransactions"
}

// RESPONSE
HTTP/1.1 202 (Accepted)
{
    id: "1234456789",  // unique identifier of the process/job associated with long running request processing
    status: "NotStarted | Running | Succeeded | Failed | Canceled",  // status of job completion
    error: ErrorObject, // error object in case if background process finished with error state
    result: uri
}
```

Once new long-running request posted, corresponding instance of running process created for tracking purpose. To access details about process and completeness status GET operation **must** be used. Such request will return current status of the background process

```
// request to get details about already posted asynchronous request
GET https://api.spscommerce.com/v1/reports/queue/1234456789
// RESPONSE
HTTP/1.1 202 (Accepted)
{
    id: "1234456789",  
    status: "NotStarted | Running | Succeeded | Failed | Canceled",  // status of job completion
    error: ErrorObject, // error object in case if background process finished with error state
    result: uri
}
```

Upon completion of background process for posted asynchronous API request, the status will change to "Succeeded" and `result` field will contain URI to completed entitiy

```
GET https://api.spscommerce.com/v1/reports/queue/1234456789
// RESPONSE
HTTP/1.1 202 (Accepted)
{
    id: "1234456789",  
    status: "Succeeded",
    error: null,
    result: "https://api.spscommerce.com/v1/reports/1234456789"
}

GET https://api.spscommerce.com/v1/reports/1234456789
// RESPONSE
{
    {... REPORT ENTITIY OBJECT ...} 
}
```

## Webhooks

While client always can use pooling approach to identify when asynchronous request results are ready, there is another method exist when clien can be notified with `callback` call to an API endpoint upon completion of background process. This approach eliminates overhead with extra requests to the asyncronous request status endpoint and delivers instant notification upon completion. Callback URL **must** be provided as part of initial asynchonous request

```
// REQUEST
POST https://api.spscommerce.com/v1/reports   // initiates long running processing by posting job with new parameters
{
    "startDate": "2022-01-01",
    "endDate": "2022-12-31",
    "reportType": "CompletedTransactions",
    "_callbackUrl: "<API CALLBACK URL>"
}
```

The provided API URL will be called using POST request with exactly the same entity as it's available during `queue` check call:
```
POST <API CALLBACK URL>
{
    id: "1234456789",  
    status: "Succeeded",
    error: null,
    result: "https://api.spscommerce.com/v1/reports/1234456789"
}
```

## WebSocket

At SPS Commerce we are not recommending to implement WebSocket APIs.