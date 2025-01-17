const calculateOverAllPercentage = (results) => {
    let totalOverAllMarks = 0;
    let totalOverAllObtainMarks = 0;

    results.forEach(result => {
        result.studentResults.forEach(marks => {
            totalOverAllMarks += marks.test.marks;
            totalOverAllObtainMarks += marks.obtained_marks;
        })
    })

    const overAllPercentage = totalOverAllMarks > 0 ? ((totalOverAllObtainMarks / totalOverAllMarks) * 100) : 0
    return overAllPercentage.toFixed(2)
}

module.exports = calculateOverAllPercentage