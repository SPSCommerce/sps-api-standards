const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-webhooks-internal", () => {
    let spectral = null;
    const ruleName = "sps-webhooks-internal";
    const ruleset = "src/webhooks.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("regular paths are not triggering this warning", async () => {
        const spec = `
            openapi: 3.1.0
            paths: 
                /v1/producer/events:
                    get:
                        summary: "hello-world"
        `;
    
        await spectral.validateSuccess(spec, ruleName);
    });

    test("webhook paths trigger no warning if no x-internal", async () => {
        const spec = `
            openapi: 3.1.0
            paths: 
                /v1/_webhooks/producer/events:
                    post:
                        x-internal: true
                        summary: "hello-world"
        `;
    
        await spectral.validateSuccess(spec, ruleName);
    });

    test("webhook paths trigger warning if no x-internal", async () => {
        const spec = `
            openapi: 3.1.0
            paths: 
                /v1/_webhooks/producer/events:
                    post:
                        summary: "hello-world"
        `;
    
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });

    test("webhook paths trigger warning if x-internal false", async () => {
        const spec = `
            openapi: 3.1.0
            paths: 
                /v1/_webhooks/producer/events:
                    post:
                        x-internal: false
                        summary: "hello-world"
        `;
    
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });
});
