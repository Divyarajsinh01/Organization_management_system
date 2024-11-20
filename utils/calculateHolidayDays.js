const moment = require('moment')

const calculateHolidayDays = (holidays, startDate, endDate) => {
    const rangeStart = moment(startDate, 'YYYY-MM-DD'); // Start of requested range
    const rangeEnd = moment(endDate, 'YYYY-MM-DD'); // End of requested range

    return holidays.reduce((totalDays, holiday) => {
        const holidayStart = moment(holiday.start_date, 'YYYY-MM-DD'); // Holiday start
        const holidayEnd = moment(holiday.end_date, 'YYYY-MM-DD'); // Holiday end

        // Calculate overlap
        const overlapStart = moment.max(holidayStart, rangeStart); // Max of start dates
        const overlapEnd = moment.min(holidayEnd, rangeEnd); // Min of end dates

        // Check if there is an overlap
        if (overlapStart.isSameOrBefore(overlapEnd)) {
            const overlapDays = overlapEnd.diff(overlapStart, 'days') + 1; // Calculate days
            return totalDays + overlapDays; // Add to total
        }

        return totalDays; // No overlap, no change
    }, 0); // Initial total = 0
};

module.exports = calculateHolidayDays