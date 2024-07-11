    const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-unreasonable-query-parameters-limit", () => {
  let spectral = null;
  const ruleName = "sps-unreasonable-query-parameters-limit";
  const ruleset = "src/collections.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid - endpoint has less than 12 query parameters", async () => {
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
                required: true
          responses:
            '200':
              description: A list of users
    `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("invalid - endpoint has more than 12 query parameters", async () => {
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
});
