const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-authorization-missing", () => {
  let spectral = null;
  const ruleName = "sps-authorization-missing";
  const ruleset = "src/request-response.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid content type", async () => {
    const spec = `
      openapi: 3.1.0
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
      security:
        - ApiKeyAuth: []
    `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("missing security token", async () => {
    const spec = `
      openapi: 3.1.0
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
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });
});
