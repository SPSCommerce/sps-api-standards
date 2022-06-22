const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-query-params-no-api-keys", () => {
    let spectral = null;
    const ruleName = "sps-query-params-no-api-keys";
    const ruleset = "src/url-structure.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("succeeds with regular parameter", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/users:
                    get:
                        summary: hello
                        parameters:
                        - name: filter
                          in: query
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("fails with api key", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/users:
                    get:
                        summary: hello
                        parameters:
                        - name: apiKeyFilter
                          in: query
        `;
       
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });

    test("fails with token", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/users:
                    get:
                        summary: hello
                        parameters:
                        - name: token
                          in: query
        `;
       
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });
});
