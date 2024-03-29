const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-invalid-response-body", () => {
  let spectral = null;
  const ruleName = "sps-invalid-response-body";
  const ruleset = "src/request-response.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid response body", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /example:
          get:
            summary: Example GET endpoint
            responses:
              '200':
                description: Successful response
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        message:
                          type: string
      `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("valid response body with rsx format", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /example:
          get:
            summary: Example GET endpoint
            responses:
              '200':
                description: Successful response
                content:
                  application/vnd.sps-rsx.v7.7+xml:
                    schema:
                      type: string
                      format: binary
      `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("valid response body with array property", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /example:
          get:
            summary: Example GET endpoint
            responses:
              '200':
                description: Successful response
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        messages:
                          type: array
                          items:
                            type: string
    `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("invalid response body array", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /example:
          get:
            summary: Example GET endpoint
            responses:
              '200':
                description: Successful response
                content:
                  application/json:
                    schema:
                      type: array
                      items:
                        type: string
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });

  test("invalid response body type string", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /example:
          get:
            summary: Example GET endpoint
            responses:
              '200':
                description: Successful operation
                content:
                  application/json:
                    schema:
                      type: string
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });

  test("invalid response body type number", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /example:
          get:
            summary: Example GET endpoint
            responses:
              '200':
                description: Successful operation
                content:
                  application/json:
                    schema:
                      type: nubmber
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });
});
