const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-query-params-characters", () => {
    let spectral = null;
    const ruleName = "sps-query-params-characters";
    const ruleset = "src/url-structure.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("succeeds with query parameter", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/users:
                    get:
                        summary: hello
                        parameters:
                        - name: filter
                          in: query
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("fails query parameter with special chars", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/users:
                    get:
                        summary: hello
                        parameters:
                        - name: filter
                          in: query
                        - name: filter+2
                          in: query
                        - name: filter&3
                          in: query
                        - name: filter(4
                          in: query
                        - name: filter#5
                          in: query
        `;
       
        await spectral.validateFailure(spec, ruleName, "Error", 4);
    });
});
