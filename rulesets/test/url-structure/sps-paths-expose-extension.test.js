const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-paths-expose-extension", () => {
    let spectral = null;
    const ruleName = "sps-paths-expose-extension";
    const ruleset = "src/url-structure.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("succeeds with normal path", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/users:
                    get:
                        summary: hello
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("fails with period", async () => {
        const spec = `
        openapi: 3.1.0
        paths:
            /v1/users.thing:
                get:
                    summary: hello
        `;
       
        await spectral.validateFailure(spec, ruleName, "Warning", 1);
    });
});
