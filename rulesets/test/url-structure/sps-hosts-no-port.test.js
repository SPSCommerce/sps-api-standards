const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-hosts-no-port", () => {
    let spectral = null;
    const ruleName = "sps-hosts-no-port";
    const ruleset = "src/url-structure.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("succeeds without port number", async () => {
        const spec = `
            openapi: 3.1.0
            servers:
                - url: https://api.spscommerce.com
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("succeeds with port number on localhost http", async () => {
        const spec = `
            openapi: 3.1.0
            servers:
                - url: http://localhost:3000
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("succeeds with port number on localhost https", async () => {
        const spec = `
            openapi: 3.1.0
            servers:
                - url: https://localhost:3000
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("fails with standard port", async () => {
        const spec = `
            openapi: 3.1.0
            servers:
                - url: https://api.spscommerce.com:443
        `;
       
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });

    test("fails with local address port", async () => {
        const spec = `
            openapi: 3.1.0
            servers:
                - url: https://127.0.0.1:5000
        `;
       
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });

    test("fails with random port", async () => {
        const spec = `
            openapi: 3.1.0
            servers:
                - url: https://api.spscommerce.com:8940
        `;
       
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });
});
