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

    test("http is ok for localhost", async () => {
        const spec = `
            openapi: 3.1.0
            paths: {}
            servers:
                - description: test-env
                  url: http://localhost:4000
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("https is good for localhost", async () => {
        const spec = `
            openapi: 3.1.0
            paths: {}
            servers:
                - description: test-env
                  url: https://localhost:4000
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

    test("http is no good for loopback", async () => {
        const spec = `
            openapi: 3.1.0
            paths: {}
            servers:
                - description: test-env
                  url: http://127.0.0.1:4000
        `;
    
        await spectral.validateFailure(spec, ruleName, "Error");
    });

});
