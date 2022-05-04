# Serialization

## Overview

Serialization is the process of translating a data structure or object state into a format that can be stored or transmitted and reconstructed later (Wikipedia). All aspects related to how to ensure the object state is consistently serialized and deserialized should be covered in this content. 

- Resource request/response entities **SHOULD** always be represented in JavaScript Object Notation (JSON) format by default.
- If an `Accept` header is sent and `application/json` is not an acceptable response, a `406` Not Acceptable error **MUST** be returned.

```
// REQUEST
POST /articles
Accept: application/json
Content-Type: application/json
{
    "foo": "bar"
}
  
// RESPONSE
200 OK
Content-Type: application/json
{
    "fooResult": "not-bar"
}
```

## Query Parameters

- Query parameter serialization **MUST** follow HTTP standards and [URL query parameter guidelines](url-structure.md).
- Query parameter values **MUST NOT** represent serialized JSON.

```
// INCORRECT
// JSON strings as params values
https://api.spscommerce.com/documents?q={query: { type: "Order", startDate: "2021-05-16T14:12:07−05:00Z", endDate: "2021-05-17T14:12:07−05:00Z"}}
 
// URL encoded string is not acceptable
https://api.spscommerce.com/documents?q=%7Bquery%3A%20%7B%20type%3A%20%22Order%22%2C%20startDate%3A%20%222021-05-16T14%3A12%3A07%E2%88%9205%3A00Z%22%2C%20endDate%3A%20%222021-05-17T14%3A12%3A07%E2%88%9205%3A00Z%22%7D%7D
 
// CORRECT
// JSON strings as params values
https://api.spscommerce.com/documents?type=Order&startDate=2021-05-16T14:12:07−05:00Z&endDate=2021-05-17T14:12:07−05:00Z
```

- When advanced query language is required in URL query parameters, the guidelines of using `FIQL/RSQL` **SHOULD** be followed in [Collections](collections.md)

```note
APIs **MUST** be strict in the information they produce, and they **SHOULD** be strict in what they consume as well (where tolerance cannot be applied). Since we are dealing with programming interfaces, we need to avoid guessing the meaning of what is being sent to us as much as possible. Given that integration is typically a one-time task for a developer and we provide good documentation, we need to be strict with using the data that is being received. [Postel's law](https://en.wikipedia.org/wiki/Robustness_principle) must be weighed against the many dangers of permissive parsing.
```

## Quantities

- Quantities **SHOULD** use representation by the entity that includes a Unit of Measure (UOM) field along with a quantity field.
- Quantities represented by an integer type **MUST** include the unit of measurement.
- Quantities represented by an integer type **SHOULD** be represented in a 32-bit signed integer in the schema.
- If the quantity is a number of items, then the field **SHOULD** have the suffix Count, for example `nodeCount`.

```
{
  // Quantity represented by Quantity object that represents the amount and Unit of Measure (UOM) fields
  productQuantity: {
    amount: 10,
    uom: "boxes"
  },
 
  // Quantity represented by two fields of amount and UOM next to each other and follow naming convention
  productQuantity: 10,
  productQuantityUom: "boxes",
 
  // Quantity represented by integer should include UOM in the field name, xxx{Bytes|Pixels|Cartons}
  quantityOfBoxes: 15,
 
  // Quantity that indicates number of items/elements have Count suffix
  documentCount: 10,
  pageCount: 25
}
```

## Types

### NULL

`null` is a primitive type in JSON. When validating a JSON document against JSON Schema, a property's value can be null only when it is explicitly allowed by the schema, using the type keyword (e.g. `{"type": "null"}`).

- `null` values **SHOULD** be present in a response payload for an attribute value as a whole. 
```

// CORRECT
GET /articles/1
{
    "id": "1",
    "name": "my article name",
    "displayName": null             // display name is provided, even when null
}
 
// INCORRECT
GET /articles/1
{
    "id": "1",
    "name": "my article name"
                                    // display name was left out because it was null.
}
```

- An entire nested object **SHOULD** be represented as a single `null` instead of an object with all `null` attributes.
```
// CORRECT
GET /articles/1
{
    "id": "1",
    "name": "my article name",
    "relatedObject": null         // related object is not always present and should be treated as an object that is null when absent
}
 
// INCORRECT
{
    "id": "1",
    "name": "my article name",
    "relatedObject": {
        "attributeOne": null,
        "attributeTwo": null,
        "attributeThree": null
    }
}
```

- `null` **MUST** be specified in `PATCH` request to indicate that value should be removed from the specified field of the object.
```
PATCH /articles/1
{   
   author: "John Doe",  // sets value of 'John Doe' to the object of article
   description: null   // removes description from the object of article
}
```

### Boolean

- Primitive values **MUST** be serialized to JSON following the rules of [RFC 4627](https://datatracker.ietf.org/doc/html/rfc4627).
- Boolean values **MUST** be `true`/`false` values, not represented as a string.

```
// INCORRECT
{
  completed: "true",
  required: "0"
}
 
// CORRECT
{
  completed: true,
  required: false
}
```

### String

- string **SHOULD** always explicitly define a minLength and maxLength in the associated API schema.
- string **SHOULD** use the pattern property in the schema as appropriate.

```
{
    name: "John Doe"
}
```

### Number

- Numbers **SHOULD** be referenced in JSON as integer types and be represented in a 32-bit signed integer, values between ((2^31) - 1) and -(2^31) in the associated API schema.
    - When an integer type is used as a 32-bit integer it **SHOULD** provide an explicit minimum and a maximum in the associated API schema.
    - When requiring a 64-bit integer (a.k.a "long") it **SHOULD** be serialized as a string and specified as a formatted "int64" to ensure maximum compatibility across programming languages, particularly with JavaScript.
    - In the circumstance where serializing a number as a 64-bit integer is required, you MAY provide the 64-bit value as both a string and a number to ensure its accessibility.
```
{
    "largeValue": 10765432100123656789,
    "largeValueString": "10765432100123456799"
}
```

- Resource identifiers **SHOULD NOT** be serialized as numbers or integers (of any precision) as they should be considered opaque values to the API consumer.
- string **MUST** be used to represent a decimal numeric value to avoid possible JSON interpreter precision loss across different languages. Some languages may interpret a JSON "number" as a fixed point and others as a floating-point.
- percentage values **SHOULD** be represented as a string of fixed-point decimals. The property name MUST indicate that this is a percentage field.

```
// INCORRECT
{
    id: 234,                // IDs should be opaque string values.
    number: "10",           // 32-bit integers should be serialized as numbers.
    decimal: 10.2          // floating-point numbers should be serialized as strings to avoid precision loss.
    taxAddition: "8.75%",   // symbols should be left out of the string serialized percentage values.
    percentage: 8,          // floating-point numbers should be seiralized as stirngs to avoid precision loss.
}
 
// CORRECT
{
    id: "234",
    number: 10,
    decimal: "10.2",
    percentage: "9.75",
}
```

### Enums

Enum values **SHOULD** be composed of only upper-case alphanumeric characters and the underscore character, ( `_` ).
- `FIELD_10`
- `NOT_EQUAL`

```note
This modification is knowingly in conflict with general naming rules, as it applies specifically to enumerations.
```

If there is an industry standard that requires us to do otherwise, enums **MAY** contain other characters.

```
// INCORRECT, but acceptable when required by the industry standard
{
    type: "PurchaseOrder",  // enum of the type of the document
    id: "6be295c6-8977-4dce-bddc-8c943456725f",
    ...
}
 
// CORRECT
{
    type: "PURCHASE_ORDER",  // enum of the type of the document
    id: "6be295c6-8977-4dce-bddc-8c943456725f",
    ...
}
```

### Dates

[JSON](https://json.org) itself **does not** specify how dates should be represented, but most organizations use the date specification described in JavaScript.

- All dates posted in requests and returned in response **MUST** conform to [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) standard (format `YYYY-MM-DDTHH:mm:ss.sssZ`).
- All dates **MUST** include the correct time zone.
- All date fields SHOULD have the level of specificity and accuracy in their name:
    - `xxxDateTime` for fields with accuracy to time level
    - `xxxDate` for fields with accuracy to date level

```
// INCORRECT
{
    createdDate: "May 16 2021 14:12:07", // date format incorrect, name of the field indicates Date but value has DateTime
    createdDateTime: "May 16 2021", // specified value does not contain time portion
    created: "2021-05-16T14:12:07" // name of the field does not indicate that it is DateTime field
}
 
// CORRECT
{
    createdDateTime: "2021-05-16T14:12:07−05:00"
}
```

## Intervals and Durations

<sub>Reference: [Microsoft API Guidelines for Durations](https://github.com/Microsoft/api-guidelines/blob/master/Guidelines.md#114-durations)</sub>

### Durations

Durations **MUST** be serialized in conformance with [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Durations). In general durations format contains parts of data and time separated from each other `P<date>T<time>`. `P` indicates the beginning of the duration value, and `T` is a separation between date and time parts to avoid ambiguity. Durations are "represented by the format `P[n]Y[n]M[n]DT[n]H[n]M[n]S`" where after each numeric value followed by designator of that value: 

- `P` is the duration designator (historically called "period") placed at the start of the duration representation.
- `Y` is the year designator that follows the value for the number of years.
- `M` is the month designator that follows the value for the number of months.
- `W` is the week designator that follows the value for the number of weeks.
- `D` is the day designator that follows the value for the number of days.
- `T` is the time designator that precedes the time components of the representation.
- `H` is the hour designator that follows the value for the number of hours.
- `M` is the minute designator that follows the value for the number of minutes.
- `S` is the second designator that follows the value for the number of seconds.

For example, `P3Y6M4DT12H30M5S` represents a duration of "three years, six months, four days, twelve hours, thirty minutes, and five seconds."

```
// INCORRECT
{
    duration: "3Y6M4DT12H30M5S", // missing "P" - duration designator at the beginning of the duration string
    duration: "15 minutes", // string does not follow ISO standard
    duration: "PTH30MS" // designators should not exist without actual value, and vice versa, each value should have designator associated to it
}
 
// CORRECT
{
    duration: "P3Y6M4DT12H30M5S", // 3 years, 6 months, 4 days, 12 hours, 30 minutes, 5 seconds
    duration: "PT1H30M5S", // only time duration since there is no date value between P and T: 1 hour, 30 minutes, 5 seconds
    duration: "P3MT30M", // example where ambiguity between "month" and "minute" resolved by separating date and time parts. This period is 3 months and 30 minutes
    duration: "P3Y", // date only: 3 years
    duration: "PT30M" // time only: 30 minutes period
}
```

### Intervals

Intervals are defined as part of [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601#Time_intervals) and **MUST** follow one of the following formats: 

- Start and end dates: `<startDate>/<endDate>`
- Start and duration: `<startDate>/<duration>`
- Duration and end date: `<duration>/<endDate>`

```
{
    interval: "2007-03-01T13:00:00Z/2008-05-11T15:30:00Z", // <startDate>/<endDate> interval that starts at 1pm of March 1st, 2007 and ends at 3:30pm of May 11th 2008.
 
    interval: "2007-03-01T13:00:00Z/P1Y2M10DT2H30M", // <startDate>/<duration> interval that starts 1pm of March 1st, 2007
                                                     // and ends after specified period of 1 year, 2 months, 10 days, 2 hours and 30 minutes
 
    interval: "P1Y2M10DT2H30M/2008-05-11T15:30:00Z" // <duration>/<endDate> interval that defined by specifed period
                                                    // of 1 year, 2 months, 10 days, 2 hours and 30 minutes and ends 3:30pm of May 11th 2008
}
```

Repeating Intervals MUST follow `R[n]/<interval>` format where `R[n]` indicates amount of repetitions and interval value itself as specified earlier, separated by slash `/`:

```
{
    repeat: "R5/2007-03-01T13:00:00Z/2008-05-11T15:30:00Z", // repeat 5 times interval that starts at 1pm of March 1st, 2007 and ends at 3:30pm of May 11th 2008
}
```

### Schedules

When there is a need to represent a schedule-based string that represents a repetitive or one-time scheduled operation, that string **SHOULD** follow `cron` format, given that service that executes those schedules support `cron` as well.

```
schedule:    "30       4       1      1         *"
           (minute)  (hour)  (day)  (month) (weekday)
 
// EXAMPLE
{
    schedule: "30 4 1 1 *" // At 04:30 on day-of-month 1 in January.
}
```