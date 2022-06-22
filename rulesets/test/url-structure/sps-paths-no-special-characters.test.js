const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-paths-no-special-characters", () => {
    let spectral = null;
    const ruleName = "sps-paths-no-special-characters";
    const ruleset = "src/url-structure.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("succeeds with standard characters", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/fancy-resource:
                    get:
                        summary: hello
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("succeeds with interpolation", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/resource/{id}:
                    get:
                        summary: hello
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("fails special characters", async () => {
        const spec = `
        openapi: 3.1.0
        paths:
            /v1/fancy_resource:
                get:
                    summary: hello
            /v1/fancy&resource:
                get:
                    summary: hello
            /v1/fancy+resource:
                get:
                    summary: hello
            /v1/fancy[resource:
                get:
                    summary: hello
            /v1/fancy%resource:
                get:
                    summary: hello
        `;
       
        await spectral.validateFailure(spec, ruleName, "Error", 5);
    });
});
