const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-no-http-basic", () => {
    let spectral = null;
    const ruleName = "sps-no-http-basic";
    const ruleset = "src/authentication.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("most authentication types are good", async () => {
        const spec = `
            openapi: 3.1.0
            paths: {}
            components:
                securitySchemes:
                    BearerAuth:
                        type: http
                        scheme: bearer
                    ApiKeyAuth:
                        type: apiKey
                        in: header
                        name: X-API-Key
        `;
    
        await spectral.validateSuccess(spec, ruleName);
    });

    test("basic auth is bad", async () => {
        const spec = `
        openapi: 3.1.0
        paths: {}
        components:
            securitySchemes:
                BasicAuth:
                    type: http
                    scheme: basic
    `;
    
        await spectral.validateFailure(spec, ruleName, "Error");
    });
});
