const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-paths-with-api", () => {
    let spectral = null;
    const ruleName = "sps-paths-with-api";
    const ruleset = "src/url-structure.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("succeeds regular URL", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/users:
                    get:
                        summary: hello
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });


    test("fails with api prefix", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/apiusers/:
                    get:
                        summary: hello
        `;
       
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });

    test("fails with api resource", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/api/users/:
                    get:
                        summary: hello
        `;
       
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });

    test("fails with api suffix", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/users-api/:
                    get:
                        summary: hello
        `;
       
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });
});
