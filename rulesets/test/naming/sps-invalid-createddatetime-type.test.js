const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-invalid-created-date-time-type", () => {
  let spectral = null;
  const ruleName = "sps-invalid-created-date-time-type";
  const ruleset = "src/naming.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("createdDateTime with type string and format date-time is successful", async () => {
    const spec = `
      openapi: 3.1.0
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              createdDateTime:
                type: string
                format: date-time
              fingerprint:
                type: string
      `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("createdDateTime with type number failure", async () => {
    const spec = `
      openapi: 3.1.0
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              createdDateTime:
                type: number
      `;

    await spectral.validateFailure(spec, ruleName, "Error", 2);
  });

  test("createdDateTime with type string missing format", async () => {
    const spec = `
      openapi: 3.1.0
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              createdDateTime:
                type: string
      `;

    await spectral.validateFailure(spec, ruleName, "Error");
  });

  test("createdDateTime with type string and wrong format", async () => {
    const spec = `
      openapi: 3.1.0
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              createdDateTime:
                type: string
                format: date
      `;

    await spectral.validateFailure(spec, ruleName, "Error");
  });
});
