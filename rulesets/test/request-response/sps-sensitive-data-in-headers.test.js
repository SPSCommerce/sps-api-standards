const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-sensitive-data-in-headers", () => {
  let spectral = null;
  const ruleName = "sps-sensitive-data-in-headers";
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
                  SPS-Custom-Header-12345:
                    schema:
                      type: string
                      default: custom value
    `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("sensitive data in header", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /users:
          get:
            responses:
              '200':
                description: A list of users
                headers:
                  SPS-Token:
                    schema:
                      type: string
                      default: custom value
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });

  test("more sensitive data in header", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /users:
          get:
            responses:
              '200':
                description: A list of users
                headers:
                  SPS-Token:
                    schema:
                      type: string
                      default: custom value
                  Password:
                    schema:
                      type: string
                      default: custom value
    `;
    await spectral.validateFailure(spec, ruleName, "Error", 2);
  });
});
