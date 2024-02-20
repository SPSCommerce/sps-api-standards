const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-response-options-no-body", () => {
    let spectral = null;
    const ruleName = "sps-response-options-no-body";
    const ruleset = "src/request-response.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("valid OPTIONS response", async () => {
        const spec = `
        openapi: 3.1.0
        paths:
          /example:
            options:
              summary: Example OPTIONS endpoint
              responses:
                '204':
                  description: No Content
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

    test("invalid OPTIONS response with body", async () => {
      const spec = `
      openapi: 3.1.0
      paths:
        /example:
          options:
            summary: Example OPTIONS endpoint
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
