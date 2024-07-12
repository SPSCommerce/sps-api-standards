const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-mandate-abbreviations-organization", () => {
  let spectral = null;
  const ruleName = "sps-mandate-abbreviations-organization";
  const ruleset = "src/naming.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("organization with type string is successful", async () => {
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
                        org:
                          type: string
                        organizational:
                          type: string
        `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("organization should warn when it is the entire field name", async () => {
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
                        organization:
                          type: string
        `;

    await spectral.validateFailure(spec, ruleName, "Warning", 1);
  });

  test("organization should warn when it is a word present in the field name", async () => {
    const spec = `
      openapi: 3.0.1
      paths: {}
      components:
        schemas:
          User:
            type: object
            properties:
              organizationNumber:
                type: number
              NumberOrganization
        `;

    await spectral.validateFailure(spec, ruleName, "Warning", 1);
  });
});
