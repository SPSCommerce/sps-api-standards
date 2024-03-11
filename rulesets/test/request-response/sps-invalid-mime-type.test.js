const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-invalid-mime-type", () => {
  let spectral = null;
  const ruleName = "sps-invalid-mime-type";
  const ruleset = "src/request-response.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid MIME type", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /items:
          get:
            responses:
              '200':
                description: Successful response
                content:
                  application/vnd.sps-model+json:
                    schema:
                      $ref: '#/components/schemas/Item'
    `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("another valid MIME Type", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /items:
          get:
            responses:
              '200':
                description: Successful response
                content:
                  application/vnd.sps-model.v1+json:
                    schema:
                      $ref: '#/components/schemas/Item'
    `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("invalid MIME Type 1", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /items:
          get:
            responses:
              '200':
                description: Successful response
                content:
                  application/whatever:
                    schema:
                      $ref: '#/components/schemas/Item'
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });

  test("invalid MIME Type 2", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /items:
          get:
            responses:
              '200':
                description: Successful response
                content:
                  sps/vnd.whatever+json:
                    schema:
                      $ref: '#/components/schemas/Item'
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });

  test("invalid MIME Type 3", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /items:
          get:
            responses:
              '200':
                description: Successful response
                content:
                  application/vnd.whatever:
                    schema:
                      $ref: '#/components/schemas/Item'
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });
});
