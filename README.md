# Silverstripe CMS roadmap and support timeline JSON

Holds `data.json` used for the Silverstripe CMS roadmap and support timeline

The other files in the repository are for validating that data.json is valid in ci

## What to update when a new version of Silverstripe CMS is released

> ![IMPORTANT]
> Also review any `releaseDateExtra`, `supportEndsExtra`, and `statusOverride` values which may need to be updated.

### New minor version was just released

For the new minor version:

- set `releaseDate` to todays date in `YYYY-MM-DD` format

If the new minor has a "Standard" `supportLength` (i.e. is NOT the last minor in the major series):

- set `partialSupport` to `releaseDate` + 6 months in `YYYY-MM` format
- set `supportEnds` to `releaseDate` + 1 year in `YYYY-MM` format

If the new minor has an "Extended" `supportLength` (i.e. is the last minor in the major series):

- set `partialSupport` to `releaseDate` + 1 year in `YYYY-MM-DD` format
- set `supportEnds` to `releaseDate` + 2 years in `YYYY-MM` format

For the prior minor version in the major series, which will have "Standard" `supportLength`:

- set `partialSupport` to the `releaseDate` of the new release in `YYYY-MM-DD` format
- set `supportEnds` to the `releaseDate` of the new release + 6 months in `YYYY-MM-DD` format

### New major version was just released:

For last minor version two majors ago (e.g if 6.0 was just released, updated 4.13), which will have "Extended" `supportLength`:

- set `supportEnds` to the `releaseDate` of the new release in `YYYY-MM-DD` format
- set `supportEndsExtra` to `null`

For the last minor version one major ago (e.g if 6.0 was just released, updated 5.4), which will have "Extended" `supportLength`:
