const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-invalid-modifdeletedbyiedby-type", () => {
  let spectral = null;
  const ruleName = "sps-invalid-deleted-by-type";
  const ruleset = "src/naming.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("deletedby with type string is successful", async () => {
    const spec = `
      openapi: 3.1.0
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              deletedBy:
                type: string
              fingerprint:
                type: string
      `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("deletedBy with type number failure", async () => {
    const spec = `
      openapi: 3.1.0
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              deletedBy:
                type: number
      `;

    await spectral.validateFailure(spec, ruleName, "Error");
  });
});
