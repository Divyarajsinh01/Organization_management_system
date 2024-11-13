const express = require('express')
const cors = require('cors')
const db = require('../models/index')
const app = express()
// const setAssociations = require('../models/index')

app.use(express.json())
app.use(cors())

// setAssociations()

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get("/health", async (req, res) => {
    try {
        await db.sequelize.authenticate();
        console.log("Connection has been established successfully.");
        // console.log("All models synchronized successfully.");
        res.status(200).json({
            status: {
                message: "Connection has been established successfully.",
                code: 200,
                error: false,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: {
                message: `${error}`,
                code: 400,
                error: true,
            },
        });
    }
});

const roleRouter = require('../routers/roles.router')
app.use('/api/v1', roleRouter)

const authRouter = require('../routers/auth.router')
app.use('/api/v1', authRouter)

const superAdminRouter = require('../routers/superAdmin.router')
app.use('/api/v1', superAdminRouter)

const organizationRouter = require('../routers/organization.router')
app.use('/api/v1', organizationRouter)

const managerRouter = require('../routers/manager.router')
app.use('/api/v1', managerRouter)

const subjectRouter = require('../routers/subject.router')
app.use('/api/v1', subjectRouter)

const standardRouter = require('../routers/standard.router')
app.use('/api/v1', standardRouter)

const batchRouter = require('../routers/batches.router')
app.use('/api/v1', batchRouter)

const standardFeesRouter = require('../routers/standardFees.router')
app.use('/api/v1', standardFeesRouter)

const testRouter = require('../routers/testSchedule.router')
app.use('/api/v1', testRouter)

const teacherRouter = require('../routers/teachers.router')
app.use('/api/v1', teacherRouter)

const lectureRouter = require('../routers/lectures.router')
app.use('/api/v1', lectureRouter)

const errorMiddleware = require('../middlewares/error')
app.use(errorMiddleware)

module.exports = app