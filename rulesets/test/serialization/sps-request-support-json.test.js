const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-request-support-json", () => {
    let spectral = null;
    const ruleName = "sps-request-support-json";
    const ruleset = "src/serialization.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("single application/json type successful", async () => {
        const spec = `
        openapi: 3.0.1
        paths:
          /v1/users/{id}:
            post:
                summary: Create User
                requestBody:
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    id:
                                        type: string
                                        description: The unique identifier for the system this user belongs to.
                                        format: uid
                                        example: 12345678-1234-1234-1234-123456789012
                    required: true
                responses:
                    "201":
                        description: User has been successfully created.
        `;
    
        await spectral.validateSuccess(spec, ruleName);
    });

    test("no request parameters validate", async () => {
        const spec = `
        openapi: 3.0.1
        paths:
          /v1/users/{id}:
            post:
                summary: Create User
                responses:
                    "201":
                        description: User has been successfully created.
        `;
    
        await spectral.validateSuccess(spec, ruleName);
    });

    test("multiple content types works with application/json", async () => {
        const spec = `
        openapi: 3.0.1
        paths:
            /v1/users:
                post:
                    summary: Create User
                    requestBody:
                        content:
                            multipart/form-data: 
                                schema:
                                    type: object
                                    properties:
                                        id:
                                            type: string
                                            description: The unique identifier for the system this user belongs to.
                                            format: uid
                                            example: 12345678-1234-1234-1234-123456789012
                            application/json:
                                schema:
                                    type: object
                                    properties:
                                        id:
                                            type: string
                                            description: The unique identifier for the system this user belongs to.
                                            format: uid
                                            example: 12345678-1234-1234-1234-123456789012
                        required: true
                    responses:
                        "201":
                            description: User has been successfully created.
        `;
        await spectral.validateSuccess(spec, ruleName);
    });

    test("no application/json media type causses error", async () => {
        const spec = `
        openapi: 3.0.1
        paths:
            /v1/users:
                post:
                    summary: Create User
                    requestBody:
                        content:
                            multipart/form-data: 
                                schema:
                                    type: object
                                    properties:
                                        id:
                                            type: string
                                            description: The unique identifier for the system this user belongs to.
                                            format: uid
                                            example: 12345678-1234-1234-1234-123456789012
                        required: true
                    responses:
                        "201":
                            description: User has been successfully created.
        `;
        await spectral.validateFailure(spec, ruleName, "Error");
    });
});
