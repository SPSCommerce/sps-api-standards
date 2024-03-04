const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-invalid-options-response-code", () => {
  let spectral = null;
  const ruleName = "sps-invalid-options-response-code";
  const ruleset = "src/request-response.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid OPTIONS response code", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /example:
          options:
            summary: Example OPTIONS endpoint
            responses:
              '200':
                description: OK
              '404':
                description: Not Found
      `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("invalid OPTIONS response code 201", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /example:
          options:
            summary: Example OPTIONS endpoint
            responses:
              '201':
                description: Created
              '404':
                description: Not Found
    `;

    await spectral.validateFailure(spec, ruleName, "Warning", 1);
  });

  test("invalid OPTIONS response code 202", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /example:
          options:
            summary: Example OPTIONS endpoint
            responses:
              '202':
                description: Accepted
              '404':
                description: Not Found
    `;

    await spectral.validateFailure(spec, ruleName, "Warning", 1);
  });
});
