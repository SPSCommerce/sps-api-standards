const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("semver", () => {

    let spectral = null;
    beforeEach(async () => {
        spectral = new SpectralTestHarness("src/general.ruleset.yml");
    });

    test("successful standard semver format", async () => {
        const spec = `
            openapi: 3.1.0
            info:
                title: ''
                version: '1.2.3'
            paths: {}
        `;
    
        await spectral.validate(spec);
        expect(spectral.getResults("semver")).toHaveLength(0);
    });

    test("fails when not a number", async () => {
        const spec = `
            openapi: 3.1.0
            info:
                title: ''
                version: 'abc'
            paths: {}
        `;
        
        await spectral.validate(spec);
        const semVerResults = spectral.getResults("semver");
        expect(semVerResults).toHaveLength(1);
        expect(semVerResults[0].message).toEqual("Version should use semantic versioning. abc is not a valid version.");
        expect(spectral.getResultsWarnings()).toHaveLength(1);
        expect(spectral.getResultsErrors()).toHaveLength(0);
    });

    test('fails when empty', async () => {
        const spec = `
            openapi: 3.1.0
            info:
                title: ''
                version: ''
            paths: {}
        `;
        
        await spectral.validate(spec);
        expect(spectral.getResults("semver")).toHaveLength(1);
    });

    test('fails when there is a major and minor version but no patch', async () => {
        const spec = `
            openapi: 3.1.0
            info:
                title: ''
                version: '1.2'
            paths: {}
        `;
        
        await spectral.validate(spec);
        expect(spectral.getResults("semver")).toHaveLength(1);
    });
});
