    const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-multiple-filter-parameters", () => {
  let spectral = null;
  const ruleName = "sps-multiple-filter-parameters";
  const ruleset = "src/collections.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid - endpoint has correct use-case of filter, only one filter parameter", async () => {
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
            - name: filter
              in: query
              required: false
            - name: active
              in: query
              required: false
          responses:
              '200':
                description: A list of users
    `;

    await spectral.validateSuccess(spec, ruleName);
  });
  
  test("valid - endpoint has no filter query parameter", async () => {
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
              - name: active
                in: query
                required: false
              - name: foo
                in: query
                required: false
          responses:
              '200':
                description: A list of users
    `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("valid - endpoint has hybird filtering", async () => {
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
              - name: active
                in: query
                required: false
              - name: userFilter
                in: query
                required: false
          responses:
            '200':
              description: A list of users
    `;

    await spectral.validateSuccess(spec, ruleName);
  });
  
  test("invalid - endpoint has hybird filtering but there is also a root filter", async () => {
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
              - name: filter
                in: query
                required: false
              - name: active
                in: query
                required: false
              - name: userFilter
                in: query
                required: false
          responses:
            '200':
              description: A list of users
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });
  
  test("valid - endpoint has 2 hybird filters", async () => {
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
              - name: activeFilter
                in: query
                required: false
              - name: userFilter
                in: query
                required: false
          responses:
            '200':
              description: A list of users
    `;

    await spectral.validateSuccess(spec, ruleName);
  });
});
