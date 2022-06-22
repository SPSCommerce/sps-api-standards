const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-paths-trailing-slash", () => {
    let spectral = null;
    const ruleName = "sps-paths-trailing-slash";
    const ruleset = "src/url-structure.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("succeeds with no trailing slash", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/users:
                    get:
                        summary: hello
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });


    test("fails with trailing slash", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/users/:
                    get:
                        summary: hello
        `;
       
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });
});
