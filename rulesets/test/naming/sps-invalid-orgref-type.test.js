const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-invalid-orgref-type", () => {
  let spectral = null;
  const ruleName = "sps-invalid-orgref-type";
  const ruleset = "src/naming.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("orgRef with type string is successful", async () => {
    const spec = `
      openapi: 3.0.1
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              orgRef:
                type: string
              fingerprint:
                type: string
        `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("orgRef with type number failure", async () => {
    const spec = `
      openapi: 3.0.1
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              orgRef:
                type: number
        `;

    await spectral.validateFailure(spec, ruleName, "Error");
  });
});
