const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-missing-pagination-query-parameters", () => {
  let spectral = null;
  const ruleName = "sps-missing-pagination-query-parameters";
  const ruleset = "src/collections.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });
  
  test("valid - query parameter is not at the end of the path", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /v1/items/{itemId}/views:
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

  test("invalid - GET endpoint is missing pagination query parameters", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /v1/users:
          get:
            summary: Get User by ID
            parameters:
            - name: officeLocation
              in: query
    `;
    await spectral.validateFailure(spec, ruleName, "Warning", 2);
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

  describe("offset based pagination", () => {
    test("valid - GET endpoint has offset based pagination query parameters", async () => {
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
        `;
        await spectral.validateSuccess(spec, ruleName);
    });

    test("valid - GET endpoint has offset based pagination and other query parameters", async () => {
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
              - name: officeLocation
                in: query
      `;
      await spectral.validateSuccess(spec, ruleName);
    });

    test("invalid - GET endpoint has offset pagination parameters but not limit", async () => {
      const spec = `
        openapi: 3.1.0
        paths:
          /v1/users:
            get:
              summary: Get User by ID
              parameters:
              - name: offset
                in: query
      `;
      await spectral.validateFailure(spec, ruleName, "Warning", 1);
    });
  });

  describe("cursor based pagination", () => {
    test("valid - GET endpoint has cursor based pagination query parameters", async () => {
        const spec = `
          openapi: 3.1.0
          paths:
            /v1/users:
              get:
                summary: Get User by ID
                parameters:
                - name: cursor
                  in: query
                - name: limit
                  in: query
        `;
        await spectral.validateSuccess(spec, ruleName);
    });

    test("valid - GET endpoint has cursor pagination and other query parameters", async () => {
      const spec = `
        openapi: 3.1.0
        paths:
          /v1/users:
            get:
              summary: Get User by ID
              parameters:
              - name: cursor
                in: query
              - name: limit
                in: query
              - name: officeLocation
                in: query
      `;
      await spectral.validateSuccess(spec, ruleName);
    });
    
    test("invalid - GET endpoint has cursor pagination parameters but not limit", async () => {
      const spec = `
        openapi: 3.1.0
        paths:
          /v1/users:
            get:
              summary: Get User by ID
              parameters:
              - name: cursor
                in: query
      `;
      await spectral.validateFailure(spec, ruleName, "Warning", 1);
    });
  });

});
