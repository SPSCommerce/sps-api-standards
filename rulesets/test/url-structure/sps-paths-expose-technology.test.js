const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-paths-expose-technology", () => {
    let spectral = null;
    const ruleName = "sps-paths-expose-technology";
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

    test("fails with random port", async () => {
        const spec = `
        openapi: 3.1.0
        paths:
            /v1/users.php:
                get:
                    summary: hello
            /v1/users.cgi:
                get:
                    summary: hello
            /v1/users.jsp:
                get:
                    summary: hello
            /v1/users.aspx:
                get:
                    summary: hello
        `;
       
        await spectral.validateFailure(spec, ruleName, "Error", 4);
    });
});
