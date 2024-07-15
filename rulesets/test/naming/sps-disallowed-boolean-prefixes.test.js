const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-disallowed-boolean-prefixes", () => {
  /** @type {SpectralTestHarness} */ let spectral = null;
  const ruleName = "sps-disallowed-boolean-prefixes";
  const ruleset = "src/naming.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });

  test("all invalid property names", async () => {
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
                        is:
                          type: boolean
                        has:
                          type: boolean
                        was:
                          type: boolean
                        will:
                          type: boolean
                        needs:
                          type: boolean
                        uses:
                          type: boolean
                        should:
                          type: boolean
                        can:
                          type: boolean
                        validPropertyName:
                          type: boolean
            `;

    await spectral.validateFailure(spec, ruleName, "Warning", 8);
  });

  test("invalid property name isTest", async () => {
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
                        isTest:
                          type: boolean
            `;

    await spectral.validateFailure(spec, ruleName, "Warning", 1);
  });

  test("invalid property name hasTest", async () => {
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
                        hasTest:
                          type: boolean
            `;

    await spectral.validateFailure(spec, ruleName, "Warning", 1);
  });

  test("valid string name with invalid boolean name", async () => {
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
                        hasTest:
                          type: string
        `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("invalid property name forSomething", async () => {
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
                        forSomething:
                          type: string
        `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("valid property name at", async () => {
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
                        at:
                          type: string
        `;

    await spectral.validateSuccess(spec, ruleName);
  });
});
