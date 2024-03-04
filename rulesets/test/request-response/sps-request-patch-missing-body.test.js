const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-request-patch-missing-body", () => {
  let spectral = null;
  const ruleName = "sps-request-patch-missing-body";
  const ruleset = "src/request-response.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid PATCH request", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /example:
          patch:
            summary: Example PATCH endpoint
            requestBody:
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      id:
                        type: string
            responses:
              '202':
                description: Accepted
    `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("invalid PATCH request with missing request body", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /example:
          patch:
            summary: Example PATCH endpoint
            responses:
              '202':
                description: Accepted
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });
});
