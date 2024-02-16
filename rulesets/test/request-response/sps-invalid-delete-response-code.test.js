const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-invalid-delete-response-code", () => {
    let spectral = null;
    const ruleName = "sps-invalid-delete-response-code";
    const ruleset = "src/request-response.ruleset.yml";

    beforeEach(async () => {
        spectral = new SpectralTestHarness(ruleset);
    });

    test("valid DELETE response code", async () => {
        const spec = `
        openapi: 3.1.0
        paths:
          /example:
            delete:
              summary: Example DELETE endpoint
              responses:
                '202':
                  description: Accepted
          `;
    
          await spectral.validateSuccess(spec, ruleName);
    });

    test("invalid DELETE response code 200", async () => {
      const spec = `
      openapi: 3.1.0
      paths:
        /example:
          delete:
            summary: Example DELETE endpoint
            responses:
              '200':
                description: OK
              '202':
                description: Accepted
        `;
  
        await spectral.validateFailure(spec, ruleName, "Warning", 1);
    });

    test("invalid DELETE response code 201", async () => {
      const spec = `
      openapi: 3.1.0
      paths:
        /example:
          delete:
            summary: Example DELETE endpoint
            responses:
              '201':
                description: OK
              '202':
                description: Accepted
        `;
  
        await spectral.validateFailure(spec, ruleName, "Warning", 1);
    });
    
});
