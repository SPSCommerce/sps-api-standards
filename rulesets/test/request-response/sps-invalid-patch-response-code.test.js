const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-invalid-patch-response-code", () => {
  let spectral = null;
  const ruleName = "sps-invalid-patch-response-code";
  const ruleset = "src/request-response.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid PATCH response code", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /example:
          patch:
            summary: Example PATCH endpoint
            responses:
              '202':
                description: Accepted
              '400':
                description: Bad Request
      `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("invalid PATCH response code 201", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /example:
          patch:
            summary: Example PATCH endpoint
            responses:
              '201':
                description: Created
              '400':
                description: Bad Request
    `;

    await spectral.validateFailure(spec, ruleName, "Warning", 1);
  });
});
