const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-filtering-only-get-requests", () => {
  let spectral = null;
  const ruleName = "sps-filtering-only-get-requests";
  const ruleset = "src/collections.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid - GET endpoint has a filter query parameter", async () => {
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
            - name: filter
              in: query
              required: false
            responses:
              '200':
                description: A list of users
    `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("invalid - non-GET endpoints has filter query parameter", async () => {
    const spec = `
      openapi: 3.1.0
      info:
        title: Sample API
        version: 1.0.0
      paths:
        /users:
          post:
            summary: Create a user
            parameters:
            - name: filter
              in: query
              required: false
            responses:
              '200':
                description: Create a user
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });
});
