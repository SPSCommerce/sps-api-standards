const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-limit-path-size", () => {
    let spectral = null;
    const ruleName = "sps-limit-path-size";
    const ruleset = "src/url-structure.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("path size is small", async () => {
        const spec = `
            openapi: 3.1.0
            paths: 
                /v1/users:
                    get:
                        summary: "hello-world"
        `;
    
        await spectral.validateSuccess(spec, ruleName);
    });

    test("path size is long but valid", async () => {
        const spec = `
            openapi: 3.1.0
            paths: 
                /v1/users/very/long/path/goes/here/more/than/x-characters/to-be/solong/more/than/x-characters/to-be:
                    get:
                        summary: "hello-world"
        `;

        await spectral.validateSuccess(spec, ruleName);
    });

    test("path size is too long", async () => {
        const spec = `
            openapi: 3.1.0
            paths: 
                /v1/users/very/long/path/goes/here/more/than/x-characters/to-be/solong/morex/v1/users/very/long/path/goes/here/more:
                    get:
                        summary: "hello-world"
        `;

        await spectral.validateFailure(spec, ruleName, "Warning", 1);
    });

});
