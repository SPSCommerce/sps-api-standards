const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-invalid-ref-type", () => {
  let spectral = null;
  const ruleName = "sps-invalid-ref-type";
  const ruleset = "src/naming.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("ref with type string is successful", async () => {
    const spec = `
      openapi: 3.1.0
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              ref:
                type: string
              fingerprint:
                type: string
        `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("ref with type number failure", async () => {
    const spec = `
      openapi: 3.1.0
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              ref:
                type: number
        `;

    await spectral.validateFailure(spec, ruleName, "Error");
  });
});
