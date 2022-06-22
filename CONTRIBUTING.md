# Contributing

SPS Commerce is committed to providing and maintaining the documentation and rulesets provided in this repository. This serves as foundational details for alignment of the internal and external REST APIs built at SPS Commerce. Community engagement from both external organizational partners or additional external consumers of these API Standards is encouraged, though SPS Commerce reserves the right to make and accept updates that are in the best interest of their API Platform first and foremost. 

Opening [issues](https://github.com/SPSCommerce/sps-api-standards/issues) is the best method to drive feature requests, bug fixes, discussions or thoughts you have about the repository contents and roadmap. SPS Commerce is determined to continually evolve the standards and rulesets with more content as driven internally by our technical organization and API consumers.

**Note**: we have a code of conduct, please follow it in all your interactions with this project.

## Development

### Updating

If you have a a simple and obvious addition, such as a grammar or documentation fix, or even a new proposed ruleset, providing a Pull Request from your forked repository is the best method to engage the community with further discussion and review. If you are proposing larger scale changes or potential change in direction for the API Standards, it would be best to first open an [issue](https://github.com/SPSCommerce/sps-api-standards/issues) first before you begin any work to avoid any wasted time.

When updating content, consider:
- "MUST", "MUST NOT", "SHOULD" and "SHOULD NOT" are used in the context as [defined in RFC2119](https://www.ietf.org/rfc/rfc2119.txt).
- Provide links to other parts of the standards where associations need to be made but at all costs reduce duplication as it is detrimental to maintenance and accuracy.
- Clearly call out any assumptions inline.
- Ambiguity is clarified through examples.
- Examples of what not to do are just as important as what to do.
- All examples should use standardized consistency and syntax for schema definitions.
- No differences between internal or external APIs should be called out, as all APIs should be crafted in preparation for externalization.
- Compose and reuse other API Guidelines, standards and schemas where possible including the use of existing industry standard RFCs.
- Usage of American English ([en-US](https://www.andiamo.co.uk/resources/iso-language-codes/)) is desirable for documentation consistency.
- Create [Spectral rules](https://meta.stoplight.io/docs/spectral/01baf06bdd05a-rulesets), where possible, for any new API Standards added to documentation.
- New Spectral rule codes should always be prefixed with `sps` to indicate they come from this library and ruleset.
- Link Spectral rule codes to the API Standards documentation markdown following the existing pattern with the checkmark icon:
```
<a name="sps-your-rule" href="#sps-your-rule"><i class="fa fa-check-circle" title="#sps-your-rule"></i></a>
```

Newly suggested API Standards will be evaluated based on the [Design Principles](README.md#design-principles).

### Testing

All Spectral rules added **MUST** be unit-tested with positive and negative examples demonstrating when the rule results in linting error/warning and then also succeeding. [Jest](https://jestjs.io/) is used to create tests using a custom [spectral harness](rulesets/test/harness//spectral-test-harness.js) abstracted from the [spectral-core npm packages](https://www.npmjs.com/package/@stoplight/spectral-core). A minimum version of [node.js 16 is required](https://nodejs.org/en/about/releases/).

Each Spectral rule is placed in its own test file, in the proper designated directory defined by its documentation category. The file name convention is `sps-{your-rule-code}.test.js`. 

For simplicity, `jest` should be installed globally (at version `28.1.1` at time of writing, see updated version in [package.json](rulesets/package.json)). Tests should be executed from the `rulesets` directory.

```bash
# install jest global
/> npm install -g jest@28.1.1

# navigate inside the rulesets directory
/> cd rulesets

# install all dependencies
/rulesets> npm install

# run all tests
/rulesets> jest

# run a specific test based on spectral code / file
/rulesets> jest -t sps-hosts-https-only
```

You can also manually execute any `ruleset.yml` spectral file against the [root.openapi.yml](rulesets/test/root.openapi.yml) testing reference for manual sandboxing:

```bash
# install spectral globally for CLI usage
/rulesets> npm install -g @stoplight/spectral-cli

# execute linting (note the directory is "rulesets")
/rulesets> spectral lint test/root.openapi.yml --ruleset src/url-structure.ruleset.yml
```

For more information on how Spectral is consumed and used refer to [OpenAPI Linting with Spectral](README.md#openapi-linting-with-spectral).

### Pull Requests

Pull requests can be submitted for any updates or bug fixes from forked versions of the repository. [CODEOWNERS](.github/CODEOWNERS) file automatically ensures your API is assigned the internal SPS Commerce reviewers group that will review and respond in a reasonable period of time. When submitting your Pull Request, be sure to:

- Add enough details via the Pull Request description about what your update and change is doing.
- Update any relevant documentation with the change being made in the same Pull Request.
- Update unit tests for any associated ruleset or documentation modifications.

Pull request validation via GitHub Actions will be approved after the Pull Request is reviewed to ensure no modifications to the GitHub Actions workflow. This is necessary on every Pull Request from community contributors regardless of previous history.

### Merging & Releasing

Updates are only added via Pull Requests, and they will be merged by a maintainer at the appropriate time. The maintainer will always use a [squash merge](https://docs.microsoft.com/en-us/azure/devops/repos/git/merging-with-squash?view=azure-devops) and apply a GIT Commit message for the squash adhering to the [Semantic Release](https://github.com/semantic-release/semantic-release) format that will calculate the [SemVer](https://semver.org/) value based on syntax of the message. The message will indicate if it is a patch, major or minor change. Further discussion on [how semantic versioning is used in these standards](README.md#api-standards-versioning) should be reviewed.

When pushed to the `main` branch and versioned, a consolidated file of all the Spectral rulesets and a zip file of all the markdown documentation is made available as a [GitHub Release](https://github.com/SPSCommerce/sps-api-standards/releases) immediately, which identifies the changes made in that release along with the version number. Documentation is made available via [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages) automatically shortly after at: [https://spscommerce.github.io/sps-api-standards]. Further internal deployment infrastructure at SPS Commerce will recognize the release and coordinate a deployment to the SPS Commerce Content Delivery Network (CDN) making the latest Spectral ruleset available at: [https://cdn.prod.spsc.io/api/design/standards/rulesets/custom/latest/sps-api-standards.spectral.yml] (version specific references available as well).

## Code of Conduct

### Our Pledge

In the interest of fostering an open and welcoming environment, we as
contributors and maintainers pledge to making participation in our project and
our community a harassment-free experience for everyone, regardless of age, body
size, disability, ethnicity, gender identity and expression, level of experience,
nationality, personal appearance, race, religion, or sexual identity and
orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment
include:

* Using welcoming and inclusive language
* Being respectful of differing viewpoints and experiences
* Gracefully accepting constructive criticism
* Focusing on what is best for the community
* Showing empathy towards other community members

Examples of unacceptable behavior by participants include:

* The use of sexualized language or imagery and unwelcome sexual attention or
advances
* Trolling, insulting/derogatory comments, and personal or political attacks
* Public or private harassment
* Publishing others' private information, such as a physical or electronic
  address, without explicit permission
* Other conduct which could reasonably be considered inappropriate in a
  professional setting

### Our Responsibilities

Project maintainers are responsible for clarifying the standards of acceptable
behavior and are expected to take appropriate and fair corrective action in
response to any instances of unacceptable behavior.

Project maintainers have the right and responsibility to remove, edit, or
reject comments, commits, code, wiki edits, issues, and other contributions
that are not aligned to this Code of Conduct, or to ban temporarily or
permanently any contributor for other behaviors that they deem inappropriate,
threatening, offensive, or harmful.

### Scope

This Code of Conduct applies both within project spaces and in public spaces
when an individual is representing the project or its community. Examples of
representing a project or community include using an official project e-mail
address, posting via an official social media account, or acting as an appointed
representative at an online or offline event. Representation of a project may be
further defined and clarified by project maintainers.

### Attribution

This Code of Conduct is adapted from the [Good-Contributing.md template](https://gist.github.com/PurpleBooth/b24679402957c63ec426).