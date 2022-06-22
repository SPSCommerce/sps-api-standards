const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-path-no-environment", () => {
    let spectral = null;
    const ruleName = "sps-path-no-environment";
    const ruleset = "src/url-structure.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("succeeds without the environment", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/users:
                    get:
                        summary: thing
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("succeeds without enivronment like names", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/users/production/value:
                    get:
                        summary: thing
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("fails with environment names", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/users/prod/resource:
                    get:
                        summary: thing
                /v1/users/preprod/resource:
                    get:
                        summary: thing
                /v1/users/dev/resource:
                    get:
                        summary: thing
                /v1/users/test/resource:
                    get:
                        summary: thing
                /v1/users/integration/resource:
                    get:
                        summary: thing
                /v1/users/stage/resource:
                        get:
                            summary: thing
        `;
       
        await spectral.validateFailure(spec, ruleName, "Error", 6);
    });
});
