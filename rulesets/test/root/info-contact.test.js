const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("info-contact", () => {
    let spectral = null;
    const ruleName = "info-contact";
    const ruleset = "src/root.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("info-contact-is-disabled", async () => {
        const spec = `
            openapi: 3.1.0
            info:
                title: My API
                description: my-thing
                version: 1.0.0
            servers:
                - description: server1
                  url: http://localhost:8080
            paths: {}
        `;
    
        await spectral.validateSuccess(spec, ruleName);
    });
});
