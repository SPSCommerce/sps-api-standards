const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-paths-limit-path-parameters", () => {
    let spectral = null;
    const ruleName = "sps-paths-limit-path-parameters";
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

    test("succeeds with hierarchy and no parameters", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /domain/v1/examples/queue/purge:
                    get:
                        summary: hello
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("example succeeds", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v2/types/{id}/rules/instances/evaluate
                    get:
                        summary: hello
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("fails after 3 hierarchy levels", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/users/{userId}/profiles/{profileId}/images/{imageId}/another-level/{anotherId}:
                    get:
                        summary: hello
        `;
       
        await spectral.validateFailure(spec, ruleName, "Warning", 1);
    });

    test("succeeds with only 3 dynamic params", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/users/{userId}/{profileId}/{imageId}/resources:
                    get:
                        summary: hello
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("fails with more than 3 dynamic parameters", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/users/{userId}/{profileId}/{imageId}/{anotherId}/resources:
                    get:
                        summary: hello
        `;
       
        await spectral.validateFailure(spec, ruleName, "Warning", 1);
    });
});
