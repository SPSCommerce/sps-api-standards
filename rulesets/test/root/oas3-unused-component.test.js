const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("oas3-unused-component", () => {
    let spectral = null;
    const ruleName = expect.getState().currentTestName;
    const ruleset = "src/root.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("unused-components-is-disabled", async () => {
        const spec = `
            openapi: 3.1.0
            info:
                title: My API
                description: my-thing
                version: 1.0.0
                contact:
                    name: John Doe
                    url: https://test.com
                    email: me@test.com
            servers:
                - description: server1
                  url: http://localhost:8080
            paths: {}
            components:
                schemas:
                    FooBar:
                        type: string
        `;
    
        await spectral.validateSuccess(spec, ruleName);
    });
});
