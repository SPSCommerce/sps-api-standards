const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("semver", () => {
    let spectral = null;
    const ruleName = expect.getState().currentTestName;
    const ruleset = "src/specification.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("successful standard semver format", async () => {
        const spec = `
            openapi: 3.1.0
            info:
                title: ''
                version: '1.2.3'
            paths: {}
        `;
        await spectral.validateSuccess(spec, ruleName);
    });

    test("fails when not a number", async () => {
        const spec = `
            openapi: 3.1.0
            info:
                title: ''
                version: 'abc'
            paths: {}
        `;

        await spectral.validateFailure(spec, ruleName, "Warning");
    });

    test('fails when empty', async () => {
        const spec = `
            openapi: 3.1.0
            info:
                title: ''
                version: ''
            paths: {}
        `;
        
        await spectral.validateFailure(spec, ruleName, "Warning");
    });

    test('fails when there is a major and minor version but no patch', async () => {
        const spec = `
            openapi: 3.1.0
            info:
                title: ''
                version: '1.2'
            paths: {}
        `;
        
        await spectral.validateFailure(spec, ruleName, "Warning");
    });
});
