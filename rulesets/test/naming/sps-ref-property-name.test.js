const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-ref-property-name", () => {
    let spectral = null;
    const ruleName = "sps-ref-property-name";
    const ruleset = "src/naming.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("Ref property successful with proper format and example", async () => {
        const spec = `
        openapi: 3.0.1
        paths: {}
        components:
            schemas:
                MySchema:
                    type: object
                    properties:
                        ref:
                            type: string
                            format: sps-ref
                        value:
                            type: string
                    example:
                        ref: myrefvalue
                        name: hello
        `;

        await spectral.validateSuccess(spec, ruleName);
    });

    test("Ref property fails without proper format", async () => {
        const spec = `
        openapi: 3.0.1
        paths: {}
        components:
            schemas:
                MySchema:
                    type: object
                    properties:
                        ref:
                            type: string
                        value:
                            type: string
        `;
        await spectral.validateFailure(spec, ruleName, "Error");
    });

    test("Ref property fails with wrong format", async () => {
        const spec = `
        openapi: 3.0.1
        paths: {}
        components:
            schemas:
                MySchema:
                    type: object
                    properties:
                        ref:
                            type: string
                            format: uuid
                        value:
                            type: string
        `;
        await spectral.validateFailure(spec, ruleName, "Error");
    });

    test("Ref property refers to readOnly value, and should pass", async () => {
        const spec = `
        openapi: 3.0.1
        paths:
            /v1/test:
                post:
                    summary: Create a new Rule
                    requestBody:
                        required: true
                        content:
                            application/json:
                                schema:
                                    allOf:
                                    - $ref: '#/components/schemas/Rule'
                                    - properties:
                                        ref:
                                            readOnly: true
                                        priority:
                                            properties:
                                                id:
                                                    readOnly: false
                                                name:
                                                    readOnly: true
                                        type:
                                            properties:
                                                id:
                                                    readOnly: false
                                                name:
                                                    readOnly: true
                                                ref:
                                                    readOnly: true
        `;
        await spectral.validateSuccess(spec, ruleName);
    });
});
