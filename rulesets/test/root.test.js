const { SpectralTestHarness } = require("./harness/spectral-test-harness.js");

describe("root-run", () => {
    let spectral = null;
    beforeEach(async () => {
        spectral = new SpectralTestHarness("src/.spectral.yml");
    });
    
    test("root spec on full template is ok", async () => {
        await spectral.validateFile("test/root.openapi.yml")
        expect(spectral.getResultsErrors()).toHaveLength(0);
        expect(spectral.getResultsWarnings()).toHaveLength(0);
    });
});
