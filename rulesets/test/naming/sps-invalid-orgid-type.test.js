const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-invalid-orgid-type", () => {
  let spectral = null;
  const ruleName = "sps-invalid-orgid-type";
  const ruleset = "src/naming.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("orgid with type string is successful", async () => {
    const spec = `
      openapi: 3.0.1
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              orgId:
                type: string
              fingerprint:
                type: string
        `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("orgid with type number failure", async () => {
    const spec = `
      openapi: 3.0.1
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              orgId:
                type: number
        `;

    await spectral.validateFailure(spec, ruleName, "Error");
  });
});
