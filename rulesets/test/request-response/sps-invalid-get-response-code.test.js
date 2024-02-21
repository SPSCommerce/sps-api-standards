const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-invalid-get-response-code", () => {
  let spectral = null;
  const ruleName = "sps-invalid-get-response-code";
  const ruleset = "src/request-response.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid GET response code", async () => {
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

  test("invalid GET response code", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /example:
          get:
            summary: Example GET endpoint
            responses:
              '202':
                description: Accepted
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        message:
                          type: string
    `;

    await spectral.validateFailure(spec, ruleName, "Warning", 1);
  });
});
