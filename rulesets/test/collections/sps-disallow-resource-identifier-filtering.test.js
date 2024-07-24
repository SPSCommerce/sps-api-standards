    const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-disallow-resource-identifier-filtering", () => {
  let spectral = null;
  const ruleName = "sps-disallow-resource-identifier-filtering";
  const ruleset = "src/collections.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid - resource identifier is within the path of the endpoint", async () => {
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

  test("invalid - resource identifier is defined as a query parameter", async () => {
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
            - name: id
              in: query
              required: false
    `;

    await spectral.validateFailure(spec, ruleName, "Warning", 1);
  });
});
