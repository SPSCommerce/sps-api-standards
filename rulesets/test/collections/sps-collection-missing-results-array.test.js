const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-collection-missing-results-array", () => {
  let spectral = null;
  const ruleName = "sps-collection-missing-results-array";
  const ruleset = "src/collections.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid - collection response with results array of objects", async () => {
    const spec = `
      openapi: 3.0.0
      info:
        title: Sample API
        version: 1.0.0
      paths:
        /users:
          get:
            summary: Get a list of users
            responses:
              '200':
                description: A list of users
                content:
                  application/json:
                    schema:
                      properties:
                        results: 
                          type: array
                          items:
                            type: object
                        paging: 
                          type: object
    `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("invalid - collection response - results is not an array", async () => {
    const spec = `
      openapi: 3.0.0
      info:
        title: Sample API
        version: 1.0.0
      paths:
        /users:
          get:
            summary: Get a list of users
            responses:
              '200':
                description: A list of users
                content:
                  application/json:
                    schema:
                      properties:
                        results: 
                          type: object
                        paging: 
                          type: object
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });

  test("invalid - collection response - results is not an array of objects", async () => {
    const spec = `
      openapi: 3.0.0
      info:
        title: Sample API
        version: 1.0.0
      paths:
        /users:
          get:
            summary: Get a list of users
            responses:
              '200':
                description: A list of users
                content:
                  application/json:
                    schema:
                      properties:
                        results: 
                          type: array
                          items:
                            type: string
                        paging:
                          type: object
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });
});
