const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("response-names-pascal-case", () => {
    let spectral = null;
    const ruleName = expect.getState().currentTestName;
    const ruleset = "src/general.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("pascal case is good", async () => {
        const spec = `
            openapi: 3.1.0
            paths: {}
            components:
                responses:
                    fooBar:
                        description: "Description"
        `;
    
        await spectral.validateSuccess(spec, ruleName);
    });

    test("camel case is not ok", async () => {
        const spec = `
            openapi: 3.1.0
            paths: {}
            components:
                responses:
                    fooBar:
                        description: "Description"
        `;
    
        await spectral.validateFailure(spec, ruleName, "Warning");
    });

    test("snake case is not ok", async () => {
        const spec = `
            openapi: 3.1.0
            paths: {}
            components:
                responses:
                    foo_bar:
                        description: "Description"
        `;
        await spectral.validateFailure(spec, ruleName, "Warning");
    });

    test("hyphen case is not ok", async () => {
        const spec = `
            openapi: 3.1.0
            paths: {}
            components:
                responses:
                    foo-bar:
                        description: "Description"
        `;
    
        await spectral.validateFailure(spec, ruleName, "Warning");
    });
});
