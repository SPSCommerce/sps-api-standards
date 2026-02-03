const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-authorization-missing", () => {
  let spectral = null;
  const ruleName = "sps-authorization-missing";
  const ruleset = "src/request-response.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid custom header", async () => {
    const spec = `
      openapi: 3.1.0
      security:
        - token: []
      paths:
        /users:
          get:
            responses:
              '200':
                description: A list of users
                headers:
                  X-Custom-Header:
                    schema:
                      type: string
                      default: custom value
    `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("invalid header type in response 1", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /users:
          get:
            responses:
              '200':
                description: A list of users
                headers:
                  Content-Type:
                    schema:
                      type: string
                      default: application/json
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });

  test("invalid header type in response 2", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /users:
          get:
            responses:
              '200':
                description: A list of users
                headers:
                  Access-Control-Allow-Origin:
                    schema:
                      type: string
                      default: '*'
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });

  test("invalid header type in response 3", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /users:
          get:
            responses:
              '200':
                description: A list of users
                headers:
                  Accept:
                    schema:
                      type: string
                      default: application/json
    `;

    await spectral.validateFailure(spec, ruleName, "Error", 1);
  });
});
