const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-no-keyword-conflicts", () => {
  let spectral = null;
  const ruleName = "sps-no-keyword-conflicts";
  const ruleset = "src/naming.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("valid property name", async () => {
    const spec = `
      openapi: 3.1.0
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
                        name:
                          type: string
            `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("invalid property name for", async () => {
    const spec = `
      openapi: 3.1.0
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
                        for:
                          type: string
        `;

    await spectral.validateFailure(spec, ruleName, "Warning", 1);
  });

  test("invalid property name abstract", async () => {
    const spec = `
      openapi: 3.1.0
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
                        abstract:
                          type: string
        `;

    await spectral.validateFailure(spec, ruleName, "Warning", 1);
  });

  test("invalid property name assert and for", async () => {
    const spec = `
      openapi: 3.1.0
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
                        for:
                          type: string
                        assert:
                          type: string
                          format: sps-ref
        `;

    await spectral.validateFailure(spec, ruleName, "Warning", 2);
  });

  test("valid property name defaultName", async () => {
    const spec = `
      openapi: 3.1.0
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
                        defaultName:
                          type: string
        `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("invalid property name default", async () => {
    const spec = `
      openapi: 3.1.0
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
                        default:
                          type: string
        `;

    await spectral.validateFailure(spec, ruleName, "Warning", 1);
  });
});
