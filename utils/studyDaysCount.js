const moment = require('moment')
// Helper function to calculate study days excluding weekends and holidays
function calculateStudyDays(startDate, endDate, totalHolidayDays) {
    let currentDate = moment(startDate);
    // console.log(currentDate)
    const endDateMoment = moment(endDate);
    // console.log(endDate)
    let totalDaysCount = 0;

    // Loop through each day in the date range
    while (currentDate <= endDateMoment) {
        // Check if it's not a weekend (Saturday or Sunday)
        const isWeekend = currentDate.day() === 0;
        // console.log(isWeekend)
        if (!isWeekend) {
            totalDaysCount++;
        }

        currentDate.add(1, 'days');
    }

    // Subtract the total holidays from the total days to get study days
    const studyDaysCount = totalDaysCount - totalHolidayDays;
    // console.log(studyDaysCount)

    return studyDaysCount;
}

module.exports = calculateStudyDays