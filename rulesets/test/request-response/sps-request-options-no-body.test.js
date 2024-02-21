const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-request-options-no-body", () => {
  let spectral = null;
  const ruleName = "sps-request-options-no-body";
  const ruleset = "src/request-response.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid OPTIONS request", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /example:
          options:
            summary: Example OPTIONS endpoint
            responses:
              '200':
                description: OK
      `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("invalid OPTIONS request with request body", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /example:
          options:
            summary: Example OPTIONS endpoint
            requestBody:
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      id:
                        type: string
            responses:
              '200':
                description: OK
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });
});
