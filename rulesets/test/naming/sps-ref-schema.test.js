const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-ref-schema", () => {
    let spectral = null;
    const ruleName = "sps-ref-schema";
    const ruleset = "src/naming.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("ref property successful with schema", async () => {
        const spec = `
        openapi: 3.1.0
        paths: {}
        components:
            schemas:
                MySchema:
                    type: object
                    properties:
                        ref:
                            type: string
                            format: sps-ref
                            maxLength: 255
                            minLength: 7
                            pattern: "^sps:[a-z0-9].*:.*$"
                        value:
                            type: string
        `;

        await spectral.validateSuccess(spec, ruleName);
    });

    test("ref property fails without type", async () => {
        const spec = `
        openapi: 3.1.0
        paths: {}
        components:
            schemas:
                MySchema:
                    type: object
                    properties:
                        ref:
                            format: sps-ref
                            maxLength: 255
                            minLength: 7
                            pattern: "^sps:[a-z0-9].*:.*$"
                        value:
                            type: string
        `;
        await spectral.validateFailure(spec, ruleName, "Error");
    });

    test("ref property fails without maxLength", async () => {
        const spec = `
        openapi: 3.1.0
        paths: {}
        components:
            schemas:
                MySchema:
                    type: object
                    properties:
                        ref:
                            type: string
                            format: sps-ref
                            minLength: 7
                            pattern: "^sps:[a-z0-9].*:.*$"
                        value:
                            type: string
        `;
        await spectral.validateFailure(spec, ruleName, "Error");
    });

    test("ref property fails without minLength", async () => {
        const spec = `
        openapi: 3.1.0
        paths: {}
        components:
            schemas:
                MySchema:
                    type: object
                    properties:
                        ref:
                            type: string
                            format: sps-ref
                            maxLength: 255
                            pattern: "^sps:[a-z0-9].*:.*$"
                        value:
                            type: string
        `;
        await spectral.validateFailure(spec, ruleName, "Error");
    });

    test("ref property fails without pattern", async () => {
        const spec = `
        openapi: 3.1.0
        paths: {}
        components:
            schemas:
                MySchema:
                    type: object
                    properties:
                        ref:
                            type: string
                            format: sps-ref
                            maxLength: 255
                            minLength: 7
                        value:
                            type: string
        `;
        await spectral.validateFailure(spec, ruleName, "Error");
    });

    test("ref property fails with wrong type", async () => {
        const spec = `
        openapi: 3.1.0
        paths: {}
        components:
            schemas:
                MySchema:
                    type: object
                    properties:
                        ref:
                            type: integer
                            format: sps-ref
                            maxLength: 255
                            minLength: 7
                            pattern: "^sps:[a-z0-9].*:.*$"
                        value:
                            type: string
        `;
        await spectral.validateFailure(spec, ruleName, "Error");
    });

    test("ref property fails with wrong max length", async () => {
        const spec = `
        openapi: 3.1.0
        paths: {}
        components:
            schemas:
                MySchema:
                    type: object
                    properties:
                        ref:
                            type: string
                            format: sps-ref
                            maxLength: 200
                            minLength: 7
                            pattern: "^sps:[a-z0-9].*:.*$"
                        value:
                            type: string
        `;
        await spectral.validateFailure(spec, ruleName, "Error");
    });

    test("ref property fails with wrong min length", async () => {
        const spec = `
        openapi: 3.1.0
        paths: {}
        components:
            schemas:
                MySchema:
                    type: object
                    properties:
                        ref:
                            type: string
                            format: sps-ref
                            maxLength: 255
                            minLength: 1
                            pattern: "^sps:[a-z0-9].*:.*$"
                        value:
                            type: string
        `;
        await spectral.validateFailure(spec, ruleName, "Error");
    });

    test("ref property fails with wrong pattern", async () => {
        const spec = `
        openapi: 3.1.0
        paths: {}
        components:
            schemas:
                MySchema:
                    type: object
                    properties:
                        ref:
                            type: string
                            format: sps-ref
                            maxLength: 255
                            minLength: 7
                            pattern: "^[a-z0-9].*:.*$"
                        value:
                            type: string
        `;
        await spectral.validateFailure(spec, ruleName, "Error");
    });

    test("ref property does not look unless format is sps-ref", async () => {
        const spec = `
        openapi: 3.1.0
        paths: {}
        components:
            schemas:
                MySchema:
                    type: object
                    properties:
                        ref:
                            type: string
                            format: sps-other
                            maxLength: 255
                            minLength: 7
                            pattern: "^sps:[a-z0-9].*:.*$"
                        value:
                            type: string
        `;
        await spectral.validateSuccess(spec, ruleName);
    });


});
