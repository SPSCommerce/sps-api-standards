const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-webhooks-path", () => {
    let spectral = null;
    const ruleName = "sps-webhooks-path";
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

    test("proper _webhooks path should not trigger this", async () => {
        const spec = `
            openapi: 3.1.0
            paths: 
                /v1/_webhooks/events:
                    get:
                        summary: "hello-world"
        `;
    
        await spectral.validateSuccess(spec, ruleName);
    });

    test("no underscore should trigger this", async () => {
        const spec = `
            openapi: 3.1.0
            paths: 
                /v1/webhooks/producer/events:
                    get:
                        summary: "hello-world"
        `;
    
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });

    test("singular no underscore should trigger this", async () => {
        const spec = `
            openapi: 3.1.0
            paths: 
                /v1/webhook/producer/events:
                    get:
                        summary: "hello-world"
        `;
    
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });

    test("singular should trigger this", async () => {
        const spec = `
            openapi: 3.1.0
            paths: 
                /v1/_webhook/producer/events:
                    get:
                        summary: "hello-world"
        `;
    
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });

    test("random location in path should trigger this", async () => {
        const spec = `
            openapi: 3.1.0
            paths: 
                /v1/producer-webhook/events:
                    get:
                        summary: "hello-world"
        `;
    
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });
});
