const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-hosts-lowercase", () => {
    let spectral = null;
    const ruleName = "sps-hosts-lowercase";
    const ruleset = "src/url-structure.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("succeeds with lowercase", async () => {
        const spec = `
            openapi: 3.1.0
            servers:
                - url: https://api.spscommerce.com
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("fails with uppercase", async () => {
        const spec = `
            openapi: 3.1.0
            servers:
                - url: https://API.spscommerce.com
                - url: https://API.SPSCOMMERCE.COM
                - url: https://API.SPScommerce.com
        `;
       
        await spectral.validateFailure(spec, ruleName, "Warning", 3);
    });
});
