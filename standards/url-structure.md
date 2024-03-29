# URL Structure

## Overview

A "Uniform Resource Locator (URL)" is a subset of a URI, and intentionally includes the specified protocol, host, path, hash, and query string. This definition intends to address all aspects of the URL and its structure as it relates to REST API standards.

```
https://api.spscommerce.com/path-1/path-2?queryParam1=value&queryParam2=value2#fragments-here
|------|-------------------|-------------|-----------------------------------|----------------|
Protocol      Host              Path                    Query                    Fragment
```

- APIs **SHOULD NOT** expand their total URL length beyond a few hundred characters, with the host+path generally being less than 100 characters for readability and usability. While there is no absolute definition of the maximum size of a URL, some rare legacy constraints for older browsers and implementations restrict you to 2,048 characters. For good measure and simplicity keeping the total length less than a few hundred forces better design and usage of request bodies at that size. <a name="sps-limit-path-size" href="#sps-limit-path-size"><i class="fa fa-check-circle" title="#sps-limit-path-size"></i></a>

## Protocol

- APIs **MUST** be accessible via HTTPS only (and specifically not accessible by HTTP).<a name="sps-hosts-https-only" href="#sps-hosts-https-only"><i class="fa fa-check-circle" title="#sps-hosts-https-only"></i></a>
- APIS **MUST** follow guidance on TLS and security protocols and versions to be used with HTTPS provided by the security team.

## Host

- Distributed APIs **SHOULD** be accessible under a centralized and singular hostname giving the appearance of a single API. <a name="sps-hosts-spscommerce-domain" href="#sps-hosts-spscommerce-domain"><i class="fa fa-check-circle" title="#sps-hosts-spscommerce-domain"></i></a>

```
// CORRECT
api.spscommerce.com/users
api.spscommerce.com/articles
 
// INCORRECT
users.spscommerce.net/
articles.spscommerce.net/
```

- APIs **MUST** differentiate their deployment environment based on hostnames and **NOT** based on URL Path. <a name="sps-path-no-environment" href="#sps-path-no-environment"><i class="fa fa-check-circle" title="#sps-path-no-environment"></i></a>

```
// CORRECT
api.spscommerce.com/users
integration.api.spscommerce.com/users
 
// INCORRECT
api.spscommerce.com/prod/users
api.spscommerce.com/integration/users
```

- APIs **MUST** use hostnames (DNS) that reflect the intended usage for internal network access or public access. 
- APIs **MUST NOT** use a publicly available DNS hostname for a service that is intended for internal access only.

```
// CORRECT
api.spscommerce.com/users    // (External)
api.sps-internal.com/users   // (Internal)
 
// INCORRECT
users.spscommerce.io/        // (External)
users.spscommerce-prod.in/   // (Internal)
```

- When URLs are provided as referenced relative paths in your API they **MUST** be relative to the host (i.e. `/users/profiles/1` for `https://api.spscommerce.com/users/profiles/1`).

## Port

- The port **MUST NOT** be provided by any consumers, mentioned in documentation or required to access your API, and is always assumed to be an abstract default of the layered system based on your protocol (i.e. HTTPS, 443). <a name="sps-hosts-no-port" href="#sps-hosts-no-port"><i class="fa fa-check-circle" title="#sps-hosts-no-port"></i></a>

## Path

### Resources

The paths of your API **MUST** be structured using the concepts defined for resources by REST. A resource in REST is a similar Object in Object-Oriented Programming or is like an Entity in a Database. An addressable resource is an endpoint that actions can be performed on and its state updated. 

- A resource **MUST** be a noun (person, place, or thing).
- A resource **SHOULD** be plural.
- A resource **MUST** be named based on American English (en-US) locale.
- A resource **MUST** be addressed by stable and permanent identifiers only.
- A resource **MUST NOT** leak or expose format or technology-specific information at any point in the path (i.e. `/index.php`). <a name="sps-paths-expose-technology" href="#sps-paths-expose-technology"><i class="fa fa-check-circle" title="#sps-paths-expose-technology"></i></a>
- A resource **SHOULD NOT** make use of an extension at any point in the path. (i.e. `/test.pdf`). <a name="sps-paths-expose-extension" href="#sps-paths-expose-extension"><i class="fa fa-check-circle" title="#sps-paths-expose-extension"></i></a>
- A resource containing multiple words **MUST** be separated using kebab-case (i.e. `/change-management/`). <a name="sps-paths-kebab-case" href="#sps-paths-kebab-case"><i class="fa fa-check-circle" title="#sps-paths-kebab-case"></i></a>
- A resource **SHOULD NOT** include acronyms or abbreviations.
- A resource **SHOULD NOT** include HTTP method names. <a name="sps-paths-with-http-methods" href="#sps-paths-with-http-methods"><i class="fa fa-check-circle" title="#sps-paths-with-http-methods"></i></a>
- A resource **SHOULD NOT** dynamically change its response body schema or shape based on query parameters or other dynamic behavior. If you require a differently shaped body to be returned, consider - breaking it into different resource endpoints.
- A resource **MUST** only contain lowercase ISO basic Latin alphabet characters, the numeric characters `0-9`, and a hyphen or dash character. <a name="sps-paths-no-special-characters" href="#sps-paths-no-special-characters"><i class="fa fa-check-circle" title="#sps-paths-no-special-characters"></i></a>
- A resource **SHOULD NOT** contain `api` as a prefix in or a part of the path. <a name="sps-paths-with-api" href="#sps-paths-with-api"><i class="fa fa-check-circle" title="#sps-paths-with-api"></i></a>
- A resource **MUST** use normalized paths without empty path segments. <a name="sps-paths-empty-segments" href="#sps-paths-empty-segments"><i class="fa fa-check-circle" title="#sps-paths-empty-segments"></i></a>
- A resource **MUST** be addressable without a trailing slash on the URI (i.e. `/users`) and additionally **SHOULD** support a trailing slash as the same addressable resource (i.e. `/users/ == /users`). <a name="sps-paths-trailing-slash" href="#sps-paths-trailing-slash"><i class="fa fa-check-circle" title="#sps-paths-trailing-slash"></i></a>
- Personally identifiable information and other sensitive data **MUST NOT** be used within the URL as it can be easily inadvertently exposed. This data should be transmitted via HTTP Header or  Request Body (both of which are encrypted during transport).


```
// CORRECT
/users                      // reference a collection of users
/users/1                    // reference a single user by their ID
/change-requests            // kebab casing used to represent compound noun
/colors/red                 // correct usage of accessing the "red" object part of colors collection
/devices/telephone          // correct usage of accessing the "telephone" object device.

 
// INCORRECT 
/user                       // must be plural
/execute                    // not a noun (verb)
/changeRequests             // invalid casing
/users/documents/index.php  // leaking of a technology
/colours/red                // "colour" uses en-CA english instead of American
/devices/tel                // should not use an abbreviation for "telephone"
/api/users                  // should not contain self-identity description of "api"
/users//profile             // must not contain an empty path between two slashes
```

```note
**Consideration**: Refer to further generalized considerations on naming conventions and best practices for Naming in [Serialization](serialization.md#naming).
```

### Hierarchy

Resources in the path **SHOULD** be repeated as a representation of a hierarchy for a domain model where possible as part of logical nesting for your endpoints. A hierarchical path is intended to provide context to the consumers of your API about how to use it and some expected behaviors. In many cases, a resource or nested path may directly reflect your Object or Entity Database model. This is often the natural case for brand new micro-services with a highly encapsulated domain-driven design, while other abstracted services that have evolved over time or have many layers of dependencies may represent a simplified or alternate hierarchical model through the REST API contracts than what truly exists. While both of these scenarios are valid, in either case, you'll look to provide consistency in your hierarchy and resource naming.

```note
**Rule of Thumb**: When thinking about whether you intend to nest resource paths, consider if a given resource can exist without the resource above it (i.e. if you were to cascade delete a top-level resource, the implication is that all resources under that path are also removed). If the answer is "no", then that is generally a positive logical nest. If the answer is "yes", you might have to consider other aspects of usage and the domain model with the decision or right answer being a bit more ambiguous. 
```

- Natural hierarchical resources **SHOULD** be structured in a nested path. 

```
// CORRECT
/articles/1/comments        // the comments resource can only exist in association to the article
 
// INCORRECT
/comments                   // not explicitly incorrect, depending on the relationship of comments to the articles in your API.
```

- Dynamic identifiers in the path:
    - **MUST** be used to create an addressable resolution to specific resources.
    - **MUST** be associated with the preceding name in the path.
    - **MUST** be capable of identifying the specific resource in the addressable context.
    - **MUST** be considered stable and not information that is subject to change on the resource.

    ```
    // CORRECT
    /articles/1/comments/2      // ID in the URL after articles "1" refers to the unique identifier for the article.
                                // ID in the URL after comments "2" refers to the unique identifier for the article / comment composition.
    
    // INCORRECT
    /articles/1/2               // Unknown contextual usage of "2".
    ```
    - **SHOULD** be compositional with multiple identifiers specified in sequence when culturally or domain appropriate and still representing a hierarchy. 
    ```
    // CORRECT
    /repos/spscommerce/sps-atlas/pulls      // the value of "spscommerce/sps-atlas" is well understand as a reference in the industry to a repository.
    /states/us/texas                        // the value for a country and state is well-understood and very stable
    /time/2010/04/12                        // date and time formatting would be appropriate for historical references, but must abide by DateTime format serialization
    ```

    ```note
    For Date and Time references to format and serialization in the body or the path refer to [Serialization](serialization.md).
    ```

- The hierarchy of nested resources **SHOULD NOT** exceed more than 3 resources. <a name="sps-paths-limit-sub-resources" href="#sps-paths-limit-sub-resources"><i class="fa fa-check-circle" title="#sps-paths-limit-sub-resources"></i></a>

```
// INCORRECT
/articles/1/comments/2/sentences/5/words/4  // this is realistically too long to distill effective context without overloading the consumer.
                                            // consider other options fo breaking apart the model, including ensuring the 4-level deep hierarchy is modelled correctly.
```

- Resources **MUST NOT** incorrectly nest other resources that are only partially related.

```
// INCORRECT
/articles/1/comments/2/authors/5    // accessing an individual author does not make sense at this granularity. 
                                    // authors would be more accurately reflected and the root and linked to a comment.
 
// CORRECT
/authors/5                          // accessing an author at the root as its own resource is a more accurate model, 
                                    // and alleviates some nesting. Additional filtering query parameters may be used to filter to an article.   
```

- Resources **SHOULD** recognize a difference in standard canonical and historical paths, by representing historical paths with stable resources based on the time when it makes contextual sense to do so.

```
// CORRECT
/articles/2013/category/rest
```

- Resource endpoints for creating entities **SHOULD NOT** exist under many different nested paths. If your resource compositionally could be placed under multiple paths, consider placing it at the root of the path instead (which makes it difficult to establish any true sense of hierarchy to reflect).

### Shortcuts

It can be necessary to add additional shortcuts to your API if portions of the path become superfluous or contain the usage of unnecessary IDs based on your implementation. 

- Nested collection resources (and root resources) **MAY** apply inherit filters of the same object accessible at other convenient nested paths, but **SHOULD NOT** shortcut all resources as this is an indication that the resource may not be organized correctly in the first place.  

```
// CORRECT
// Comments are accessible and filtered under articles nested path,
// but also accessible across all articles (inherit authorization may 
// filter comments to those created by the requestor by default).

/articles/1/comments     // Path may work for both retrieving as well as creating new comments for specific articles.
/comments                // Access all comments for all articles.        
```

### Static Collections

Many APIs may contain static or reference collections that are often used to display types or enumeration values. 

- Static collections **MUST** be represented as resource endpoints within your API.
- Static collection resources **SHOULD** exist as a root endpoint unless the context is better represented as a nested collection.

```
/types              // if "types" is well understand and used across the domain, it might be represented at the root.
/articles/types     // if "types" is contextually referring to article types, representation under a nested path for articles makes more sense.
```

### Actions

REST only provides constraints and conventions for working with well-defined resources. In practice, an API should strive to derive consistent resource endpoints for their paths but may have the unavoidable scenario of needing to define more action-based endpoints that act upon a resource. A common use case is for APIs that must model actions related to reporting. In these rare cases, you should model actions based on the following guidelines:

- Action style endpoints **MUST** define resources with verbs (actions).
- You **SHOULD NOT** use actions unless it is explicitly necessary. Prefer translation of the action to a noun-based resource where possible, with a consistent model. 

```
// Preference - A noun if you intend to allow standard operations as a normal resource (i.e. read, create, update, delete).
/articles/1/analysis
/articles/1/analysis/3
 
// Acceptable - A verb if this is the only endpoint, the model does not represent a domain (i.e. is a one time analysis report), and is a single action performed.
/articles/1/analyze     // use a verb to describe the action with a non-standard model returned.
```

```note
Using a single endpoint verb to perform an action is only valid as an HTTP POST Method as shown on [Request & Response](request-response.md).
```

## Query Parameters

Query parameters specified on a REST API resource endpoint generally represent an attribute of a resource and rather than a resource itself (unless referencing another resource). Query parameters are a great method of hiding complexities from your resource path when necessary. They are most often used for specifying how to filter a collection and other behaviors discussed in [Collections](collections.md).

- Query parameter keys **MUST** include only alpha-numeric characters and periods: `[Aa0-Zz9]`. <a name="sps-query-params-characters" href="#sps-query-params-characters"><i class="fa fa-check-circle" title="#sps-query-params-characters"></i></a>
- Query parameter keys with periods in them **MUST** only be used to signify relationships in object references. 
- Query parameter keys **MUST** use camelCase. <a name="sps-query-params-camel-case" href="#sps-query-params-camel-case"><i class="fa fa-check-circle" title="#sps-query-params-camel-case"></i></a>
- Query parameters **MUST** accept a collection of values by using the same query key multiple times, each with a different value.
- Query parameter specification sequence or order **MUST NOT** impact the response of the request in any way.
- Query parameters **MUST** be optional. If necessary then they default to sensible choices that balance consumer expectations and API performance. <a name="sps-query-params-not-required" href="#sps-query-params-not-required"><i class="fa fa-check-circle" title="#sps-query-params-not-required"></i></a>
- Query parameters that have defaulted values across many resource endpoints **SHOULD** keep defaults consistent across the API as long as there are no implications on performance in doing so. Where deviation is necessary, it should result in specific annotations to mention this in the Open API documentation. Consider inverting a query parameter name (i.e. "published" vs "unpublished") if different defaults are required on different endpoints in order to be consistent with the defaulted values.
- Additional query parameters not used by the API **MUST** be disregarded without error to make compatibility and transitions simpler and adhere to standards of tolerance.
- Personally identifiable information and other sensitive data, such as Auth Tokens, **SHOULD NOT** be present in the Query Parameters as they can be easily inadvertently exposed. This data should be transmitted via HTTP Request Body. <a name="sps-query-params-no-api-keys" href="#sps-query-params-no-api-keys"><i class="fa fa-check-circle" title="#sps-query-params-no-api-keys"></i></a>

```
// CORRECT
/articles?name=blue
/articles?name=blue&name=red&name=green
/articles?myName=blue&thisDoesNotMatter=true
```

```
// INCORRECT
/articles?access_token=123
/articles?user=bob
```

## Fragments

URL fragments are most often used as anchor points for HTML pages or search functionality proprietary to a particular site. Fragments **MUST NOT** be used for any functionality in creating REST APIs.
