const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-response-delete-invalid-body", () => {
  let spectral = null;
  const ruleName = "sps-response-delete-invalid-body";
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
              '202':
                description: Accepted
              '204':
                description: No Content
              '404':
                description: Not Found
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

  test("invalid DELETE with response body", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /example:
          delete:
            summary: Example DELETE endpoint
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
              '204':
                description: No Content
              '404':
                description: Not Found
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
