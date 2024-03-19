const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-invalid-custom-header-format", () => {
  let spectral = null;
  const ruleName = "sps-invalid-custom-header-format";
  const ruleset = "src/request-response.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid custom header", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /users:
          get:
            responses:
              '200':
                description: A list of users
                headers:
                  Sps-Custom-Header-12345:
                    schema:
                      type: string
                      default: custom value
    `;

    await spectral.validateSuccess(spec, ruleName);
  });


  test("incorrect casing", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /users:
          get:
            responses:
              '200':
                description: A list of users
                headers:
                  SPS-Custom-Header-12345:
                    schema:
                      type: string
                      default: custom value
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });

  test("header name too long", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /users:
          get:
            responses:
              '200':
                description: A list of users
                headers:
                  Sps-Custom-Header-123456789012345678901234567890123456789012345678901:
                    schema:
                      type: string
                      default: custom value
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });

  test("custom headers can't start with X-", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /users:
          get:
            responses:
              '200':
                description: A list of users
                headers:
                  X-Custom-Header-12345:
                    schema:
                      type: string
                      default: custom value
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });
});
