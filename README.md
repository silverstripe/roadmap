# Silverstripe CMS roadmap and support timeline JSON

Holds `data.json` used for the Silverstripe CMS roadmap and support timeline and validates that its data is correct

The other files in the repository are for validating that `data.json`:

- has a validate JSON structure according to `data.schema.json`
- has validate support lengths according to the [Silverstripe release policy](https://docs.silverstripe.org/project_governance/release_policy/)

To validate `data.json` after updated it:

```bash
nvm use
npm install
npm run validate
```

## What to update when a new version of Silverstripe CMS is released

> ![IMPORTANT]
> Also review any `releaseDateExtra`, `supportEndsExtra`, and `statusOverride` values which may need to be updated.

Review the dates for the current version and other s to ensure they are correct. Most of the values will likely already be correct, though do double check them.

### New minor version was just released

For the new minor version:

- set `releaseDate` to todays date in `YYYY-MM-DD` format

If the new minor has a "Standard" `supportLength` (i.e. is NOT the final minor in the major series):

- set `partialSupport` to the `releaseDate` of the next minor version in `YYYY-MM` format
- set `supportEnds` to the `releaseDate` of the next minor version, `+6 months` in `YYYY-MM` format

If the new minor has an "Extended" `supportLength` (i.e. is the final minor in the major series):

- set `partialSupport` to `releaseDate`, `+1 year`, `+1 day` in `YYYY-MM-DD` format
- set `supportEnds` and `supportEndsExtra` to the `releaseDate` and `releaseDateExtra` of the major version two majors ahead e.g. for 6.4 this would be 8.0

For the prior minor version in the major series, which will have "Standard" `supportLength`:

- set `partialSupport` to the `releaseDate` of the new release in `YYYY-MM-DD` format
- set `supportEnds` to the `releaseDate` of the new version, `+6 months`, `+1 day` in `YYYY-MM-DD` format

> ![NOTE]
> The reason that `+1 day` is added in some situations is because of support commitments such as "6 months", and releases are made part way through a day e.g. at 10am. Adding `+1 day` ensures that the 6 month commitment is fullfilled, with a partial days worth of "bonus support" added

### New major version was just released:

For final minor version two majors ago (e.g if 6.0 was just released, update 4.13), which will have "Extended" `supportLength`:

- set `supportEnds` to the `releaseDate` of the new version in `YYYY-MM-DD` format
- set `supportEndsExtra` to `null`

Add in the subsequent minor versions for this major version series (e.g. if 6.0 was just released, add in 6.1, 6.2, 6.3, and 6.4)

For each of the new minor versions

- set `version` to the new version e.g. "6.1"
- set `releaseDate` to the `releaseDate` of the prior version `+6 months`, with either "April" or "October" as the month in `YYYY-MM` format. For the "x.1" version this must be "October" and may be as few as 3 months from the "x.0" release.
- set `releaseDateExtra` to `null`
- set `features` to `[]`, unless we have already planned the roadmap for the new version and it is ready to be published

For each of the new minor verisons, except for the last one in the series:

- set `supportLength` to "Standard"
- set `partialSupport` to the `releaseDate` of this version `+6 months`, in `YYYY-MM` format
- set `partialSupportExtra` to `null`
- set `supportEnds` to the `releaseDate` of this version `+1 year`, in `YYYY-MM` format
- set `supportEndsExtra` to `null`

For the last minor version in the series

- set `supportLength` to "Extended"
- set `partialSupport` to the `releaseDate` of this version `+1 year`, in `YYYY-MM` format
- set `partialSupportExtra` to `null`
- set `supportEnds` to the `releaseDate` of this version `+2 years`, in `YYYY-MM` format
- set `supportEndsExtra` to the `supportEnds` of this version `+2 months`, in `YYYY-MM` format

Add the initial minor version of the next major series (e.g. if 6.0 was just released, add 7.0)

- set `version` to the new version e.g. "8.0"
- set `supportLength` to "Standard"
- set `releaseDate` to the `releaseDate` of the new version `+2 years`, with "April" as the month, in `YYYY-MM` format
- set `releaseDateExtra` to the `releaseDate` of the new version `+2 years`, with "June" as the month, in `YYYY-MM` format
- set `partialSupport` to the `releaseDate` of the new version `+2 years`, with "October" as the month, in `YYYY-MM` format
- set `partialSupportExtra` to `null`
- set `supportEnds` to the `releaseDate` of the new version `+3 years`, with "April" as the month, in `YYYY-MM` format
- set `supportEndsExtra` to `null`
- set `features` to `[]`

For the final minor version one major ago (e.g if 6.0 was just released, update 5.4), which will have "Extended" `supportLength`:

- set `supportEnds` to the `releaseDate` of the next major version in `YYYY-MM` format
- set `supportEndsExtra` to the `releaseDateExtra` of the next major version in `YYYY-MM` format
