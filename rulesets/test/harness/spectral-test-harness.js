// SOURCED with attribution, thanks and modification from:
// https://gitlab.com/jamietanna/spectral-test-harness
const { fetch } = require('@stoplight/spectral-runtime')
const { Spectral, Document } = require('@stoplight/spectral-core')
const Parsers = require('@stoplight/spectral-parsers')
const fs = require('fs')
const path = require('path')
// we need to add `dist/loader/node` as per convo on https://github.com/stoplightio/spectral/issues/1956#issuecomment-999643841 for node 17 +
// const { bundleAndLoadRuleset } = require('@stoplight/spectral-ruleset-bundler/dist/loader/node.js');
const { bundleAndLoadRuleset } = require("@stoplight/spectral-ruleset-bundler/with-loader");
const { DiagnosticSeverity } = require('@stoplight/types');

class SpectralTestHarness {
    constructor(rulesetPath) {
        this.rulesetPath = rulesetPath;
    };

    validate = async function(content) {
        const ruleset = await bundleAndLoadRuleset(path.resolve(this.rulesetPath), { fs, fetch });
        this.spectral = new Spectral();
        this.spectral.setRuleset(ruleset);
        const document = new Document(content, Parsers.Yaml, "inline");

        this.results = await this.spectral.run(document);

        return this;
    };   

    validateFile = async function(documentPath) {
        const resolved = path.resolve(documentPath);
        const body = fs.readFileSync(resolved, 'utf8');
        return await this.validate(body);
    };

    validateSuccess = async function(spec, code) {
        await this.validate(spec);
        
        await this.assert(code, true, null, null);
    };

    validateFailure = async function(spec, code, severity, severityCount = 1) {
        await this.validate(spec);
        await this.assert(code, false, severity, severityCount);
    };

    assert = async function(code, isSuccessful, severity, severityCount = 1) {
        if (isSuccessful){
            expect(this.getResults(code)).toHaveLength(0);
        } else {
            var results = this.getResults(code, severity);
            expect(results).toHaveLength(severityCount);
        }
    };

    getResults = function(code = null, severity = null) {
        if (!this.results){
            throw 'No results to get, use the run method first.';
        }
        // console.log(JSON.stringify(this.results));
        let filteredResults = null;
        if (!code){
            filteredResults = this.results;
        } else {
            filteredResults = this.results.filter(r => r.code === code);
        }

        if (severity)
        {
            filteredResults = filteredResults.filter(r => DiagnosticSeverity[r.severity] === severity).map(r => {
                r.severity = DiagnosticSeverity[r.severity].toUpperCase();
                return r;
            });
        }
        
        return filteredResults;
    };

    getResultsErrors = function () {
        return this.getResults(null, 'Error');
    };
      
    getResultsWarnings = function () {
        return this.getResults(null, 'Warning');
    };
    
    getResultsInformative = function () {
        return this.getResults(null, 'Information');
    };
    
    getResultsHints = function () {
        return this.getResults(null, 'Hint');
    };
};

module.exports = {
     SpectralTestHarness
};