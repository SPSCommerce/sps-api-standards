# Authentication

## Overview

[Auth0](https://auth0.com/) is the primary method of Authentication to all APIs at SPS Commerce. Tokens should be obtained from Auth0 using one of the standard OAuth2.0 flows. The specific flow chosen should be determined by the application type you are developing.

- All APIs **MUST** be authenticated regardless of their scope or accessibility.
- OAuth2.0 tokens **MUST** be used from Auth0 for all authentication requests.

## Authentication

Once a service receives a token, it must be validated before the data it contains can be used to service the request. Typically these tokens will be [JWTs](https://jwt.io/introduction) and can be cryptographically verified by either [OPA](https://www.openpolicyagent.org/) policy or SPS Commerce's internal Identity Service. Other tokens, such as API keys, are simply opaque secret values and must be validated via storage. API keys can also be verified by Identity Service or OPA policy. As a reminder, all auth tokens are considered a secret and must be handled according to security best practices around usage and logging.

- APIs **SHOULD** expect that the access token is sent as a bearer token using the `Authorization` header on every request.
```
Authorization: Bearer <token value>
```

- APIs **SHOULD NOT** receive or accept a token via URL in the path or query string, as putting tokens in any of these locations increases the risk of token exposure in logs, referrer headers, etc.
    - In situations where URLs with embedded credentials cannot be avoided, such as for one-click downloads or other integration, the token in the URL MUST be considered temporary with a short expiration period.

## Errors

Common status codes that should be used based on results of authentication of a token:

- **Unauthenticated**: APIs **MUST** return a `401` when a request is made that does not include an access token or if the access token is invalid/expired. The format **MUST** follow the error format specified in [Errors for a 401](errors.md).
- **Forbidden / Access Denied**: APIs **MUST** return a `403` when a request contains a valid access token but authorization to the resource itself fails. The format **MUST** follow the error format specified in [Errors for a 403](errors.md).