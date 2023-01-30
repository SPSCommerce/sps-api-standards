# Collections

## Overview

Collection usage and manipulation with HTTP REST APIs specifically require its own set of standardization that provide helpful considerations and must use styles for consistency.

- All collection-based API responses **MUST** offer paging capability for consistency and evolution, regardless of the collection size or the static nature of the data. Even if the resource is returning a collection of static "types" representing 2 items, pagination should be supported in its simplest form.

## Root Element

- All collection-based endpoint responses **MUST** include the collection under the `results` root element.

```
// CORRECT
{
    "results": [                    // "results" term is a standardized part of the schema for all collection responses
        {... DOMAIN OBJECT ...}     // schema of the your domain object can be anything you want
    ]
}

// INCORRECT
[
    {... DOMAIN OBJECT ...}         // this format prevents future changes to the contract without forcing a breaking change
]
```

- All collection-based endpoint responses **SHOULD NOT** include their full domain object with all properties and attributes, but rather it should be a summary of the fields that 80% of the consumers are likely interested in ([Pareto Principle](https://en.wikipedia.org/wiki/Pareto_principle)). If your result domain object is small enough to be negligible then this principle does not apply.

## Pagination

### General

- All collection-based endpoints `GET` request parameters **MUST** be specified as query parameters with the outlined schema below.

```
// CORRECT
GET https://api.spscommerce.com/v1/books
    ?limit=int                              // amount of items requested in the results of a single request
                                            //   -> Not Required, Defaults to API Defined Limit (there must be a max limit value, min limit value is 1).
    &offset=int                             // amount of items to skip before including the number of limit results in the request
                                            //   -> Not Required, Defaults to 0, Used only for Offset-based (min offset value is 0).
    &cursor=string                          // base64 opaque string indicating the metadata and state used to determine the set of results to return
                                            //   -> Not Required, Defaults to Empty / First Row, Used only for Cursor-based
```

- All collection-based endpoints **SHOULD** use `GET` requests for pagination and not `POST` requests unless it is necessary for the action.
- All collection-based endpoints `POST` request parameters **MUST** be specified as parameters in the body of the request within the `paging` element and the outlined schema below.

```
// CORRECT
POST https://api.spscommerce.com/v1/books
// REQUEST
{
    ...
    "paging": {
        "limit": int,
        "offset": int,
        "cursor": string
    }
}
```

- Pagination request parameters `MUST` never exist as both query parameters and request body parameters.

```
// INCORRECT
POST https://api.spscommerce.com/v1/books
     ?limit=int
     &offset=int
     &cursor=string
// REQUEST
{
    "paging": {
        "limit": int,
        "offset": int,
        "cursor": string
    }
}
```

- All collection-based endpoint responses **MUST** include the root element `paging` whenever `results` are used, with the outlined schema from offset-based or cursor-based pagination.

```
// RESPONSE
HTTP/1.1 200
{
    "results": [
        {... DOMAIN OBJECT ...}
    ],
    "paging": {
        ... DEFINED AS PART OF OFFSET-BASED OR CURSOR-BASED PAGINATION
    }
}
```

- If using pagination response parameters for "next" and "previous", then they **MUST** be set to `NULL` to indicate there is no next or previous page.

```
// generally speaking the first request for the first page of results will have a null previous page
GET https://api.spscommerce.com/v1/example?limit=25&offset=0
// RESPONSE
HTTP/1.1 200
{
    "results": [
        {... DOMAIN OBJECT ...}
    ],
    "paging": {
        ...
        "next": {
            "url": "https://api.spscommerce.com/v1/example?limit=25&offset=25"
         },
        "previous": null
    }
}
```

- Invalid requests due to pagination validation **MUST** return a `400 Bad Request` status code following the standard [error schema](errors.md#400-bad-request).

```
// CORRECT
GET https://api.spscommerce.com/v1/books
    ?limit=-2                               // limit cannot be a negative value
// RESPONSE
HTTP/1.1 400
Content-Type: application/problem+json
{
    "title": "Invalid Data",
    "status": 400,
    "detail": "Missing content or invalid input provided.",
    "instance": "/v1/books",
    "requestId": "b6d9a290-9f20-465b-bcd3-4a5166eeb3d7",
    "context": [
       {
            "code": "INPUT_MIN_VALUE",
            "message": "Attribute 'limit' must be greater than or equal to 1.",
            "field": "limit",
            "source": "query",
            "value": "-2"
        }
    ]
}

```

## Offset-Based

### Overview

Offset-based pagination is the simplest form of paging through API results and offers advantages:

- Creating a UI driven with a page selection option and the ability to skip to any page.
- See progress based on which page you're on.
- Assumes you also are ordering your results based on order queries as well.

Reference the advantages of cursor-based pagination for some reasons why you may not use offsets.

### Guidelines

- All collection-based endpoints **SHOULD** support cursor-based over offset-based pagination unless technology or performance makes offset-based pagination more advantageous.
- Offset-based collection endpoint responses **MUST** include the root element `paging` whenever `results` are used.

```jsonc
// RESPONSE
{
    "results": [
        {... DOMAIN OBJECT ...}
    ],
    "paging": {
        "totalCount": int,      // the total count of all unique available records (results) across all paginated queries of the endpoint
                                //   -> Not Required
        "limit": int,           // amount of items requested in the results of a single request, updated for the response to the max limit or the default as necessary
                                //   -> Required, Defaults to API defined default / max or if within range the user provided limit request parameter
        "offset": int,          //amount of items to skip before including the number of limit results in the request
                                //   -> Required
    }
}
```

- Offset-based collection endpoints may **OPTIONALLY** make use of `next` and `previous` specifications for URLs.

```
// RESPONSE
{
    "results": [
        {... DOMAIN OBJECT ...}
    ],
    "paging": {
        "totalCount": int,
        "limit": int,
        "offset": int,
        "next": {
            "url": "string"     // represents the complete URL to navigate to the next result set of data given the state of your current request (including offset, limit, cursor where appropriate)
                                //   -> Required
                                //   -> Example: https://api.spscommerce.com/v1/books?limit=50
         },
        "previous": {           // optional for offset-based pagination. set to null to indicate no previous page.
            "url": string       // represents the complete URL to navigate to the previous result set of data given the state of your current request (including offset, limit, cursor where appropriate).
                                //   -> Required
        }
    }
}
```

```note
 Complete URLs can be difficult to intercept behind a number of proxies/gateways for specification on URL fields, such as `next`/`previous` elements. Ensure your consuming the correct headers for construction. Also, consider the dynamic nature of the URL from different entry points across the same environments or different environments. Difficulties may also exist in dynamic documentation generation. Possible headers behind internal proxies or platforms include: `X-Forwarded-Host`, `X-Forwarded-Port`, `X-Forwarded-Proto`. Your application would still need to determine the subpath based on the request context of the application (i.e. after the host).
```

### Example

```
// SCENARIO 1: Get the first page of results (leave offset as null to default to 0)
GET https://api.spscommerce.com/v1/example?limit=25&offset=0
RESPONSE
{
    "results": [
        {... DOMAIN OBJECT ...}
    ],
    "paging": {
        "totalCount": 100,
        "limit": 25,
        "offset": 0
    }
}

// SCENARIO 2: Get the second page of results
GET https://api.spscommerce.com/v1/example?limit=25&offset=25
RESPONSE
{
    "results": [
        {... DOMAIN OBJECT ...}
    ],
    "paging": {
        "totalCount": 100,
        "limit": 25,
        "offset": 25
    }
}

// SCENARIO 3: Get the last page of results (skip a page)
// determine based on (totalCount - limit)
GET https://api.spscommerce.com/v1/example?limit=25&offset=75
RESPONSE
{
    "results": [
        {... DOMAIN OBJECT ...}
    ],
    "paging": {
        "totalCount": 100,
        "limit": 25,
        "offset": 75
    }
}
```

## Cursor-Based

### Overview

Cursor-based Pagination works extremely well when:

- Offset-based pagination does not scale as you get further down the index calculating the offset on large sets of data.
- A highly transactional database or lots of activity can make it difficult to use offsets effectively through a dataset. The paging window is subtly stabilized using a cursor or known established `next` page.

The performance advantages may be a larger requirement than the capabilities you lose:

- Ability to jump to a particular page.
- Impacted understanding of how many pages there could be.

### Guidelines

- Cursor-based collection endpoint responses **MUST** include the root element `paging` whenever `results` are used.

```
RESPONSE
{
    "results": [
        {... DOMAIN OBJECT ...}
    ],
    "paging": {
        "limit": int,           // amount of items requested in the results of a single request, updated for the response to the max limit or the default as necessary
                                //   -> Required, Defaults to API defined default / max or if within range the user provided limit request parameter
        "next": {
            "cursor": "string", // base64 opaque string indicating the metadata and state used to determine the set of results to return to retrieve the next page.
                                //   -> Required
            "url": "string"     // represents the complete URL to navigate to the next result set of data given the state of your current request (including offset, limit, cursor where appropriate)
                                //   -> Required
                                //   -> Example: https://api.spscommerce.com/v1/books?limit=2&cursor=dXNlcklkOjM=
         },
        "previous": {           // optional for cursor-based pagination. set to null to indicate no previous page.
            "cursor": "string", // base64 opaque string indicating the metadata and state used to determine the set of results to return to retrieve the previous page.
                                //   -> Required if previous is present
            "url": string       // represents the complete URL to navigate to the previous result set of data given the state of your current request (including offset, limit, cursor where appropriate).
                                //   -> Required if previous is present
        }
    }
}
```

- When using pagination cursors, the cursor **MUST** be `Base64` encoded to be opaque.

```
// CORRECT
RESPONSE
{
    "results": [
        {... DOMAIN OBJECT ...}
    ],
    "paging": {
        "limit": int,
        "next": {
            "cursor": "dXNlcklkOjM=",
            "url": "https://api.spscommerce.com/v1/books?limit=2&cursor=dXNlcklkOjM="
         }
    }
}

// INCORRECT
RESPONSE
{
    "results": [
        {... DOMAIN OBJECT ...}
    ],
    "paging": {
        "limit": int,
        "next": {
            "cursor": "userId:3",                                                   // a cursor MUST be base64 encoded to prevent manual manipulation
            "url": "https://api.spscommerce.com/v1/books?limit=2&cursor=userId:3"   // the associated URL must have the matching cursor that is opaque specified
         }
    }
}
```

```note
**Consideration**: The cursor tokens used are always `Base64` strings to ensure they are opaque (meaning they appear dangerous to change to the consumer). In actuality, they store an encoded state about the cursor in it, or a cursor from a point of integration in a database or S3 for example. The cursor contract inside the Base64 string is entirely specific to the API in question. Often it can indicate the parameter being ordered alongside the next cursor ID to return results from.

Additional concepts: [Evolving API Pagination at Slack](https://slack.engineering/evolving-api-pagination-at-slack/).
```

- A cursor value **MUST** be created by the API, and never requested for the consumer to create their own cursor or apply `Base64` encoding themselves.

### Example

| UserId | Username | Email                 |
|--------|----------|-----------------------|
| 1      | john     | email1@spscommerce.com|
| 2      | allyn    | email2@spscommerce.com|
| 3      | travis   | email3@spscommerce.com|
| 4      | aaron    | email4@spscommerce.com|
| 5      | jay      | email5@spscommerce.com|

```
// Scenario 1: Initial Request (no cursor)
GET https://api.spscommerce.com/v1/users?limit=2
RESPONSE
{
    "results": [
        { "userId": 1, "username": "john", "email": "email1@spscommerce.com" },
        { "userId": 2, "username": "allyn", "email": "email2@spscommerce.com" }
    ],
    "paging": {
        "limit": 2,
        "next": {
            "cursor": "bmV4dF91c2VySWQ6Mw==",   # base64.encode("next_userId:3")
                                                # The format can be anything you like for your API, such as "next_userId_3", or even "3" if the API returns just next pages of users.
                                                # Cursor can indicate multiple columns and asc/desc if desirable: base64.encode("Username:desc__Userid:asc__UserId:12").
                                                # Take a note, that a cursor usually contains additional information to help API understand direction and order.

            "url": "https://api.spscommerce.com/v1/example?limit=2&cursor=bmV4dF91c2VySWQ6Mw=="
         }
    }
}

// Scenario 2: Subsequent Request with a provided cursor
GET https://api.spscommerce.com/v1/users?limit=2&cursor=bmV4dF91c2VySWQ6Mw=="
RESPONSE
{
    "results": [
        { "userId": 3, "username": "travis", "email": "email3@spscommerce.com" },
        { "userId": 4, "username": "aaron", "email": "email4@spscommerce.com" }
    ],
    "paging": {
        "limit": 2,
        "next": {
            "cursor": "bmV4dF91c2VySWQ6Mw==",  # base64.encode("next_userId:5"), if the limit is adjusted manually in the subsequent request, that will obviously impact the before/after
            "url": "https://api.spscommerce.com/v1/example?limit=2&cursor=bmV4dF91c2VySWQ6Mw=="
         },
        "previous": {
            "cursor": "cHJldl91c2VySWQ6Mw==",  # base64.encode("prev_userId:3"), if the limit is adjusted manually in the subsequent request, that will obviously impact the before/after
            "url": "https://api.spscommerce.com/v1/example?limit=2&cursor=cHJldl91c2VySWQ6Mw=="
         }
    }
}
```

## Filtering

To limit or narrow down the results of a collection endpoint you may provide filtering capabilities, where a filter is part of the query parameters.

- Filtering is not a requirement on all collection-based endpoints.
- Filtering query parameters **MUST** always be optionally applied as indicated by URL Structures that all query parameters are always optional.
- The resource identifier in a collection **SHOULD NOT** be used to filter collection results, resource identifier should be in the URI.
- Filtering **SHOULD** only occur on endpoints that are collections using the schema described above.
- Filtering attribute names may represent nested objects and **MUST** use a period to represent each segment of the object path: `grandparent.parent.child`.
    - Limit filter references to three levels of object hierarchy in accordance with `GET-based` HTTP Methods ([Request Response](request-response.md)).
- Filtering **MUST** only be implemented on `GET-based` HTTP Methods via query parameters.
- Filtering using `GET-based` requests with query parameters **SHOULD** be avoided if expected use cases or allowed usage resolves URL lengths beyond a reasonable size for the developer experience or approaching limits defined in [URL Structure](url-structure.md).
    - Overly verbose filtering that contains dozens or hundreds of parameters **SHOULD** consider if their API design is appropriate.
    - Overly verbose filtering that contains an undesirable number of parameters that cannot be redesigned **SHOULD** consider using a non-REST style `POST` endpoint as described under [Actions in URL Structure](url-structure.md).
        - `POST` requests for non-REST style filtering **SHOULD** specify parameters at the root of the request body with the same names that would be used for query parameters normally.
        - `POST` requests for non-REST style filtering **SHOULD** specify parameters with multiple values using JSON array format, rather than using the same property name twice.
        - `POST` requests for non-REST style filtering **SHOULD** result in the same response payload expectations and schema for collections as normally expected (including pagination).

        ```
        // REQUEST
        // example GET request translated to POST search endpoint below
        GET /articles?title=My%20Book&title=Their%20Book&author.firstName=John&limit=25
        POST /articles/search
        User-Agent: api-standards-v1
        Content-Type: application/json
        {
            "author.firstName": "John",
            "title": [
                "My Book",
                "Their Book"
            ],
            "limit": 25
        }

        // RESPONSE
        HTTP/1.1 200 OK
        Content-Type: application/json
        {
            "results": [ ... results content ... ],
            "paging": { ... standard pagination schema ... }
        }
        ```

- Filtering query parameters **MUST** be included as part of the pagination next/previous URLs, similar to how `limit` is included as an additional limiting query parameter.
- Filtering **MUST** be limited to equality checks of JSON attributes represented in the response payload.
    - Attributes not represented in the response payload **SHOULD NOT** be available for filtering.
    - Attribute names **MUST** follow standard naming and serialization patterns as defined elsewhere for their keys (see [Serialization](serialization.md)).
- Filtering capability and support **MUST** be documented within your API spec to clearly indicate how a consumer can filter your resource. Given that filtering support can drastically vary from endpoint to endpoint, incredible detail and clarity must be provided within the documentation of your API spec.

```warning
Take into consideration the performance of your filtering capability. It may be undesirable to support certain filtering capabilities if it has a substantial impact on your API performance.
```

```note
Collection endpoint filtering defines the convention explicitly for collection endpoints to filter results using entity fields from a response. It isn't applied to generic `/search` endpoints that require `POST` requests with a domain-specific language in the body.
```

### Simple

Many collection endpoints require very simple filtering capability. It is desirable to keep the filtering contract simple when possible for both developer experience and performance benefits.

- Simple filtering **MUST** be used as the default filtering method unless you require some of the advanced features described under "Advanced" filtering.
- Simple filtering with multiple query parameters with different attribute keys **MUST** result in a match for all conditions using the logical "AND" operator (and not in an "OR").
- Simple filtering **MAY** support specifying the same attribute as a parameter multiple times desiring to support a logical "OR" operation between values belonging to the same attribute (see Query Parameters in [URL Structure](url-structure.md)).
- Simple filtering **MAY** support wildcard filtering using an asterisk (`*`), but **MUST** only be supported on `string` object types.
    - Wildcard filter character **SHOULD** only appear once in a string value.
    - Wildcard filters **SHOULD** only be applied as a prefix or suffix to a string value, and not in the middle of other characters in the string.
- Simple filtering with provided values **MUST** be case-sensitive.
- Simple filtering with an attribute with no value **MUST** be interpreted as `NULL` (nil) or an empty string. The filter should filter down to entities that either are empty strings or NULL values.
    - Simple filtering with an attribute with no value that is a non-nullable Boolean **SHOULD** result in no filtering on the attribute (returning entities matching both true/false).
- Simple filtering with values provided for a response payload that is a primitive array **MUST** filter the resource entities that contain the filtered value (i.e. it **MUST NOT** filter the child array specified in the attribute filter).

```
// CORRECT
GET /articles?title=My%20Book                        // matching the exact title prefix of "My Book" only.
GET /articles?title=My%20Book*                       // starting with the title prefix "My Book" matching "My Book Best", etc.
GET /articles?author.firstName=john                  // with first name as "john".
GET /articles?author.firstName=John&title=My%20Book  // with an author first name as "John" AND title of "My Book"
GET /articles?author.age=50                          // with authors age of exactly 50
GET /articles?title=My%20Book&title=Their%20Book     // with a title of "My Book" OR "Their Book"
GET /articles?title=                                 // with NULL or empty article title (this is a string attribute, not a boolean)
GET /articles?active=                                // with NULL for active, this will ensure that articles that are active or not active are not filtered out. This may be necessary in scenario where active=true is the default.
GET /articles?limit=25&offset=25&title=Book          // combines filters with paging: showing 25 results at a time, starting with the 25th result for all article titles "Book"
GET /articles?categories=Fiction                     // that exist in at least the "Fiction" category.
GET /articles?categories=Fiction&categories=Drama    // that exist in the category "Fiction" OR the category "Drama".
GET /articles?reviews.createdBy=jdoe                 // with "reviews" being a list of complex objects, that has a "createdBy" name field, this filters the articles that have reviews with createdBy equal to the value.

// INCORRECT
GET /articles?isbn_Number=My%20Book                  // invalid casing
GET /articles?author.name.designation.type="MR"      // object selection pattern is too deep
GET /articles?author.age=5*                          // cannot wildcard an integer field type
GET /articles?titles=My%20Book,Their%20Book          // cannot use a CSV for filtering multiple attributes.
DELETE /articles?title=My%20Book                     // filtering parameters SHOULD NOT be used for any method other than GET, especially not for bulk delete operations.
```

```warning
The implementation of even simple filtering within your API can lead to drastic performance degradation if not considered carefully on the impact.
```

### Advanced

For filtering use cases beyond the functionality provided in "Simple" filtering, a dedicated filter query parameter with custom [FIQL](https://fiql-parser.readthedocs.io/en/stable/usage.html#:~:text=The%20Feed%20Item%20Query%20Language,entries%20in%20a%20syndicated%20feed.)/[RSQL](https://developer.here.com/documentation/data-client-library/dev_guide/client/rsql.html) expressions is used.

```note
[FIQL](https://github.com/jirutka/rsql-parser) - The Feed Item Query Language (FIQL, pronounced “fickle”) is a simple but flexible, URI-friendly syntax for expressing filters across the entries in a syndicated feed.

[RSQL](https://developer.here.com/documentation/data-client-library/dev_guide/client/rsql.html) - RSQL is a query language for RESTful APIs. It is based on FIQL, using a URI-friendly syntax, there are no unsafe characters, so URL encoding is not required.

RSQL is based on FIQL and is considered a superset of it, making it and FIQL usable in any RSQL compatible library. For clarity, it is expressed here as FIQL/RSQL. If your platform doesn't provide any library then it is possible to generate a parser using ABNF from the draft [documentation page](https://datatracker.ietf.org/doc/html/draft-nottingham-atompub-fiql-00) or from the [RSQL GitHub page](https://github.com/jirutka/rsql-parser). Take note, that FIQL/RSQL is easily extendable with custom functions required by an API and can be used with XML/JSON responses despite the fact that initially it was designed as a feed query language.
```

- Advanced filtering **MUST** specify the entirety of the expression as a value of the single dedicated `filter` query parameter unless using advanced filtering for a particular subset of your payload response.
    - `filter` **MUST** only be specified once in the URL.
    - `filter` **MUST** only contain the FIQL/RSQL syntax specified in these standards.
- Each query parameter value or any field value inside FIQL/RSQL expression **MUST** be URL encoded. FIQL/RSQL expression itself generally does not require encoding as there are no unsafe characters.
- FIQL/RSQL expressions **MUST** use logical AND operators as `;` (semicolon) and OR operators as `,` (comma), regardless of newer RSQL language alternatives for the same operators, to preserve consistency between APIs.
- Advanced filtering **MAY** be applied to particular query parameters to filter based on a subset of attributes in the format `attributeFilter` (where keyword `attribute` is your attribute name), commonly referred to as hybrid filtering (hybrid between simple and advanced).
    - Using "simple" or "advanced" filtering without the hybrid approach **SHOULD** be the preferred choice. Hybrid filtering is not desirable but may be necessary based on the constraints of your implementation and requirements (including performance).
        - Hybrid filtering is intended to support scenarios where API producers are unable to provide advanced filtering capability on all aspects of the payload response attributes and want to provide scope clarity in the attribute filter name.
    - Hybrid filtering attribute values **MUST** be valid advanced filtering expressions (FIQL/RSQL).
    - Hybrid filtering **MAY** be offered on multiple attributes, but **MUST** never exist if a root "filter" query parameter is available.
    - Hybrid filtering with multiple attribute filters **MUST** logically "AND" the results of both filters together (unless the attribute name is repeated, in which case repeated attributes names are "OR" for the results as described in simple filtering).
    - Hybrid filtering **MAY** be combined with additional simple filtering query parameters, provided they do not have a suffix of `Filter`.

```
// EXAMPLE OBJECT
GET /articles
RESPONSE
{
    "results": [
        {
            "title": "Title",
            "reviewRating": 5,
            "categories: ["Fiction", "Drama"]
            "author": {
                "firstName": "John",
                "lastName": "Doe",
                "age": 50
            },

        }
    ],
    "paging": {
        "totalCount": 1,
        "limit": 25,
        "offset": 0
    }
}

// CORRECT
GET /articles?filter=reviewRating=gt=4                          // articles with a review rating greater than 4
GET /articles?filter=title==Title;author.lastName==Doe          // articles with the title "title" and author last name "Doe"
GET /articles?filter=author.age=gt=42;author.firstName==John    // articles with an author of age greater than 42 AND first name "John"
GET /articles?filter=author.age=gt=42,author.firstName==John    // articles with an author of age greater than 42 OR first name "John"
GET /articles?authorFilter=lastName==Doe&title=Title            // hybrid filter that offers advanced filtering syntax ONLY for author object, and simple filtering otherwise.

// ADVANCED CORRECT EXAMPLE
GET /articles?filter=(categories=in=(Fiction,Drama),title==Butterflies*),(categories=out=(NonFiction),author.age=gt=12)
// articles with title starting with "Butterflies" in the Fiction OR Drama category
// OR
// articles with an author who's age is greater than 12 not in the NonFiction category.

// INCORRECT
GET /articles?filters=reviewRating=gt=4                      // "filter" query parameter must not be pluralized
GET /articles?filter=reviewRating=gt=4&filter=title==test    // cannot use more than one "filter" query parameter
GET /articles?filter=author.name.designation.type=="MR"      // object selection pattern is too deep
DELETE /articles?title=My%20Book                             // filtering parameters SHOULD NOT be used for any method other than GET, especially not for bulk delete operations.
```

### FIQL/RSQL

Getting Started: [REST Query Language with RSQL](https://www.baeldung.com/rest-api-search-language-rsql-fiql)

- [Java: rsql-parser](https://github.com/jirutka/rsql-parser) (with DataSource Connectors)
- [Python: FIQL Parser](https://fiql-parser.readthedocs.io/en/stable/) (**Note**: Requires URL encoded string in parser input)
- [Go: go-rsql](https://github.com/rbicker/go-rsql)
- [Node.js & JavaScript: rsql](https://github.com/piotr-oles/rsql)
- [.NET: rsql4net](https://github.com/gwendallg/rsql4net)
- [Example Lines of Code for a Custom Parser](https://gist.github.com/jirutka/42a0f9bfea280b3c5dca) for Java Persistence API (JPA)

It is not mandatory to support all operators listed in the table below as this document is about syntax and convention. Any API may support just a subset of given operators or provide additional operators if needed.

| Filter | Operator | Standard | Example | Notes |
| ------ | -------- | -------- | ------- | ----- |
| Equals | `==` | FIQL | someKey==value<br />someKey==*value<br />someKey==value*<br />someKey==*value*<br />someKey==*va*ue*<br />someKey=="Should be quoted if a value contains whitespaces or any reserved characters" | Allowed to use wildcard symbol '*' at the beginning, at the end, in the middle, or in multiple places of a string to represent 'ends with', 'starts with', 'contains', or 'like' functions. An endpoint should provide documentation about wildcard usage and the default case. |
| Not Equals | `!=` | FIQL | someKey!=value<br />someKey!=*value<br />someKey!=value*<br />someKey!=*value*<br />someKey!=*va*ue* | Allowed to use wildcard symbol '*' at the beginning, at the end, in the middle, or in multiple places of a string to represent 'not ends with', 'not starts with', 'not contains', 'not like' functions. An endpoint should provide documentation about wildcard usage and the default case. |
| Less Than | `=lt=` | FIQL | someKey=lt=42 | < |
| Less Than or Equals | `=le=` | FIQL | someKey=le=42 | <= |
| Greater Than | `=gt=` | FIQL | someKey=gt=42 | > |
| Greater Than or Equals | `=ge=` | FIQL | someKey=ge=42 | >= |
| In | `=in=` | RSQL | someKey=in=(1,2,3) | Can be added as a custom function to any FIQL library if you can't find any RSQL compatible library for your platform |
| Not In | `=out=` | RSQL | someKey=out=(1,2,3) | Can be added as a custom function to any FIQL library if you can't find any RSQL compatible library for your platform |
| Is NULL | `=isnull=` | Custom | someKey=isnull=true | If API requires NULL check then this operator should be used. |
| String Operators | =contains=<br />=containsic=<br />=startswith=<br />=startswithic=<br />=endswith=<br />=endswithic=<br />=like=<br />=notlike=<br />=likeic=<br />=notlikeic=<br /> | Custom | someKey=contains=VALUE<br />case sensitive check as the given function doesn't have 'ic' suffix, where 'ic' means "ignoring case" | If API requires special handling for strings it is allowed to provide a custom operator with or without the 'ic' suffix to support advanced string filtering. It is the responsibility of the implementor to maintain consistency between wildcards used with 'Equals' and 'Not Equals' operators and custom functions. |

```warning
The dynamic nature of filters means that all fields cannot be listed in Open API specifications because there could be dozens for a single endpoint depending on the level of nesting in the response. Instead, Open API specification may contain generic information about the supported filtering approach, the list of allowed operators, examples, and other information that may be helpful for a user.
```

## Sorting

Sorting on collection endpoints should be done by specifying the attributes that should be sorted or ordered by using an ordering query parameter.

- Sorting is not a requirement on all collection-based endpoints.
- Sorting query parameters **MUST** always be optionally applied as indicated by URL Structures that all query parameters are always optional.
- Default sort order **SHOULD** be considered as `undefined` and non-deterministic from the API consumer's perspective when no sorting query parameters are provided.
    - A default sort order **MUST** be applied internally for implementation purposes to provide consistently paged responses.
    - A default sort order modification is not considered an API breaking change unless the behavior is documented as such.
- Sorting **SHOULD** only occur on endpoints that are collections using the schema described above.
- Sorting **MUST** only be implemented on `GET-based` HTTP Methods via query parameters.
- Sorting query parameters **MUST** be included as part of the pagination next/previous URLs, similar to how `limit` is included as an additional query parameter.
- If an explicit sort order is desired, the query parameter `ordering` **MUST** be used to specify attribute names.
- Specifying an attribute name in the ordering parameter **MUST** sort by that attribute ascending (ASC). Specifying a `-` sign in front modifies to descending (DESC) on the same attribute.
- Attributes specified for sorting **MUST** match attributes returned in the response payload.
- Multiple attributes **MUST** be sorted on in a given request if provided by multiple `ordering` attributes, prioritized based on the order they are specified.
- Sorting attribute names may represent nested objects and **MUST** use a period to represent each segment of the object path: `grandparent.parent.child`.

```
// CORRECT
GET /articles?ordering=title                                // order articles by title ASC
GET /articles?ordering=-title                               // order articles by title DESC
GET /articles?ordering=title&ordering=-reviewRating         // order articles first by title ASC, then by reviewRating DESC
GET /articles?limit=25&offset=25&title=Book&ordering=title  // get 25 articles per page, starting at article 25, order the articles by title ASC
GET /articles?ordering=author.firstName                     // order articles by authors first name ASC

// INCORRECT
GET /articles?ordering=title,-reviewRating                  // ordering multiple attributes is not applied via CSV
GET /articles?orderings=title&orderings=-reviewRating       // never use pluralized "orderings"
DELETE /articles?ordering=title                             // ordering only applies to GET methods.
```
