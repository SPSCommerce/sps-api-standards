const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-query-params-not-required", () => {
    let spectral = null;
    const ruleName = "sps-query-params-not-required";
    const ruleset = "src/url-structure.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("succeeds with not required parameter", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/users:
                    get:
                        summary: hello
                        parameters:
                        - name: filterThing
                          in: query
                          required: false
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("succeeds with no defined required", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/users:
                    get:
                        summary: hello
                        parameters:
                        - name: filterThing
                          in: query
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("fails when required", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/users:
                    get:
                        summary: hello
                        parameters:
                        - name: filterThing
                          in: query
                          required: true
        `;
       
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });
});
