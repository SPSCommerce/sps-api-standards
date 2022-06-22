const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-query-params-not-in-path", () => {
    let spectral = null;
    const ruleName = "sps-query-params-not-in-path";
    const ruleset = "src/url-structure.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("succeeds with nothing in path", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/api/users/:
                    get:
                        summary: hello
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("fails with querystring in path", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/api/users?test={hi}:
                    get:
                        summary: hello
        `;
       
        await spectral.validateFailure(spec, ruleName, "Warning", 1);
    });
});
