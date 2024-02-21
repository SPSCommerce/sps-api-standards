const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-request-get-no-body", () => {
  let spectral = null;
  const ruleName = "sps-request-get-no-body";
  const ruleset = "src/request-response.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid GET request", async () => {
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
          post:
            summary: Example POST endpoint
            requestBody:
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      message:
                        type: string
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

  test("invalid GET request with request body", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /example:
          get:
            summary: Example GET endpoint
            requestBody:
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      message:
                        type: string
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

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });
});
