const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-response-head-no-body", () => {
    let spectral = null;
    const ruleName = "sps-response-head-no-body";
    const ruleset = "src/request-response.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("valid HEAD response", async () => {
        const spec = `
        openapi: 3.1.0
        paths:
          /example:
            head:
              summary: Example HEAD endpoint
              responses:
                '200':
                  description: OK
                '404':
                  description: Not Found
                  content:
                    application/json:
                      schema:
                        type: object
                        properties:
                          message:
                            type: string
          `;
    
          await spectral.validateSuccess(spec, ruleName);
    });

    test("invalid HEAD response with body", async () => {
      const spec = `
      openapi: 3.1.0
      paths:
        /example:
          head:
            summary: Example HEAD endpoint
            responses:
              '200':
                description: OK
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        message:
                          type: string
              '404':
                description: Not Found
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        message:
                          type: string
        `;
  
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });
});
