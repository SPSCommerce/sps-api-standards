const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-missing-pagination-query-parameters", () => {
  let spectral = null;
  const ruleName = "sps-missing-pagination-query-parameters";
  const ruleset = "src/collections.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid - GET endpoint has the proper pagination query parameters", async () => {
      const spec = `
        openapi: 3.1.0
        paths:
          /v1/users:
            get:
              summary: Get User by ID
              parameters:
              - name: offset
                in: query
              - name: limit
                in: query
              - name: cursor
                in: query
      `;
      await spectral.validateSuccess(spec, ruleName);
  });
    
  test("valid - GET endpoint has the proper pagination and other query parameters", async () => {
      const spec = `
        openapi: 3.1.0
        paths:
          /v1/users:
            get:
              summary: Get User by ID
              parameters:
              - name: offset
                in: query
              - name: limit
                in: query
              - name: cursor
                in: query
              - name: officeLocation
                in: query
      `;
      await spectral.validateSuccess(spec, ruleName);
  });

  test("invalid GET endpoint has 2 out of the 3 required pagination query parameters", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /v1/users:
          get:
            summary: Get User by ID
            parameters:
            - name: offset
              in: query
              type: integer
            - name: limit
              in: query
              type: integer
    `;
    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });

  test("invalid - GET endpoint has 2 out of the 3 required pagination query parameters", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /v1/users:
          get:
            summary: Get User by ID
            parameters:
            - name: offset
              in: query
              type: integer
            - name: limit
              in: query
              type: integer
    `;
    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });

  test("invalid - pagination query parameters on GET endpoint", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /v1/users:
          get:
            summary: Get User by ID
            parameters:
            - name: max
              in: query
    `;
    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });
    
  test("invalid - missing pagination query parameters on GET endpoint", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /v1/users:
          get:
            summary: Get User by ID
    `;
    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });

  test("valid - rule does not flag query parameters on GET endpoints that searches on a certain id", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /v1/users/{userId}:
          get:
            summary: Get User by ID
            parameters:
            - name: userId
              in: path
              required: true
            - name: limit
              in: query
    `;
    await spectral.validateSuccess(spec, ruleName);
  });
});
