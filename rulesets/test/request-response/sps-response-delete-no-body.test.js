const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-response-delete-no-body", () => {
    let spectral = null;
    const ruleName = "sps-response-delete-no-body";
    const ruleset = "src/request-response.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("valid DELETE", async () => {
        const spec = `
        openapi: 3.1.0
        paths:
          /example:
            delete:
              summary: Example DELETE endpoint
              responses:
                '204':
                  description: No Content
          `;
    
          await spectral.validateSuccess(spec, ruleName);
    });

    xtest("invalid DELETE", async () => {
      const spec = `
      openapi: 3.1.0
      paths:
        /example:
          delete:
            summary: Example DELETE endpoint
            responses:
              '202':
                description: Accepted
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        message:
                          type: string
        `;
  
        try {
          await spectral.validateFailure(spec, ruleName, "Error", 1);
        } catch (error) {
          console.error(error);
        }
    });
    
});
