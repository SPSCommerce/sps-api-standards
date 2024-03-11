const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-default-content-language", () => {
  let spectral = null;
  const ruleName = "sps-default-content-language";
  const ruleset = "src/request-response.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid content language", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /items:
          get:
            responses:
              '200':
                description: Successful response
                headers:
                  Content-Language:
                    schema:
                      type: string
                      default: "en-US"
    `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("doesn't specify content language", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /items:
          get:
            responses:
              '200':
                description: Successful response
    `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("unsupported content language default", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /items:
          get:
            responses:
              '200':
                description: Successful response
                headers:
                  Content-Language:
                    schema:
                      type: string
                      default: "fr-FR"
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });
});
