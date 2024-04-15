const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-invalid-fingerprint-type", () => {
  let spectral = null;
  const ruleName = "sps-invalid-fingerprint-type";
  const ruleset = "src/naming.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("fingerprint with type string is successful", async () => {
    const spec = `
      openapi: 3.0.1
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

  test("fingerprint with type number failure", async () => {
    const spec = `
      openapi: 3.0.1
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              id:
                type: string
              fingerprint:
                type: number
        `;

    await spectral.validateFailure(spec, ruleName, "Error");
  });
});
