# Silverstripe CMS roadmap and support timeline JSON

Holds `data.json` used for the Silverstripe CMS roadmap and support timeline

The other files in the repository are for validating that data.json is valid in ci

## What to update when a new version of Silverstripe CMS is released

As part of a Silverstripe CMS release, after the release has been tagged, the `"releaseDate"` node of the release should be updated to be in `"YYYY-MM-DD"` format (NOT `"YYYY-MM"` format)

You will likely also need to update the `partialSupport"` and/or `"supportEnds"` nodes of some prior releases to the same `"YYYY-MM-DD"` date as the current version `"releaseDate"` and review any `releaseDateExtra`, `supportEndsExtra`, and `statusOverride` values.
