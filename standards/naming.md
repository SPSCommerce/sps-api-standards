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
- Names that may conflict with keywords in common programming languages **SHOULD NOT** be used. 

## Text

- Anywhere text occurs in request structures, responses, or documentation **MUST** follow best practices with regard to spelling and grammar.
- In any place that text could be presented to customers, care **MUST** be taken to ensure that the voice of the text represents the enterprise in the best possible light.

## Property Names

- Object properties **SHOULD** be adjectives or nouns.
- Abbreviations of properties **MUST NOT** be used unless the abbreviation is clearer and better established than the full spelling.
    - Examples of preferable abbreviations would include `id`, `html`, or `api`.
- camelCase **MUST** be used for all property names in both request and response payloads:

```
// INCORRECT
OrderNumber
line_item_number
 
// CORRECT
orderNumber
lineItemNumber
```

- All acronyms **MUST** follow camelCase standards if they are part of the property name.

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

- Property names **SHOULD NOT** include prepositions (e.g. "for", "during", "at"):

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

- Boolean properties **SHOULD NOT** use is, has, or another prefix.
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

- Fields that indicate repeated values or arrays always **MUST** use proper plural forms.

```
// INCORRECT
collectedItem: []
 
// CORRECT
collectedItems: []
```

- Any identifier of a resource **SHOULD** have Id after the entity name when referenced from another entity.

```
// INCORRECT
documentCode
 
// CORRECT
documentId
```

- Attribute names **MUST** consider the appropriate tense (past, present, future) based on their context and domain model. 

```
// CONSIDERATION EXAMPLES
start, starting, started
run, running, ran
```

- Attribute names **SHOULD** describe their parent entity, otherwise, the attribute name **SHOULD** be prefixed with a domain-specific entity name that it is associated with. 

```
// INCORRECT EXAMPLE
GET /v1/books/2345
RESPONSE
{
    "bookId": 2345,                             // since the request for the resource was a "book", the attribute should just be "id"
    "name": "The Best Book",
    "author": {                    
        "authorId":456,                         // the parent entity is an author, so it should be "id" for the attribute name.
        "authorName": "John Doe",               // the parent entity is an author, so it should be "name" for the attribute name.
        "publisherName": "My Publishing House"  // this name attribute MUST have a prefix for another entity, since its not the name of this entity "author"
        "agentId": 2                            // this name is appropriate with Id following its associated entity name.
    }
}
 
// CORRECT EXAMPLE
GET /v1/books/2345
RESPONSE
{
    "id": 2345,                            
    "name": "The Best Book",
    "author": {                    
        "id":456,                      
        "name": "John Doe",            
        "publisherName": "My Publishing House",
        "agentId": 2
    }
}
```

## Standard Properties

The following properties represent standardized names that are cross-domain transferable or used in a wide variety of API schemas. As a quick reference, you should prefer to use these names when designing APIs that require some very standard fields, such as those used for auditing or last modification. At times there may be more appropriate domain-specific choices to use instead.

Refer to further information in [Serialization](serialization.md) with regard to specific property naming conventions based on JSON types.

| Name               | Type           | Description |
| ------------------ | -------------- | ----------- |
| id                 | String         | A unique identifier for the parent entity.  |
| orgId              | String         | A unique identifier for an organization, typically a UUID. |
| name               | String         | The official name of the parent entity. |
| description        | String         | Text describing the parent entity. |
| requestId          | String         | Used to represent a unique tracing identified associated with the platform. |
| createdDateTime    | DateTime       | The creation timestamp of an entity. |
| createdBy          | String         | An identifier for a user that created an entity. |
| modifiedDateTime   | DateTime       | The modified timestamp of an entity. |
| modifiedBy         | String         | An identifier for a user that modified an entity. |
| deletedBy          | String         | An identifier for a user that deleted an entity. |
| fingerprint        | String         | Represents a hash key value derived from the content of associated asset(s). |

Additional standardized property names and schemas are also described in the following:
- [Collections](collections.md)
- [Errors](errors.md)
- [Serialization](serialization.md)