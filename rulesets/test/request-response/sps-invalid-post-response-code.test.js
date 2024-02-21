const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-invalid-post-response-code", () => {
  let spectral = null;
  const ruleName = "sps-invalid-post-response-code";
  const ruleset = "src/request-response.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid POST response code", async () => {
    const spec = `
        openapi: 3.1.0
        paths:
          /example:
            post:
              summary: Example POST endpoint
              responses:
                '201':
                  description: Created
                '400':
                  description: Bad Request
    `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("invalid POST response code 204", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /example:
          post:
            summary: Example POST endpoint
            responses:
              '204':
                description: No Content
    `;

    await spectral.validateFailure(spec, ruleName, "Warning", 1);
  });

  test("invalid POST response code 412", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /example:
          post:
            summary: Example POST endpoint
            responses:
              '412':
                description: Precondition Failed
    `;

    await spectral.validateFailure(spec, ruleName, "Warning", 1);
  });
});
