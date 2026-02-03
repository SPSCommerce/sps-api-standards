const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-sorting-parameters-only-get-requests", () => {
  let spectral = null;
  const ruleName = "sps-sorting-parameters-only-get-requests";
  const ruleset = "src/collections.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid - no errors should happen when sorting query parameter only on GET endpoints", async () => {
    const spec = `
      openapi: 3.1.0
      info:
        title: Sample API
        version: 1.0.0
      paths:
        /users:
          get:
            summary: Get a list of users
            parameters:
            - name: sortBy
              in: query
              required: false
            - name: limit
              in: query
              required: false
            - name: offset
              in: query
              required: false
            - name: cursor
              in: query
              required: false
            - name: filter
              in: query
              required: false
          responses:
              '200':
                description: A list of users
        /employees:
          get:
            summary: Get a list of users
            parameters:
            - name: orderBy
              in: query
              required: false
            responses:
              '200':
                description: A list of users
    `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("invalid - non-GET endpoints should not have sorting parameters as query parameters", async () => {
    const spec = `
      openapi: 3.1.0
      info:
        title: Sample API
        version: 1.0.0
      paths:
        /users/{id}:
          patch:
            summary: Get a list of users
            parameters:
            - name: id
              in: path
              required: true
            - name: sorting
              in: query
              required: false
            responses:
              '200':
                description: A list of users
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });
});
