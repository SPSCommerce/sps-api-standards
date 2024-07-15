const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-invalid-created-by-type", () => {
  let spectral = null;
  const ruleName = "sps-invalid-created-by-type";
  const ruleset = "src/naming.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("createdBy with type string is successful", async () => {
    const spec = `
      openapi: 3.0.1
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              createdBy:
                type: string
              fingerprint:
                type: string
      `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("createdBy with type number failure", async () => {
    const spec = `
      openapi: 3.0.1
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              createdBy:
                type: number
      `;

    await spectral.validateFailure(spec, ruleName, "Error");
  });
});
