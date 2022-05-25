# REST API Standards

This documentation represents the REST API standards to be used by all teams at SPS Commerce creating RESTful style internal or external APIs of any size or form. These guidelines supersede any and all existing or alternative sources of standards for REST APIs at SPS Commerce.

The intent with this information is to clearly and effectively define how HTTP REST style APIs should be contractually designed with a high degree of consistency across distributed systems. This information focuses directly on REST APIs as a primary driver for interoperability between services within the organization and between organizations. While other styles of API implementation are important within an architecture the overwhelming majority of communication internally and externally, as indicated in the 2020 SmartBear API Report, is focused on REST style APIs at this time. 

## Outline

1. [URL Structure](standards/url-structure.md) - URLs, Resources, Hierarchies and Query Parameters.
1. [Request & Response](standards/request-response.md) - Verbs/Methods, Headers and Status Codes.
1. [Naming](standards/naming.md) - General, Text, Property Names and Standard Properties.
1. [Serialization](standards/serialization.md) - Casing, Types, Quantities, Intervals and Durations.
1. [Collections](standards/collections.md) - Results Body, Pagination, Searching, Filtering and Sorting.
1. [Authentication](standards/authentication.md) - Auth Headers and Standard Responses.
1. [Errors](standards/errors.md) - Standard Error Schema and Common Responses.

## Definition

The majority of this definition directs and acts as a REST API style guide, with a focus on designing uniform interfaces and contracts. While it addresses certain expected behaviors where necessary, it is not intended as a comprehensive overview or guidance of all the tenants of REST-style APIs. You are still expected to understand the core tenants, including client-server, statelessness, cache-ability, layered systems, etc. The following reading may help you understand the philosophy behind the REST Architectural Style. If you are new to RESTful design, here are some good resources:

- [REST on Wikipedia](https://en.wikipedia.org/wiki/Representational_state_transfer) - Overview of common definitions and core ideas behind REST.
- [REST Dissertation](https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm) - The chapter on REST in Roy Fielding's dissertation on Network Architecture, "Architectural Styles and the Design of Network-based Software Architectures".
- [RFC 7231: HTTP Semantics and Content](https://datatracker.ietf.org/doc/html/rfc7231) - Defines the specification for HTTP/1.1 semantics, and is considered the authoritative resource.

Additionally, these standards intend to be agnostic of API implementation as much as possible. At times, it is necessary to take into account the cost of implementation when it is significant compared to possible alternatives that offer incremental value at a much lower cost. These scenarios are addressed by providing a flexible and/or incremental approach to the API contract as needed.

**Note**: The term REST is used throughout this document to mean services that are in the spirit of REST rather than adhering to REST by "the book." At times, pure RESTful approaches may be less desirable in comparison to enhanced developer experience. Such situations are examined on a case-by-case basis.

<sub>References Guidelines Sourced From: [Microsoft REST API Guidelines](https://github.com/Microsoft/api-guidelines/blob/master/Guidelines.md).</sub>

## Design Principles

The following guidance is provided to help drive the decision making process on additions and modifications to the standards:

- **Consistency**: Understanding how to interact with one resource informs how to interact with any resource. Don't surprise your users.
- **Discoverability**: API responses guide users without the need for external documentation.
- **Simplicity**: Complex user workflows are constructed from smaller, easier-to-understand parts (East of Use).
- **Opinionatedness**: There is one clear way to do something.
- **Tolerance**: Contracts and consumers are as forgiving as possible without compromising security.
- **Automation**: Standards and statements should be structured and considered in such a way as to lean towards defendable standards through automation where it does not compromise another design principle.
- **Experience**: Developer experience is more of a focus than architecture. DX trumps other principles as a tie-breaker.

<sub>References Principles Sourced From: [Cloud Foundry API Style Guide](https://github.com/cloudfoundry/cc-api-v3-style-guide#guiding-principles).</sub>

## API Standards Creation

- "MUST", "MUST NOT", "SHOULD" and "SHOULD NOT" are used in the context as [defined in RFC2119](https://www.ietf.org/rfc/rfc2119.txt).
- Provide links to other parts of the standards where associations need to be made but at all costs reduce duplication as it is detrimental to maintenance and accuracy.
- Clearly call out any assumptions inline.
- Ambiguity is clarified through examples.
- Examples of what not to do are just as important as what to do.
- All examples should use standardized consistency and syntax for schema definitions.
- No differences between internal or external APIs should be called out, as all APIs should be crafted in preparation for externalization.
- Compose and reuse other API Guidelines, standards and schemas where possible including the use of existing industry standard RFCs.

## OpenAPI Linting with Spectral

The API design standards documented here are intended to be paired with and used in conjunction with the [Spectral CLI](https://meta.stoplight.io/docs/spectral/ZG9jOjI1MTg1-spectral-cli) to lint and validate compliance of these standards given an OpenAPI `3.x` specification.

Individual spectral rulesets are available in this repository representing each of the core API standards documentation pages in the outline. These rulesets are merged together and made available via [GitHub Release](https://github.com/SPSCommerce/sps-api-standards/releases) as `sps-api-standards.spectral.yml` and also available publicly on the SPS Commerce CDN by immutable version or `latest`:

- **Specific Versioned Ruleset**: [https://cdn.prod.spsc.io/api/design/standards/rulesets/v1.0.8/sps-api-standards.spectral.yml](https://cdn.prod.spsc.io/api/design/standards/rulesets/v1.0.8/sps-api-standards.spectral.yml) (modify `v1.0.8` to represent an associate versioned tag or GitHub Release).
- **Latest Ruleset**: [https://cdn.prod.spsc.io/api/design/standards/rulesets/custom/latest/sps-api-standards.spectral.yml](https://cdn.prod.spsc.io/api/design/standards/rulesets/custom/latest/sps-api-standards.spectral.yml)

Getting started with Spectral linting (where `openapi.yml` is your local OpenAPI spec file):

```
npm install -g @stoplight/spectral-cli
spectral lint openapi.yml --ruleset https://cdn.prod.spsc.io/api/design/standards/rulesets/custom/latest/sps-api-standards.spectral.yml
```

You can also customize the SPS ruleset by extending it with your own local configuration `.spectral.yml`:

```yaml
extends:
  # extend the SPS API Standards and others in composition if desired
  - https://cdn.prod.spsc.io/api/design/standards/rulesets/custom/latest/sps-api-standards.spectral.yml

rules:
  # disable or downgrade SPS errors to warnings if you desire.
  paths-kebab-case: warn    
```

```
spectral lint openapi.yml --ruleset .spectral.yml
```

Additionally, use IDE extensions like [Spectral Linter for VS Code](https://marketplace.visualstudio.com/items?itemName=stoplight.spectral) for local editing of Open API specifications and automated linting using spectral. Use the `latest` URL to specify the `Spectral Ruleset File` setting to always use the latest SPS API Standards validation in your IDE.

## API Standards Versioning

The API standards are versioned similarly to the [Semantic Versioning](https://semver.org/) specification where possible to help indicate the types of ongoing changes and modifications that will be introduced over time. While having a set of standards that is a moving target is not ideal, in reality we expect to continually evolve and make backwards compatible changes over time. There are many aspects of API design and contracts still missing from the existing guidelines that will need to be added to the initial draft. Using semantic versioning format means you can identify that changes are large or contract-breaking with a large version bump. Every intention and effort will be made to avoid major version bumps of these standards that may contain any contract breaking modifications. Simple modifications to examples or clarifications added would materialize as a patch version bump. This also enables future work to provide supporting material on the standards, such as automated linting rules. 

More practically, the usage of semantic versioning as it applies to breaking changes within the API Standards is inferred from how the impact of a standards update can affect an API implementation and its own API version. For example, if a "MUST" statement changes the API standards and results in a breaking change to an API implementation making a breaking contract change to their API, then that is considered contract breaking for the standards as well and that change would force a major version bump. However, if the standards indicate an "OPTIONAL" or "SHOULD" update that would indeed break a contract, the standards themselves are likely to NOT increment the major version. This balance is not as clear-cut as standard semantic versioning for a product and will require some maturity over time. The end intent is to land in a position where we limit the need for breaking changes to the API Standards but can introduce net new topics and small changes and this can be trusted by the development community referencing the standards. In some cases, provisions would be made to defer certain changes to a future planned major version or to make them optional in order to maintain a major version. This type of decision must be made on a case-by-case basis. Additive and non-breaking updates to the standards would be encouraged to happen as those updates are ready.

Examples:
- Updating of a "MUST" line item to a standard request header that was previously a "SHOULD" results in a major version bump.
- Addition of a "SHOULD" line item for an entirely new header results in a minor version bump.
- Text updates for clarification or wording modification within the same scope results in a patch version bump.
- As modifications, updates, and brand new additions to the standards are developed, it will be done in GitHub, with full transparency. Certain versions may warrant pre-release indicators with semantic versioning to help with the adoption and curation of feedback for those updates.

Semantic versioning, GitHub Releases and automated release notes are provisioned using the [Semantic Release CLI tool](https://github.com/semantic-release/semantic-release#commit-message-format). Commits and Pull Requests should be pushed by indicating a `fix`, `feat` or `BREAKING CHANGE` in the commit messages appropriately.

[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

## References

The creation of these API standards was not driven from scratch or unique by any means. It is a composition of SPS Commerce internal experience alongside heavily borrowed text and concepts from other API Guideline documentation that are immensely valuable in and of themselves:

- [Microsoft REST API Guidelines](https://github.com/Microsoft/api-guidelines/blob/master/Guidelines.md) 
- [Google Cloud API Design Guide](https://cloud.google.com/apis/design/) 
- [PayPal API Design Guidelines](https://github.com/paypal/api-standards)
- [Cloud Foundry API Style Guide](https://github.com/cloudfoundry/cc-api-v3-style-guide)
- [Cisco REST API Design Guide](https://github.com/CiscoDevNet/api-design-guide)
- [Atlassian REST Guidelines](https://developer.atlassian.com/server/framework/atlassian-sdk/atlassian-rest-api-design-guidelines-version-1/)