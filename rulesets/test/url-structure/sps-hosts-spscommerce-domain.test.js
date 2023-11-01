const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-hosts-spscommerce-domain", () => {
    let spectral = null;
    const ruleName = "sps-hosts-spscommerce-domain";
    const ruleset = "src/url-structure.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("succeeds with api.sps-internal.com", async () => {
        const spec = `
            openapi: 3.1.0
            paths: {}
            servers:
                - url: https://api.sps-internal.com
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("succeeds with api.spscommerce.com", async () => {
        const spec = `
            openapi: 3.1.0
            paths: {}
            servers:
                - url: https://api.spscommerce.com
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("succeeds on other environment", async () => {
        const spec = `
            openapi: 3.1.0
            paths: {}
            servers:
                - url: https://integration.api.spscommerce.com
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("succeeds on localhost https", async () => {
        const spec = `
            openapi: 3.1.0
            paths: {}
            servers:
                - url: https://localhost:4000
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("succeeds on localhost http", async () => {
        const spec = `
            openapi: 3.1.0
            paths: {}
            servers:
                - url: http://localhost:5000
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });


    test("succeeds on network environment", async () => {
        const spec = `
            openapi: 3.1.0
            paths: {}
            servers:
                - url: https://network.api.spscommerce.com
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("succeeds on subdomain environment", async () => {
        const spec = `
            openapi: 3.1.0
            paths: {}
            servers:
                - url: https://integration.network.api.spscommerce.com
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("fails with other domain", async () => {
        const spec = `
            openapi: 3.1.0
            paths: {}
            servers:
                - url: https://www.google.com
        `;
       
        await spectral.validateFailure(spec, ruleName, "Warning", 1);
    });
});
