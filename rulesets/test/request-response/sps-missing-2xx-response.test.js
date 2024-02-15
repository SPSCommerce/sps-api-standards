const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

xdescribe("sps-missing-2xx-response", () => {
    let spectral = null;
    const ruleName = "sps-missing-2xx-response";
    const ruleset = "src/request-response.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    xtest("valid response codes found", async () => {
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
                            "201":
                                description: Successful response
                                content:
                                    application/json:
                                    schema:
                                        type: object
                                        properties:
                                        message:
                                            type: string
                            "500":
                                description: Server error
                                content:
                                    application/json:
                                    schema:
                                        type: object
                                        properties:
                                        error:
                                            type: string
          `;
    
        await spectral.validateSuccess(spec, ruleName);
    });

    xtest("missing 2xx response", async () => {
        const spec = `
        openapi: 3.1.0
        paths:
          /example:
            get:
              summary: Example endpoint
              responses:
                "400":
                  description: Bad Request error
                  content:
                    application/json:
                      schema:
                        type: object
                        properties:
                          error:
                            type: string
                "500":
                  description: Server error
                  content:
                    application/json:
                      schema:
                        type: object
                        properties:
                          error:
                            type: string    
          `;
        //   await spectral.validateSuccess(spec, ruleName);

        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });
});
