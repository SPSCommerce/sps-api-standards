const { SpectralTestHarness } = require("../harness/spectral-test-harness.js");

describe("sps-camel-case-properties", () => {
  let spectral = null;
  const ruleName = "sps-camel-case-properties";
  const ruleset = "src/naming.ruleset.yml";

  beforeEach(async () => {
    spectral = new SpectralTestHarness(ruleset);
  });


  test("valid property names with two capital letters in a row", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /users:
          post:
            requestBody:
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      censusScheduleKLocation:
                        type: string
            responses:
              '200':
                description: Successful operation
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        userIDcode:
                          type: string
      `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("invalid property names with more than two capital letters in a row", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /users:
          post:
            requestBody:
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      invalidTESt:
                        type: string
            responses:
              '200':
                description: Successful operation
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        invalidTESTtest:
                          type: string
      `;

    await spectral.validateFailure(spec, ruleName, "Error", 2);
  });

  test("valid property names", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /users:
          post:
            requestBody:
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      orderNumber:
                        type: string
                      lineItemNumber:
                        type: integer
            responses:
              '200':
                description: Successful operation
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        userId:
                          type: string
                        userName:
                          type: string
                        test1:
                          type: string
      `;

    await spectral.validateSuccess(spec, ruleName);
  });

  test("invalid usage of camel casing in property names", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /users:
          post:
            requestBody:
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      OrderNumber:
                        type: string
                      line_item_number:
                        type: integer
            responses:
              '200':
                description: Successful operation
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        User_Id:
                          type: string
                        user_Name:
                          type: string
      `;

    await spectral.validateFailure(spec, ruleName, "Error", 4);
  });

  test("invalid usage of camel casing for acronyms", async () => {
    const spec = `
      openapi: 3.1.0
      paths:
        /users:
          post:
            requestBody:
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      orderID:
                        type: string
            responses:
              '200':
                description: Successful operation
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        userID:
                          type: string
                        userName:
                          type: string
      `;

    await spectral.validateFailure(spec, ruleName, "Error", 2);
  });
});
