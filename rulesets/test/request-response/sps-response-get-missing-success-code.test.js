const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-response-get-missing-success-code", () => {
  let spectral = null;
  const ruleName = "sps-response-get-missing-success-code";
  const ruleset = "src/request-response.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid GET response codes", async () => {
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

    await spectral.validateSuccess(spec, { ruleset, ruleName });
  });

  test("invalid GET response with missing 200", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /example:
          get:
            summary: Example GET endpoint
            responses:
              '500':
                description: Server Error
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        error:
                          type: string
              '404':
                description: Not found
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        error:
                          type: string
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });
});
