const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-request-delete-invalid-body", () => {
  let spectral = null;
  const ruleName = "sps-request-delete-invalid-body";
  const ruleset = "src/request-response.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid DELETE", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /example:
          delete:
            summary: Example DELETE endpoint
            responses:
              '204':
                description: No Content
      `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("invalid DELETE", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /example:
          delete:
            summary: Example DELETE endpoint
            requestBody:
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      id:
                        type: string
            responses:
              '204':
                description: No Content
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });
});
