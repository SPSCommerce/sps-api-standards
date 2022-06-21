const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-paths-empty-segments", () => {
    let spectral = null;
    const ruleName = "sps-paths-empty-segments";
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

    test("fails empty segment", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1//users:
                    get:
                        summary: hello
        `;
       
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });
});
