const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("schema-names-pascal-case", () => {
    let spectral = null;
    const ruleName = expect.getState().currentTestName;
    const ruleset = "src/specification.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("pascal case is good", async () => {
        const spec = `
            openapi: 3.1.0
            paths: {}
            components:
                schemas:
                    FooBar:
                        type: string
        `;
    
        await spectral.validateSuccess(spec, ruleName);
    });

    test("camel case is not ok", async () => {
        const spec = `
            openapi: 3.1.0
            paths: {}
            components:
                schemas:
                    fooBar:
                        type: string
        `;
    
        await spectral.validateFailure(spec, ruleName, "Warning");
    });

    test("snake case is not ok", async () => {
        const spec = `
            openapi: 3.1.0
            paths: {}
            components:
                schemas:
                    foo_bar:
                        type: string
        `;
        await spectral.validateFailure(spec, ruleName, "Warning");
    });

    test("hyphen case is not ok", async () => {
        const spec = `
            openapi: 3.1.0
            paths: {}
            components:
                schemas:
                    foo-bar:
                        type: string
        `;
    
        await spectral.validateFailure(spec, ruleName, "Warning");
    });
});
