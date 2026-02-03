const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-invalid-name-type", () => {
  let spectral = null;
  const ruleName = "sps-invalid-name-type";
  const ruleset = "src/naming.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("name with type string is successful", async () => {
    const spec = `
      openapi: 3.1.0
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              name:
                type: string
              fingerprint:
                type: string
      `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("name with type number failure", async () => {
    const spec = `
      openapi: 3.1.0
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              name:
                type: number
      `;

    await spectral.validateFailure(spec, ruleName, "Error");
  });
});
