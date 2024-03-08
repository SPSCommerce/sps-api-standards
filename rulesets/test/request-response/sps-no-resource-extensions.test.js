const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-no-resource-extensions", () => {
  let spectral = null;
  const ruleName = "sps-no-resource-extensions";
  const ruleset = "src/request-response.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid content type", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /items:
          get:
            responses:
              '200':
                description: Successful response
                content:
                  application/json:
                    schema:
                      $ref: '#/components/schemas/Item'
    `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("invalid path with extension .json", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /items.json:
          get:
            responses:
              '200':
                description: Successful response
                content:
                  application/json:
                    schema:
                      $ref: '#/components/schemas/Item'
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });

  test("invalid path with extension .xml", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /items.xml:
          get:
            responses:
              '200':
                description: Successful response
                content:
                  application/xml:
                    schema:
                      $ref: '#/components/schemas/Item'
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });
});
