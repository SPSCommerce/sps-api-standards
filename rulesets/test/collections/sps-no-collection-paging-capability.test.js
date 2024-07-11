const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-no-collection-paging-capability", () => {
  let spectral = null;
  const ruleName = "sps-no-collection-paging-capability";
  const ruleset = "src/collections.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid - paging within response body", async () => {
    const spec = `
    openapi: 3.0.0
    info:
      title: Sample API
      version: 1.0.0
    paths:
      /users/{id}:
        get:
          summary: Get a list of users
          responses:
            '200':
              description: A list of users
              content:
                application/json:
                  schema:
                    properties:
                      lastName: 
                        type: string
                      firstName:
                        type: string
                      age: 
                        type: integer
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
                        properties:
                          cursor: 
                            type: string
                          offset: 
                            type: integer
                          limit: 
                            type: integer
    `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("invalid - response body - missing paging object", async () => {
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
                        collection: 
                          type: object
                          properties:
                            cursor: 
                              type: string
                            offset: 
                              type: integer
                            limit: 
                              type: integer
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });

  test("invalid - response body - paging element must be an object", async () => {
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
                        type: string
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });
});
