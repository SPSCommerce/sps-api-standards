const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-invalid-modified-by-type", () => {
  let spectral = null;
  const ruleName = "sps-invalid-modified-by-type";
  const ruleset = "src/naming.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("modifiedBy with type string is successful", async () => {
    const spec = `
      openapi: 3.1.0
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              modifiedBy:
                type: string
              fingerprint:
                type: string
      `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("modifiedBy with type number failure", async () => {
    const spec = `
      openapi: 3.1.0
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              modifiedBy:
                type: number
      `;

    await spectral.validateFailure(spec, ruleName, "Error");
  });
});
