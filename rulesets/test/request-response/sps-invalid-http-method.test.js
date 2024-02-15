const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-invalid-http-method", () => {
    let spectral = null;
    const ruleName = "sps-invalid-http-method";
    const ruleset = "src/request-response.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("valid http methods", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /example:
                    get:
                        summary: Example GET endpoint
                    post:
                        summary: Example POST endpoint
          `;
    
          await spectral.validateSuccess(spec, ruleName);
    });

    test("invalid http method", async () => {
      const spec = `
        openapi: 3.1.0
        paths:
            /example:
                get:
                    summary: Example GET endpoint
                INVALIDMETHOD:
                    summary: Example endpoint with invalid HTTP method
        `;
  
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });
});
