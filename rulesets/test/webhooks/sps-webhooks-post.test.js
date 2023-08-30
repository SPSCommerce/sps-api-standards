const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-webhooks-post", () => {
    let spectral = null;
    const ruleName = "sps-webhooks-post";
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

    test("webhook as a get request should be called out", async () => {
        const spec = `
            openapi: 3.1.0
            paths: 
                /v1/_webhooks/producer/events:
                    get:
                        summary: "hello-world"
        `;
    
        await spectral.validateFailure(spec, ruleName, "Warning", 1);
    });

    test("webhook as a put request should be called out", async () => {
        const spec = `
            openapi: 3.1.0
            paths: 
                /v1/_webhooks/producer/events:
                    put:
                        summary: "hello-world"
        `;
    
        await spectral.validateFailure(spec, ruleName, "Warning", 1);
    });

    test("webhook as a patch request should be called out", async () => {
        const spec = `
            openapi: 3.1.0
            paths: 
                /v1/_webhooks/producer/events:
                    patch:
                        summary: "hello-world"
        `;
    
        await spectral.validateFailure(spec, ruleName, "Warning", 1);
    });

    test("webhook as a delete request should be called out", async () => {
        const spec = `
            openapi: 3.1.0
            paths: 
                /v1/_webhooks/producer/events:
                    delete:
                        summary: "hello-world"
        `;
    
        await spectral.validateFailure(spec, ruleName, "Warning", 1);
    });

    test("webhook as a post rquest is fine", async () => {
        const spec = `
            openapi: 3.1.0
            paths: 
                /v1/_webhooks/producer/events:
                    post:
                        summary: "hello-world"
        `;
    
        await spectral.validateSuccess(spec, ruleName);
    });
});
