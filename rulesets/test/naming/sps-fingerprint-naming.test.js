const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-fingerprint-naming", () => {
    let spectral = null;
    const ruleName = "sps-fingerprint-naming";
    const ruleset = "src/naming.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("fingerprint name succeeds", async () => {
        const spec = `
        openapi: 3.1.0
        paths: {}
        components:
            schemas:
                User:
                    type: object
                    properties:
                        id:
                            type: string
                        fingerprint:
                            type: string
                        
        `;

        await spectral.validateSuccess(spec, ruleName);
    });

    test("hashkey usage fails", async () => {
        const spec = `
        openapi: 3.1.0
        paths: {}
        components:
            schemas:
                User:
                    type: object
                    properties:
                        id:
                            type: string
                        hashkey:
                            type: string
                        
        `;
        await spectral.validateFailure(spec, ruleName, "Error");
    });

    test("hashKey (camelCase) usage fails", async () => {
        const spec = `
        openapi: 3.1.0
        paths: {}
        components:
            schemas:
                User:
                    type: object
                    properties:
                        id:
                            type: string
                        hashKey:
                            type: string
                        
        `;
        await spectral.validateFailure(spec, ruleName, "Error");
    });

    test("hash usage fails", async () => {
        const spec = `
        openapi: 3.1.0
        paths: {}
        components:
            schemas:
                User:
                    type: object
                    properties:
                        id:
                            type: string
                        hash:
                            type: string
                        
        `;
        await spectral.validateFailure(spec, ruleName, "Error");
    });
});
