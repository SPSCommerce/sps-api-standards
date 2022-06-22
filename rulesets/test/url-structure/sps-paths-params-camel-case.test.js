const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-paths-params-camel-case", () => {
    let spectral = null;
    const ruleName = "sps-paths-params-camel-case";
    const ruleset = "src/url-structure.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("succeeds with camel case", async () => {
        const spec = `
            openapi: 3.1.0
            paths:
                /v1/users/{userId}:
                    get:
                        summary: Get User by ID
                        parameters:
                        - name: userId
                          in: path
                          description: A unique identifier for the User.
        `;
       
        await spectral.validateSuccess(spec, ruleName);
    });

    test("fails with snake_case", async () => {
        const spec = `
        openapi: 3.1.0
        paths:
            /v1/users/{user_id}:
                get:
                    summary: Get User by ID
                    parameters:
                    - name: user_id
                      in: path
                      description: A unique identifier for the User.
        `;
       
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });

    test("fails with PascalCase", async () => {
        const spec = `
        openapi: 3.1.0
        paths:
            /v1/users/{UserId}:
                get:
                    summary: Get User by ID
                    parameters:
                    - name: UserId
                      in: path
                      description: A unique identifier for the User.
        `;
       
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });

    test("fails with kebab-case", async () => {
        const spec = `
        openapi: 3.1.0
        paths:
            /v1/users/{user-id}:
                get:
                    summary: Get User by ID
                    parameters:
                    - name: user-id
                      in: path
                      description: A unique identifier for the User.
        `;
       
        await spectral.validateFailure(spec, ruleName, "Error", 1);
    });
});
