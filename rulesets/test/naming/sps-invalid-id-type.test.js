const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-invalid-id-type", () => {
  let spectral = null;
  const ruleName = "sps-invalid-id-type";
  const ruleset = "src/naming.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("id with type string is successful", async () => {
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
        `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("id with type number failure", async () => {
    const spec = `
      openapi: 3.1.0
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              id:
                type: number
        `;

    await spectral.validateFailure(spec, ruleName, "Warning");
  });
});
