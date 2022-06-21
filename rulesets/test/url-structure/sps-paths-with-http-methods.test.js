const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-paths-with-http-methods", () => {
    let spectral = null;
    const ruleName = "sps-paths-with-http-methods";
    const ruleset = "src/url-structure.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("succeeds with normal url", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/users:
                    get:
                        summary: hello
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("succeeds with verb in word", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/users/forget:
                    get:
                        summary: hello
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("fails with http methods in it", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/get-users:
                    get:
                        summary: hello
                /v1/post-users:
                    get:
                        summary: hello
                /v1/putUsers:
                    get:
                        summary: hello
                /v1/deleteUsers:
                    get:
                        summary: hello
                /v1/patch:
                    get:
                        summary: hello
        `;
       
        await spectral.validateFailure(spec, ruleName, "Error", 5);
    });
});
