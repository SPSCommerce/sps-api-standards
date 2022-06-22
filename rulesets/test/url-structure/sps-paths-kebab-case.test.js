const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-paths-kebab-case", () => {
    let spectral = null;
    const ruleName = "sps-paths-kebab-case";
    const ruleset = "src/url-structure.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("succeeds with kebab case", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/fancy-resource:
                    get:
                        summary: hello
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("fails with camel case", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/fancyResource:
                    get:
                        summary: hello
        `;
       
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });

    test("fails with pascal case", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/FancyResource:
                    get:
                        summary: hello
        `;
       
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });

    test("fails with snake case", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/fancy_resource:
                    get:
                        summary: hello
        `;
       
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });
});
