const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-invalid-description-type", () => {
  let spectral = null;
  const ruleName = "sps-invalid-description-type";
  const ruleset = "src/naming.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("description with type string is successful", async () => {
    const spec = `
      openapi: 3.1.0
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              description:
                type: string
              name:
                type: string
        `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("description with type number failure", async () => {
    const spec = `
      openapi: 3.1.0
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              description:
                type: number
        `;

    await spectral.validateFailure(spec, ruleName, "Error");
  });
});
