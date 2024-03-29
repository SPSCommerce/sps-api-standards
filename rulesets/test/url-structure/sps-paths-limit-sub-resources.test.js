const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-paths-limit-sub-resources", () => {
    let spectral = null;
    const ruleName = "sps-paths-limit-sub-resources";
    const ruleset = "src/url-structure.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("succeeds with 3 hierarchy levels", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/users/{userId}/profiles/{profileId}/images/{imageId}:
                    get:
                        summary: hello
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("succeeds with a lot of resources", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/this/resource/should/not/fail/queue/purge:
                    get:
                        summary: hello
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    
    test("fails after too many sub resources", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/this/resource/should/not/fail/queue/purge/failed:
                    get:
                        summary: hello
        `;
       
        await spectral.validateFailure(spec, ruleName, "Warning", 1);
    });
});
