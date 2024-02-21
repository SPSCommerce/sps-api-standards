const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-invalid-put-response-code", () => {
  let spectral = null;
  const ruleName = "sps-invalid-put-response-code";
  const ruleset = "src/request-response.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid PUT response code", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /example:
          put:
            summary: Example PUT endpoint
            responses:
              '204':
                description: No Content
              '400':
                description: Bad Request
      `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("invalid PUT response code 200", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /example:
          put:
            summary: Example PUT endpoint
            responses:
              '200':
                description: OK
              '204':
                description: No Content
    `;

    await spectral.validateFailure(spec, ruleName, "Warning", 1);
  });

  test("invalid PUT response code 201", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /example:
          put:
            summary: Example PUT endpoint
            responses:
              '201':
                description: OK
              '204':
                description: No Content
    `;

    await spectral.validateFailure(spec, ruleName, "Warning", 1);
  });
});
