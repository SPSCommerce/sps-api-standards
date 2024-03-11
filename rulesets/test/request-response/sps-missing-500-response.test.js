const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-missing-500-response", () => {
  let spectral = null;
  const ruleName = "sps-missing-500-response";
  const ruleset = "src/request-response.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid endpoints with 500 reponses", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /items:
          get:
            responses:
              '200':
                description: Successful response
              '500':
                description: Internal Server Error
        /users:
          post:
            responses:
              '201':
                description: User created
              '500':
                description: Internal Server Error
        /orders:
          put:
            responses:
              '204':
                description: Order updated
              '500':
                description: Internal Server Error
    `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("endpoint with missing 500", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /items:
          get:
            responses:
              '200':
                description: Successful response
              '500':
                description: Internal Server Error
        /users:
          post:
            responses:
              '201':
                description: User created
        /orders:
          put:
            responses:
              '204':
                description: Order updated
              '500':
                description: Internal Server Error
    `;

    await spectral.validateFailure(spec, ruleName, "Warning", 1);
  });
});
