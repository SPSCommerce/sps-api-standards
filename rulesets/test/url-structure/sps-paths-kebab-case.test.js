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

    test("succeeds with special _webhooks case", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/_webhooks/fancy:
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

    // There was an issue with the previous version of the rule where it would
    // crash if the none-kebab case was near the end of a long path
    test("fails with snake case near the end of the path", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/fancy-resource/this-is/a-really-long-path/with-a-fancy_resource/:
                    get:
                        summary: hello
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("succeeds with kebab case, but camel case path param", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/fancy-resource/{resourceId}:
                    get:
                        summary: hello
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("succeeds with kebab case, but snake case path param", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/fancy-resource/{resource_id}:
                    get:
                        summary: hello
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("succeeds with kebab case, but pascal case path param", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/fancy-resource/{ResourceId}:
                    get:
                        summary: hello
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });
});
