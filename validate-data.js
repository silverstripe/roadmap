/**
 * Validates the data, including dates, in data.json
 *
 * Assumptions:
 * - validate-schema.js has has already been run before this script been run
 * - EOL versions may be dropped from data.json at any point after they have transitioned to not displaying on the table
 */

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
const data = require('./data.json');

/**
 * Add time to an existing dateStr while retaining existing formatting
 *
 * @param dataStr - dateStr in either YYYY-MM or YYYY-MM-DD format
 * @param timeValue - int of the number of timeUnit's to add e.g. 3
 * @param timeUnit - string of the unit of time e.g. 'day' or 'month'
 * @param plusOneDay - whether to add +1 day
 */
function addTime(dateStr, timeValue, timeUnit, plusOneDay) {
    const hasDayPart = dateStrHasDayPart(dateStr);
    const format = hasDayPart ? 'YYYY-MM-DD' : 'YYYY-MM';
    let dayjsObj = dayjs(dateStr, format);
    dayjsObj = dayjsObj.add(timeValue, timeUnit);
    if (plusOneDay) {
        dayjsObj = dayjsObj.add(1, 'day');
    }
    return dayjsObj.format(format);
}

/**
 * Compare a dateStr to the current date in NZT
 * If a YYYY-MM dateStr is supplied, then it's assumed the days part is the last day of the month
 *
 * @param dataStr - dateStr in either YYYY-MM or YYYY-MM-DD format
 * @param comparitor - a comparitor, one of 'lt', 'lte', 'gt', 'gte
 */
function compareToNow(dateStr, comparitor) {
    // if dateStr is in YYYY-MM format, then create a new dateStr with the last day of that
    // month as the day part
    let dateToCompare = dateStr;
    if (!dateStrHasDayPart(dateStr)) {
        dateToCompare = dayjs(dateStr).endOf('month').format('YYYY-MM-DD');
    }
    const nowInNZT = dayjs().tz('Pacific/Auckland').format('YYYY-MM-DD');
    const dayjsObj = dayjs(dateToCompare);
    const lessThan = dayjsObj.isBefore(nowInNZT, 'day');
    const equalTo = dayjsObj.isSame(nowInNZT, 'day');
    const greaterThan = dayjsObj.isAfter(nowInNZT, 'day');
    switch (comparitor) {
        case 'lt':
            return lessThan;
        case 'lte':
            return lessThan || equalTo;
        case 'gt':
            return greaterThan;
        case 'gte':
            return greaterThan || equalTo;
        default:
            error(`Invalid comparitor: ${comparitor}`);
            process.exit(1);
    }
}

/**
 * Whether the dateStr contains a date part or not i.e. if it is in YYYY-MM-DD or YYYY-MM format
 */
function dateStrHasDayPart(dateStr) {
    return dateStr.match(/^\d{4}-\d{2}-\d{2}?$/);
}

/**
 * Get the 'major' part of a version
 */
function getMajor(obj) {
    const match = obj.version.match(/^(\d+)\.(\d+)$/);
    if (!match) {
        error(`Invalid version: ${obj.version}`);
    }
    return match[1] * 1;
}

/**
 * Get a specific version obj
 * Will return null if version does not exist
 */
function getVersionObj(versionNumber) {
    for (const obj of data.data) {
        if (obj.version === versionNumber) {
            return obj;
        }
    }
    return null;
}

/**
 * Whether obj has been released or not, based on it being less than or equal to todays date in NZT
 */
function hasBeenReleased(obj) {
    return compareToNow(obj.releaseDate, 'lte');
}

/**
 * Print an error to console
 */
function error(message, scope, version) {
    console.error(`${scope} ${version} ${message}`);
    didError = true;
}

// Variables used for errors
let didError = false;
let scope = '';
let version = '';

// Validate the last major only shows an initial version
scope = 'Unreleased majors';
const foundMajors = {};
let foundMajorInFuture = false;
for (var i = 0; i < data.data.length; i++) {
    const currObj = data.data[i];
    const major = getMajor(currObj);
    const version = currObj.version;
    if (foundMajors.hasOwnProperty(major)) {
        continue;
    }
    if (!hasBeenReleased(currObj)) {
        if (foundMajorInFuture) {
            error(`only one unreleased major can be included in the data`, scope, version);
        }
        foundMajorInFuture = true;
    }
    foundMajors[major] = true;
}
if (!foundMajorInFuture) {
    version = '';
    error('the last major must be unreleased', scope, version);
}

// Validate dates and support lengths
for (var i = 0; i < data.data.length; i++) {
    // The current obj being processed e.g. the obj with version 5.4
    const currObj = data.data[i];
    // The prev obj, e.g. 5.3
    const prevObj = i > 0 ? data.data[i - 1] : null;
    // The next obj, e.g. 6.0
    const nextObj = i < (data.data.length - 1) ? data.data[i + 1] : null;
    // The initial version 2 majors ahead e.g. for 4.13 this will be 6.0, for 5.2 this will be 7.0
    const dmajObj = getVersionObj((getMajor(currObj) + 2) + '.0');
    const isFinalMinor = nextObj && getMajor(currObj) !== getMajor(nextObj);
    // Note that this is first minor for a major in data.json, not necessarily the actual first version
    // For instance 5.2 might be the first minor in data.json, though 5.0 was the actual first version
    // The !isFinalMinor check is for something like 4.13 which is the only version for CMS 4
    const isFirstMinor = !isFinalMinor && (!prevObj || getMajor(prevObj) !== getMajor(currObj));
    const isIntermediateMinor = !isFirstMinor && !isFinalMinor;

    // variable which is reused for multiple assertions
    let expected;

    // Update globally scoped object
    version = currObj.version;

    // Validate releaseDate and releaseDateExtra - applies to all scenarios
    if (hasBeenReleased(currObj)) {
        scope = 'Released version';
        // If the version has been released, then it must specify a day part
        if (!currObj.releaseDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            error(`releaseDate must be in YYYY-MM-DD format`, scope, version);
        }
        // If the version has been released, it must have not have a range for its release date
        if (currObj.releaseDateExtra !== null) {
            error(`releaseDateExtra must be null`, scope, version);
        }
    } else {
        scope = 'Unreleased version';
        // If the version has not been released, then it must not specify a day part
        if (!currObj.releaseDate.match(/^\d{4}-\d{2}$/)) {
            error(`releaseDate must be in YYYY-MM format`, scope, version);
        }if (currObj.releaseDateExtra !== null && !currObj.releaseDateExtra.match(/^\d{4}-\d{2}$/)) {
            error(`releaseDateExtra must be in YYYY-MM format or null`, scope, version);
        }
    }

    if (isFirstMinor) {
        // e.g. 6.0, 7.0
        scope = 'First minor version';
        if (currObj.supportLength !== 'Standard') {
            error(`supportLength must be "Standard"`, scope, version);
        }
        // Standard + Full support - Approximately 6 months, until the next minor release is performed
        if (nextObj) {
            // Here we use "until the next minor release is performed"
            if (currObj.partialSupport !== nextObj.releaseDate) {
                error(`partialSupport must be "${nextObj.releaseDate}"`, scope, version);
            }
        } else {
            // Here we use "approximately 6 months", because there is no known next minor release date
            // This is only the case for the first minor of a planned future major version series.
            expected = addTime(currObj.releaseDate, 6, 'months', false);
            if (currObj.partialSupport !== expected) {
                error(`partialSupport must be "${expected}"`, scope, version);
            }
        }
        if (!hasBeenReleased(currObj)) {
            // This will be an unreleased next major, it needs an April-June release date
            scope = 'Unreleased first minor version';
            if (currObj.releaseDateExtra === null) {
                error(`releaseDateExtra must not be null`, scope, version);
            }
        }
        // Standard + Partial support - exactly 6 months (+1 day)
        expected = addTime(currObj.partialSupport, 6, 'months', true);
        if (currObj.supportEnds !== expected) {
            error(`supportEnds must be "${expected}"`, scope, version);
        }

    } else if (isIntermediateMinor) {
        // e.g. 5.3, 6.1
        scope = 'Intermediate minor version';
        if (currObj.supportLength !== 'Standard') {
            error('supportLength must be "Standard"', scope, version);
        }
        // Standard + Full support - until the next minor release is performed
        if (currObj.partialSupport !== nextObj.releaseDate) {
            error(`partialSupport must be ${nextObj.releaseDate}`, scope, version);
        }
        // Standard + Partial support - exactly 6 months (+1 day)
        expected = addTime(currObj.partialSupport, 6, 'months', true);
        if (currObj.supportEnds !== expected) {
            error(`supportEnds must be "${expected}"`, scope, version);
        }

    } else if (isFinalMinor) {
        // e.g. 5.4, 6.4
        scope = 'Final minor version';
        if (currObj.supportLength !== 'Extended') {
            error(`Final minor ${currObj.version} must have a supportLength of Extended`, scope, version);
        }
        // Extended + Full support - exactly 1 year (+1 day)
        expected = addTime(currObj.releaseDate, 1, 'year', true);
        if (currObj.partialSupport !== expected) {
            error(`partialSupport must be "${expected}"`, scope, version);
        }
        // Extended + Partial support - Approximately one year, extending until two subsequent major releases have been performed
        if (dmajObj) {
            scope = 'Final minor version and two majors ahead exists';
            // Use "extending until two subsequent major releases have been performed"
            if (currObj.supportEnds !== dmajObj.releaseDate) {
                error(`supportEnds must be "${dmajObj.releaseDate}"`, scope, version);
            }
            if (currObj.supportEndsExtra !== dmajObj.releaseDateExtra) {
                error(`supportEndsExtra must be "${dmajObj.releaseDateExtra}"`, scope, version);
            }
        } else {
            scope = 'Final minor version and two majors ahead does not exist';
            // Use "Approximately one year"
            expected = addTime(currObj.partialSupport, 1, 'year', false);
            if (currObj.supportEnds !== expected) {
                error(`supportEnds must be "${expected}"`, scope, version);
            }
            // Need an April-June like support ends date
            expected = addTime(expected, 2, 'months');
            if (currObj.supportEndsExtra !== expected) {
                error(`supportEndsExtra must be "${expected}"`, scope, version);
            }
        }
    }
}

if (didError) {
    process.exit(1);
} else {
    console.log('The dates in data.json are valid.');
    process.exit(0);
}
