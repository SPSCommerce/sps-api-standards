const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-post-request-body-missing-paging-object", () => {
  let spectral = null;
  const ruleName = "sps-post-request-body-missing-paging-object";
  const ruleset = "src/collections.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid - POST endpoint with paging object within request body", async () => {
      const spec = `
        openapi: 3.1.0
        paths:
          /v1/users:
            post:
              summary: Get User by ID
              requestBody:
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        paging:
                          type: object
                          properties:
                            limit: 
                              type: integer
                            offset: 
                              type: integer
                            cursor: 
                              type: string
                        user:
                          type: object
                          properties:
                            firstName: 
                              type: string
                            lastName: 
                              type: string
      `;
      await spectral.validateSuccess(spec, ruleName);
  });
  
  test("valid - POST endpoint does not have paging object with request body", async () => {
      const spec = `
        openapi: 3.1.0
        paths:
          /v1/users:
            post:
              summary: Get User by ID
              requestBody:
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        firstName: 
                          type: string
                        lastName: 
                          type: string
      `;
      await spectral.validateSuccess(spec, ruleName);
  });

  test("invalid - POST endpoint has incorrect paging type - string", async () => {
      const spec = `
          openapi: 3.1.0
          paths:
            /v1/users:
              post:
                summary: Get User by ID
                requestBody:
                  content:
                    application/json:
                      schema:
                        type: object
                        properties:
                          paging:
                            type: string
      `;
      await spectral.validateFailure(spec, ruleName, "Error", 1);
  });
});
