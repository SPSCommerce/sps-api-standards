const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-mandate-abbreviations-identifier", () => {
  let spectral = null;
  const ruleName = "sps-mandate-abbreviations-identifier";
  const ruleset = "src/naming.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("id with type string is successful", async () => {
    const spec = `
      openapi: 3.0.0
      info:
        title: Sample API
        version: 1.0.0
      paths:
        /users:
          get:
            responses:
              '200':
                description: A list of users
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        id:
                          type: string
                        reidentifier:
                          type: string
        `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("identifier should warn when it is the entire field name", async () => {
    const spec = `
      openapi: 3.0.0
      info:
        title: Sample API
        version: 1.0.0
      paths:
        /users:
          get:
            responses:
              '200':
                description: A list of users
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        identifier:
                          type: string
        `;

    await spectral.validateFailure(spec, ruleName, "Warning", 1);
  });

  test("identifier should not warn when it is a word present in the field name prefix", async () => {
    const spec = `
      openapi: 3.0.1
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              identifierNumber:
                type: number
        `;

        await spectral.validateSuccess(spec, ruleName);
  });

  test("identifier should not warn when it is a word present in the field name suffix", async () => {
    const spec = `
      openapi: 3.0.1
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              externalIdentifier:
                type: number
        `;

        await spectral.validateSuccess(spec, ruleName);
  });
});
