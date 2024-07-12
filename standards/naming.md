# Naming

## Overview

<sub>Reference: [Google APIs Naming Convention](https://cloud.google.com/apis/design/naming_convention)</sub>

Effective naming, can be one of the most difficult tasks in software engineering. When building and designing an API you will be required to name many things. These conventions serve as general considerations and in some cases requirements for naming all aspects. In order to provide consistent developer experience across many APIs and over a long period of time, all names used by an API **SHOULD** be:

- simple
- intuitive
- consistent

This includes names of interfaces, resources, collections, methods, and messages.

Since many developers are not native English speakers, one goal of these naming conventions is to ensure that the majority of developers can easily understand an API. It does this by encouraging the use of a simple, consistent, and small vocabulary when naming methods and resources.

```note
"The function of a name is to facilitate sharing" (Ross J. Anderson).

When you consider the names to use for your path, endpoints and other components take into account the purpose of the name is more notably for the consumers of your API, as terminology that they should relate to.
```

## General

- Names **MUST** be correct American English. For example, license (instead of licence), color (instead of colour).
- Best effort **MUST** be made to consider other cultures that could be using our APIs. It's possible an innocuous English word has unintended consequences in another language, which could be embarrassing for the organization.
- Slang and potential vulgarities **MUST NOT** be used under any circumstances.
- Terminology **SHOULD** be intuitive and familiar where possible. For example, when describing removing (and destroying) a resource, delete is preferred over erase.
- Names **MUST** use the same term for the same concept used elsewhere, including concepts shared across APIs. Refer to specific components below.
- Names **MUST** be different for different concepts.
- Overly general names that are ambiguous within the context of the API and the larger ecosystem of APIs **MUST** be avoided (i.e. "identity", "notification-service", etc). They can lead to a misunderstanding of API concepts. Rather, choose specific names that accurately describe the API concept. - This is particularly important for names that define first-order API elements, such as resources. There is no definitive list of names to avoid, as every name must be evaluated in the context of other names.
- Names that may conflict with keywords in common programming languages **SHOULD NOT** be used. <a name="sps-no-keyword-conflicts" href="#sps-no-keyword-conflicts"><i class="fa fa-check-circle" title="#sps-no-keyword-conflicts"></i></a>
- Names **SHOULD** use abbreviations instead of long form names. <a name="sps-mandate-abbreviations-identifier" href="#sps-mandate-abbreviations-identifier"><i class="fa fa-check-circle" title="#sps-mandate-abbreviations-identifier"></i></a> <a name="sps-mandate-abbreviations-reference" href="#sps-mandate-abbreviations-reference"><i class="fa fa-check-circle" title="#sps-mandate-abbreviations-reference"></i></a> <a name="sps-mandate-abbreviations-organization" href="#sps-mandate-abbreviations-organization"><i class="fa fa-check-circle" title="#sps-mandate-abbreviations-organization"></i></a>

## Text

- Anywhere text occurs in request structures, responses, or documentation **MUST** follow best practices with regard to spelling and grammar.
- In any place that text could be presented to customers, care **MUST** be taken to ensure that the voice of the text represents the enterprise in the best possible light.

## Property Names

- Object properties **SHOULD** be adjectives or nouns.
- Abbreviations of properties **MUST NOT** be used unless the abbreviation is clearer and better established than the full spelling.
  - Examples of preferable abbreviations would include `id`, `html`, or `api`.
- camelCase **MUST** be used for all property names in both request and response payloads: <a name="sps-camel-case-properties" href="#sps-camel-case-properties"><i class="fa fa-check-circle" title="#sps-camel-case-properties"></i></a>

```
// INCORRECT
OrderNumber
line_item_number

// CORRECT
orderNumber
lineItemNumber
```

- All acronyms **MUST** follow camelCase standards if they are part of the property name. <a name="sps-camel-case-properties" href="#sps-camel-case-properties"><i class="fa fa-check-circle" title="#sps-camel-case-properties"></i></a>

```
// INCORRECT
ID
documentID
imageURL


// CORRECT
id
documentId
imageUrl
```

- Property names **SHOULD NOT** include prepositions (e.g. "for", "during", "at"). <a name="sps-disallowed-prepositions" href="#sps-disallowed-prepositions"><i class="fa fa-check-circle" title="#sps-disallowed-prepositions"></i></a>

```
// INCORRECT
reasonForError
cpuUsageAtTimeOfFailure

// CORRECT
errorReason
failureTimeCpuUsage
```

- Property names **SHOULD NOT** use post-positive adjectives (modifiers placed after the noun):

```
// INCORRECT
itemsCollected
objectsImported

// CORRECT
collectedItems
importedObjects
```

- Boolean properties **SHOULD NOT** use is, has, or another prefix. <a name="sps-disallowed-boolean-prefixes" href="#sps-disallowed-boolean-prefixes"><i class="fa fa-check-circle" title="#sps-disallowed-boolean-prefixes"></i></a>
- Boolean properties **SHOULD** describe their associated entity using adjectives and not nouns.
  - Boolean properties **SHOULD NOT** be pluralized (i.e. avoid pluralized nouns acting as adjectives).

```
// INCORRECT
isActive    // uses prefix
item        // noun
locations   // noun and pluralized

// CORRECT
active
clever
enabled
```

- Fields that indicate repeated values or arrays **MUST** use proper plural forms.

```
// INCORRECT
collectedItem: []

// CORRECT
collectedItems: []
```

- Property names **MUST** consider the appropriate tense (past, present, future) based on their context and domain model.

```
// CONSIDERATION EXAMPLES
start, starting, started
run, running, ran
```

- Property names **SHOULD** implicitly relate to their parent entity, otherwise, the property name **SHOULD** be prefixed with a domain-specific entity name that it is associated with.

```
// INCORRECT EXAMPLE
GET /v1/books/5196ab21
RESPONSE
{
    "bookId": "5196ab21",                       // since the request for the resource was a "book", the attribute should just be "id"
    "name": "The Best Book",
    "author": {
        "authorId": "3793213e",                 // the parent entity is an author, so it should be "id" for the attribute name.
        "authorName": "John Doe",               // the parent entity is an author, so it should be "name" for the attribute name.
        "publisherName": "My Publishing House"  // this name attribute MUST have a prefix for another entity, since its not the name of this entity "author"
    }
}

// CORRECT EXAMPLE
GET /v1/books/5196ab21
RESPONSE
{
    "id": "5196ab21",
    "name": "The Best Book",
    "author": {
        "id": "3793213e",
        "name": "John Doe",
        "publisherName": "My Publishing House"
    }
}
```

- Rather than property names referring to the implementation for 'hash' or 'hashkey', you **MUST** use the property name 'fingerprint'. <a name="sps-fingerprint-naming" href="#sps-fingerprint-naming"><i class="fa fa-check-circle" title="#sps-fingerprint-naming"></i></a>

## DataTypes

- orgId **MUST** use a data type of 'string'. <a name="sps-invalid-id-type" href="#sps-invalid-id-type"><i class="fa fa-check-circle" title="#sps-invalid-id-type"></i></a>

- ref **MUST** use a data type of 'string'. <a name="sps-invalid-ref-type" href="#sps-invalid-ref-type"><i class="fa fa-check-circle" title="#sps-invalid-ref-type"></i></a>

- orgId **MUST** use a data type of 'string'. <a name="sps-invalid-orgid-type" href="#sps-invalid-orgid-type"><i class="fa fa-check-circle" title="#sps-invalid-orgid-type"></i></a>

- name **MUST** use a data type of 'string'. <a name="sps-invalid-name-type" href="#sps-invalid-name-type"><i class="fa fa-check-circle" title="#sps-invalid-name-type"></i></a>

- description **MUST** use a data type of 'string'. <a name="sps-invalid-description-type" href="#sps-invalid-description-type"><i class="fa fa-check-circle" title="#sps-invalid-description-type"></i></a>

- requestId **MUST** use a data type of 'string'. <a name="sps-invalid-requestid-type" href="#sps-invalid-requestid-type"><i class="fa fa-check-circle" title="#sps-invalid-requestid-type"></i></a>

- createdDateTime **MUST** use a data type of 'string' with the format 'date-time'. <a name="sps-invalid-createddatetime-type" href="#sps-invalid-createddatetime-type"><i class="fa fa-check-circle" title="#sps-invalid-createddatetime-type"></i></a>

- createdBy **MUST** use a data type of 'string'. <a name="sps-invalid-createdby-type" href="#sps-invalid-createdby-type"><i class="fa fa-check-circle" title="#sps-invalid-createdby-type"></i></a>

- modifiedDateTime **MUST** use a data type of 'string' with the format 'date-time'. <a name="sps-invalid-modifieddatetime-type" href="#sps-invalid-modifieddatetime-type"><i class="fa fa-check-circle" title="#sps-invalid-modifieddatetime-type"></i></a>

- modifiedBy **MUST** use a data type of 'string'. <a name="sps-invalid-modifiedby-type" href="#sps-invalid-modifiedby-type"><i class="fa fa-check-circle" title="#sps-invalid-modifiedby-type"></i></a>

- deletedBy **MUST** use a data type of 'string'. <a name="sps-invalid-deletedby-type" href="#sps-invalid-deletedby-type"><i class="fa fa-check-circle" title="#sps-invalid-deletedby-type"></i></a>

## Identifiers

- An entity with a unique identifier **MUST** be labeled as `id`.

```
// CORRECT
{
    "id": "b96cb3ead9a9",
    "name": "The Best Book"
}
```

- Any unique identifier of an entity **MUST** have Id after the entity name when referenced from another entity.

```
// CORRECT
{
    "id": "b96cb3ead9a9",
    "name": "The Best Book",
    "authorId": "3793213e"      // usage of "authorId" references this is the id for a different entity.
}
```

- Unique identifiers **SHOULD** be string values and considered opaque as described in [serialization of numbers](serialization.md#number).

```
// INCORRECT
{
    "id": 2
}

// CORRECT
{
    "id": "b96cb3ead9a9"
}
```

## Domain References

- Unique references to other significant entities within your API Domain, but in a different root resource **SHOULD** use a [URN (Uniform Resource Name)](https://en.wikipedia.org/wiki/Uniform_Resource_Name)-like references where appropriate. <a name="sps-ref-property-name" href="#sps-ref-property-name"><i class="fa fa-check-circle" title="#sps-ref-property-name"></i></a>
  - URN-like refers to using the convention of specifying agreed upon namespaces and entities followed by the object identifier, but without the `urn` prefix or formal registration of the namespace ID with IANA according to [RFC8141](https://datatracker.ietf.org/doc/rfc8141/). This provides interoperability and durability benefits within your API and endpoint ecosystem.
  - URN-like references **MUST** be the form of standard `URNs` without the `urn:` prefix to avoid confusion of official registration, with a much more opinionated structure. A simplified example would be: `{namespace}:{entity}:{sub-entity}:{id}` (e.g. `sps:document:shipment:b96cb3ead9a9`). <a name="sps-ref-schema" href="#sps-ref-schema"><i class="fa fa-check-circle" title="#sps-ref-schema"></i></a>
    - URN-like references **MUST** have a max-length of 255 characters.
    - URN-like references **MUST** be case-sensitive.
    - URN-like `{namespace}` **MUST** be a single value applied across all API endpoint response for the usage of self-referencing `ref` properties. At SPS Commerce this value **MUST** be `sps`.
    - URN-like `{namespace}` **MUST** only contain lowercase alpha characters `[a-z]` with a maximum length of 10 characters.
    - URN-like `{entity}` **MUST** only contain lowercase alpha-numeric characters `[a-z0-9]` with a maximum length of 20 characters. `{entity}` **SHOULD** be specified as singular.
    - URN-like `{sub-entity}` **MUST** only contain lowercase alpha-numeric characters `[a-z0-9]` with a maximum length of 20 characters, but can be empty. It **SHOULD** represent a more specific variation of the `{entity}` from a polymorphic standpoint rather than represent a hierarchy. The sub-entity is an optional value that can be omitted. When omitting the sub-entity, the `:` delimiter **MUST** still be included (e.g. `sps:document::b96cb3ead9a9`).
    - URN-like `{id}` **MUST** abide by the requirements and restrictions indicated for [identifiers](#identifiers).
  - URN-like references **MUST** use the naming `ref` in the same way `id` is used for unique identifiers. `ref` can be used as a standalone property name indicating the unique name for the current entity, while `ref` can be used as a suffix to indicate the unique resource name for another entity.
  - Responses containing self-reference property `ref` **MUST** always include an associated `id` property that matches the `{id}` portion of the URN-like `ref` value.

```
// INCORRECT EXAMPLE
GET /v1/documents/5196ab21
RESPONSE
{
    "id": "5196ab21",
    "ref": "sps:Documents:shipment:123456", // The Object ID Portion of this URN-like value does not match the "id" property.
                                            // The URN-like value for "entity" must be in lowercase as "document"
    "name": "Document 1",
    "org": "org:3793213e"                   // In the URN-like value, there is no provided namespace. At least a namespace, entity, and id are required.
                                            // Additionally, the property name should contain the "Ref" suffix as "orgRef".
                                            // Since there is no sub-entity, there should be an extra ":" delimiter.
}

// CORRECT EXAMPLE
GET /v1/documents/5196ab21
RESPONSE
{
    "id": "5196ab21",
    "ref": "sps:document:shipment:5196ab21", // All self-referencing URN-like values on a resource must contain the namespace prefix "sps".
    "name": "Document 1",
    "orgRef": "sps:org::3793213e"           // "org" is recognized in this example as a significant entity in the API domain, and has an URN, but no sub-entity.
}
```

## Standard Properties

The following properties represent standardized names that are cross-domain transferable or used in a wide variety of API schemas. As a quick reference, you should prefer to use these names when designing APIs that require some very standard fields, such as those used for auditing or last modification. At times there may be more appropriate domain-specific choices to use instead.

Refer to further information in [Serialization](serialization.md) with regard to specific property naming conventions based on JSON types.

| Name               | Type           | Description |
| ------------------ | -------------- | ----------- |
| id                 | String         | A unique identifier for the parent entity.  |
| ref                | String         | A unique reference for the parent entity / resource using unique resource names.  |
| orgId              | String         | A unique identifier for an organization, typically a UUID. |
| orgRef             | String         | A unique reference for an organization using its domain qualified unique resource name containing the orgId. |
| name               | String         | The official name of the parent entity. |
| description        | String         | Text describing the parent entity. |
| requestId          | String         | Used to represent a unique tracing identified associated with the platform. |
| createdDateTime    | DateTime       | The creation timestamp of an entity. |
| createdBy          | String         | An identifier for a user that created an entity. |
| modifiedDateTime   | DateTime       | The modified timestamp of an entity. |
| modifiedBy         | String         | An identifier for a user that modified an entity. |
| deletedBy          | String         | An identifier for a user that deleted an entity. |
| fingerprint        | String         | Fingerprint represents a hashed reference to an associated data context (e.g file content hash, document identifier hash, etc). Use this standardized name over something like `hashkey`.<a name="sps-fingerprint-naming" href="#sps-fingerprint-naming"><i class="fa fa-check-circle" title="#sps-fingerprint-naming"></i></a> |

Additional standardized property names and schemas are also described in the following:

- [Collections](collections.md)
- [Errors](errors.md)
- [Serialization](serialization.md)
