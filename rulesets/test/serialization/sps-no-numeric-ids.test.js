const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-no-numeric-ids", () => {
  let spectral = null;
  const ruleName = "sps-no-numeric-ids";
  const ruleset = "src/serialization.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("ids with uuid are good", async () => {
    const spec = `
        openapi: 3.1.0
        paths:
          "/v1/users/{id}":
            get:
              operationId: users-get-by-id
              parameters:
              - name: id
                in: path
                description: A unique identifier for the User.
                required: true
                style: simple
                explode: false
                schema:
                  type: uuid
                  description: A unique identifier for a user.
                  format: uuid
                  example: 12345678-1234-1234-1234-123456789012
              responses:
                '200':
                  description: User with the provided ID.
        `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("ids as strings are ok", async () => {
    const spec = `
        openapi: 3.1.0
        paths:
          "/v1/users/{id}":
            get:
              operationId: users-get-by-id
              parameters:
              - name: id
                in: path
                description: A unique identifier for the User.
                required: true
                style: simple
                explode: false
                schema:
                  type: string
                  description: A unique identifier for a user.
                  format: uuid
                  example: 12345678-1234-1234-1234-123456789012
              responses:
                '200':
                  description: User with the provided ID.
        `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("ids as integers are not good", async () => {
    const spec = `
        openapi: 3.1.0
        paths:
          "/v1/users/{id}":
            get:
              operationId: users-get-by-id
              parameters:
              - name: id
                in: path
                description: A unique identifier for the User.
                required: true
                style: simple
                explode: false
                schema:
                  type: integer
                  description: A unique identifier for a user.
                  format: uuid
                  example: 12345678-1234-1234-1234-123456789012
              responses:
                '200':
                  description: User with the provided ID.
        `;
    await spectral.validateFailure(spec, ruleName, "Warning");
  });

  test("special case with parameters/name causing jsonPath errors should not fail", async () => {
    const spec = `
        openapi: 3.1.0
        info:
          title: Example Linting Failure
          version: 2.3.4
        paths:
          "/my-path":
            get:
              operationId: my-op-id
              summary: fake-endpoint
              responses:
                '200':
                  description: my endpoint desc
                  content:
                    application/json:
                      schema:
                        type: object
                        properties:
                          parameters:
                            type: array
                            items:
                              type: object
                              properties:
                                name:
                                  type: string
        `;

    await spectral.validateSuccess(spec, ruleName);
  });
});
