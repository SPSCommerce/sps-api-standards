const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-ref-in-url", () => {
    let spectral = null;
    const ruleName = "sps-ref-in-url";
    const ruleset = "src/naming.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("no errors for regular query parameters", async () => {
        const spec = `
        openapi: 3.1.0
        paths:
            /v1/users/{id}:
                get:
                    summary: hello
                    parameters:
                    - name: filterThing
                      in: query
                    - name: id
                      in: path
        `;
    
        await spectral.validateSuccess(spec, ruleName);
    });

    test("warnings for ref in query parameter", async () => {
        const spec = `
        openapi: 3.1.0
        paths:
            /v1/users/{id}:
                get:
                    summary: hello
                    parameters:
                    - name: ref
                      in: query
                    - name: id
                      in: path
        `;
        await spectral.validateFailure(spec, ruleName, "Warning");
    });

    test("warnings for ref in path parameter", async () => {
        const spec = `
        openapi: 3.1.0
        paths:
            /v1/users/{ref}:
                get:
                    summary: hello
                    parameters:
                    - name: other
                      in: query
                    - name: ref
                      in: path
        `;
        await spectral.validateFailure(spec, ruleName, "Warning");
    });
});
