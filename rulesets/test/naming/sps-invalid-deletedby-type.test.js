const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-invalid-modifdeletedbyiedby-type", () => {
  let spectral = null;
  const ruleName = "sps-invalid-deletedby-type";
  const ruleset = "src/naming.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("deletedby with type string is successful", async () => {
    const spec = `
      openapi: 3.0.1
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
      openapi: 3.0.1
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
