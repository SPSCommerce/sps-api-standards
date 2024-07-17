const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-invalid-request-id-type", () => {
  let spectral = null;
  const ruleName = "sps-invalid-request-id-type";
  const ruleset = "src/naming.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("requestId with type string is successful", async () => {
    const spec = `
      openapi: 3.0.1
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              requestId:
                type: string
              fingerprint:
                type: string
        `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("requestId with type number failure", async () => {
    const spec = `
      openapi: 3.0.1
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              requestId:
                type: number
        `;

    await spectral.validateFailure(spec, ruleName, "Error");
  });
});
