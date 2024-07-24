    const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe.skip("sps-unreasonable-query-parameters-limit", () => {
  let spectral = null;
  const ruleName = "sps-unreasonable-query-parameters-limit";
  const ruleset = "src/collections.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid - endpoint has 1 path parameter and zero query parameters", async () => {
    const spec = `
      openapi: 3.0.0
      info:
        title: Sample API
        version: 1.0.0
      paths:
        /users/{id}:
          get:
            summary: Get a specific user
            parameters:
              - name: id
                in: path
                required: true
          responses:
            '200':
              description: A single user
    `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("invalid - endpoint has 13 query parameters and 1 path parameter", async () => {
    const spec = `
      openapi: 3.0.0
      info:
        title: Sample API
        version: 1.0.0
      paths:
        /users/{id}:
          get:
            summary: Get a list of users
            parameters:
            - name: id
              in: path
            - name: query_param_1
              in: query
            - name: query_param_2
              in: query
            - name: query_param_3
              in: query
            - name: query_param_4
              in: query
            - name: query_param_5
              in: query
            - name: query_param_6
              in: query
            - name: query_param_7
              in: query
            - name: query_param_8
              in: query
            - name: query_param_9
              in: query
            - name: query_param_10
              in: query
            - name: query_param_11
              in: query
            - name: query_param_12
              in: query
            - name: query_param_13
              in: query
    `;

    await spectral.validateFailure(spec, ruleName, "Warning");
  });

  test("valid - endpoint has 12 query parameters", async () => {
    const spec = `
      openapi: 3.0.0
      info:
        title: Sample API
        version: 1.0.0
      paths:
        /users:
          get:
            summary: Get a list of users
            parameters:
            - name: query_param_1
              in: query
            - name: query_param_2
              in: query
            - name: query_param_3
              in: query
            - name: query_param_4
              in: query
            - name: query_param_5
              in: query
            - name: query_param_6
              in: query
            - name: query_param_7
              in: query
            - name: query_param_8
              in: query
            - name: query_param_9
              in: query
            - name: query_param_10
              in: query
            - name: query_param_11
              in: query
            - name: query_param_12
              in: query
    `;

    await spectral.validateSuccess(spec, ruleName);
  });
  
  test("invalid - endpoint has 13 query parameters", async () => {
    const spec = `
      openapi: 3.0.0
      info:
        title: Sample API
        version: 1.0.0
      paths:
        /users:
          get:
            summary: Get a list of users
            parameters:
            - name: query_param_1
              in: query
            - name: query_param_2
              in: query
            - name: query_param_3
              in: query
            - name: query_param_4
              in: query
            - name: query_param_5
              in: query
            - name: query_param_6
              in: query
            - name: query_param_7
              in: query
            - name: query_param_8
              in: query
            - name: query_param_9
              in: query
            - name: query_param_10
              in: query
            - name: query_param_11
              in: query
            - name: query_param_12
              in: query
            - name: query_param_13
              in: query
    `;

    await spectral.validateSuccess(spec, ruleName);
  });
  
  // I understand this probably breaks some other rule within our standards but its testing the json schema
  test("valid - endpoint has 13 path parameters and 1 query parameter", async () => {
    const spec = `
      openapi: 3.0.0
      info:
        title: Sample API
        version: 1.0.0
      paths:
        /users/{path_param_1}/{path_param_2}/{path_param_3}/{path_param_4}/{path_param_5}/{path_param_6}/{path_param_7}/{path_param_8}/{path_param_9}/{path_param_10}/{path_param_11}/{path_param_12}/{path_param_13}:
          get:
            summary: Get a list of users
            parameters:
            - name: query_param_1
              in: query
            - name: path_param_1
              in: path
              required: true
            - name: path_param_2
              in: path
              required: true
            - name: path_param_3
              in: path
              required: true
            - name: path_param_4
              in: path
              required: true
            - name: path_param_5
              in: path
              required: true
            - name: path_param_6
              in: path
              required: true
            - name: path_param_7
              in: path
              required: true
            - name: path_param_8
              in: path
              required: true
            - name: path_param_9
              in: path
              required: true
            - name: path_param_10
              in: path
              required: true
            - name: path_param_11
              in: path
              required: true
            - name: path_param_12
              in: path
              required: true
            - name: path_param_13
              in: path
              required: true
    `;

    await spectral.validateSuccess(spec, ruleName);
  });
  
  test("valid - endpoint has no parameters array in spec", async () => {
    const spec = `
      openapi: 3.0.0
      info:
        title: Sample API
        version: 1.0.0
      paths:
        /up:
          get:
            summary: Get a 200 status code back
          responses:
            '200':
              description: returns 200 status code
    `;

    await spectral.validateSuccess(spec, ruleName);
  });
});
