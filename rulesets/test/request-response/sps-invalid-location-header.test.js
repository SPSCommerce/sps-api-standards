const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-invalid-location-header", () => {
  let spectral = null;
  const ruleName = "sps-invalid-location-header";
  const ruleset = "src/request-response.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid location header", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /items:
          post:
            responses:
              '201':
                description: Item created
                headers:
                  Location:
                    description: Location of the created item
                    schema:
                      type: string
    `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("invalid location header in 200 response", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /items/{itemId}:
          get:
            responses:
              '200':
                description: Successful response
                headers:
                  Location:
                    description: Location of the item
                    schema:
                      type: string
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });

  test("valid 201 response without a location header", async () => {
    const spec = `
        openapi: 3.1.0
        paths:
          /items:
            post:
              responses:
                '201':
                  description: Item created
      `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("valid 200 without a location header", async () => {
    const spec = `
        openapi: 3.1.0
        paths:
          /items/{itemId}:
            get:
              responses:
                '200':
                  description: Successful response
      `;

    await spectral.validateSuccess(spec, ruleName);
  });
});
