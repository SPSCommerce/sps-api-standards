const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("unknown-error-format", () => {
    let spectral = null;
    const ruleName = expect.getState().currentTestName;
    const ruleset = "src/errors.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("400 valid application/problem+json ok", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/path:
                    get:
                        operationId: get-path
                        summary: get-path
                        responses:
                            '400':
                                description: error
                                content:
                                    application/problem+json:
                                        schema:
                                            type: object
                                            properties:
                                                title:
                                                    type: string
        `;
    
        await spectral.validateSuccess(spec, ruleName);
    });

    test("500 valid application/problem+json ok", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/path:
                    get:
                        operationId: get-path
                        summary: get-path
                        responses:
                            '500':
                                description: error
                                content:
                                    application/problem+json:
                                        schema:
                                            type: object
                                            properties:
                                                title:
                                                    type: string
        `;
    
        await spectral.validateSuccess(spec, ruleName);
    });

    test("valid application/problem+xml ok", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/path:
                    get:
                        operationId: get-path
                        summary: get-path
                        responses:
                            '400':
                                description: error
                                content:
                                    application/problem+xml:
                                        schema:
                                            type: object
                                            properties:
                                                title:
                                                    type: string
        `;
    
        await spectral.validateSuccess(spec, ruleName);
    });

    test("4xx/5xx with application/json is bad", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/path:
                    get:
                        operationId: get-path
                        summary: get-path
                        responses:
                            '400':
                                description: error
                                content:
                                    application/json:
                                        schema:
                                            type: object
                                            properties:
                                                title:
                                                    type: string
        `;
    
        await spectral.validateFailure(spec, ruleName, "Error");
    });

    

});
