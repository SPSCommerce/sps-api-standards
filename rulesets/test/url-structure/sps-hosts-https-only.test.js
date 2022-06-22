const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-hosts-https-only", () => {
    let spectral = null;
    const ruleName = "sps-hosts-https-only";
    const ruleset = "src/url-structure.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("https is good", async () => {
        const spec = `
            openapi: 3.1.0
            paths: {}
            servers:
                - description: test-env
                  url: https://api.test.com
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("http is no good", async () => {
        const spec = `
            openapi: 3.1.0
            paths: {}
            servers:
                - description: test-env
                  url: https://api.test.com
                - description: prod-env
                  url: http://api.prod.com
        `;
    
        await spectral.validateFailure(spec, ruleName, "Error");
    });

});
