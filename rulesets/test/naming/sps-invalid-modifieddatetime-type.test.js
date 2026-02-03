const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-invalid-modified-date-time-type", () => {
  let spectral = null;
  const ruleName = "sps-invalid-modified-date-time-type";
  const ruleset = "src/naming.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("modifiedDateTime with type string and format date-time is successful", async () => {
    const spec = `
      openapi: 3.1.0
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              modifiedDateTime:
                format: date-time
                type: string
              fingerprint:
                type: string
      `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("modifiedDateTime with type number failure", async () => {
    const spec = `
      openapi: 3.1.0
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              modifiedDateTime:
                type: number
      `;

    await spectral.validateFailure(spec, ruleName, "Error", 2);
  });

  test("modifiedDateTime with type string missing format failure", async () => {
    const spec = `
      openapi: 3.1.0
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              modifiedDateTime:
                type: string
      `;

    await spectral.validateFailure(spec, ruleName, "Error");
  });

  test("modifiedDateTime with type string and incorrect format failure", async () => {
    const spec = `
      openapi: 3.1.0
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              modifiedDateTime:
                type: string
                format: date
      `;

    await spectral.validateFailure(spec, ruleName, "Error");
  });
});
