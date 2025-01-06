const moment = require('moment')
// Helper function to calculate study days excluding weekends and holidays
// function calculateStudyDays(startDate, endDate, totalHolidayDays) {
//     let currentDate = moment(startDate);
//     // console.log(currentDate)
//     const endDateMoment = moment(endDate);
//     // console.log(endDate)
//     let totalDaysCount = 0;

//     // Loop through each day in the date range
//     while (currentDate <= endDateMoment) {
//         // Check if it's not a weekend (Saturday or Sunday)
//         const isWeekend = currentDate.day() === 0;
//         // console.log(isWeekend)
//         if (!isWeekend) {
//             totalDaysCount++;
//         }

//         currentDate.add(1, 'days');
//     }

//     // Subtract the total holidays from the total days to get study days
//     const studyDaysCount = totalDaysCount - totalHolidayDays;
//     // console.log(studyDaysCount)

//     return studyDaysCount;
// }

// Helper function to calculate study days excluding weekends and holidays
function calculateStudyDays(startDate, endDate, holidayDates) {
    let currentDate = moment(startDate);
    const endDateMoment = moment(endDate);

    let totalDaysCount = 0;

    // Convert holidayDates to a Set for faster lookups
    const holidaySet = new Set(holidayDates);

    // Loop through each day in the date range
    while (currentDate.isSameOrBefore(endDateMoment)) {
        const isWeekend = currentDate.day() === 0 ; // Sunday = 0
        const isHoliday = holidaySet.has(currentDate.format('YYYY-MM-DD'));

        // If it's not a weekend or a holiday, count it as a study day
        if (!isWeekend && !isHoliday) {
            totalDaysCount++;
        }

        currentDate.add(1, 'days');
    }

    return totalDaysCount;
}

module.exports = calculateStudyDays