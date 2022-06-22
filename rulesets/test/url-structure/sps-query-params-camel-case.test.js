const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-query-params-camel-case", () => {
    let spectral = null;
    const ruleName = "sps-query-params-camel-case";
    const ruleset = "src/url-structure.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("succeeds with query parameter camelCase", async () => {
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

    test("fails query parameter in snake_case", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/users:
                    get:
                        summary: hello
                        parameters:
                        - name: filter_thing
                          in: query
        `;
       
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });

    test("fails query parameter in PascalCase", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/users:
                    get:
                        summary: hello
                        parameters:
                        - name: FilterThing
                          in: query
        `;
       
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });

    test("fails query parameter in kebab-case", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/users:
                    get:
                        summary: hello
                        parameters:
                        - name: filter-thing
                          in: query
        `;
       
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });
});
