const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-invalid-status-code", () => {
    let spectral = null;
    const ruleName = "sps-invalid-status-code";
    const ruleset = "src/request-response.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("valid response code", async () => {
        const spec = `
          openapi: 3.1.0
          paths:
              /example:
                  get:
                      summary: Example endpoint
                      responses:
                          "200":
                              description: Successful response
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

    test("invalid response code", async () => {
      const spec = `
        openapi: 3.1.0
        paths:
            /example:
                get:
                    summary: Example endpoint
                    responses:
                        "100":
                            description: Weird response
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
