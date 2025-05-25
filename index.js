const mongoose = require('mongoose');
const {pass,user,url} = require('./config/config');
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoutes = require('./routes/users/users');
const vacanciesRoutes = require('./routes/vacancy/vacancy');
const adminVacancyRoutes = require('./routes/admin/vacancy/vacancy');
const resumeRoutes = require('./routes/resume/resume');
const adminResumeRoutes = require('./routes/admin/resume/resume');
const rateRoutes = require('./routes/rates/rates')
const responseRouter = require('./routes/responses/reponses');
const educationRouter = require('./routes/education/education');
const experienceRouter = require('./routes/experience/experience');
const skillRouter = require('./routes/skill/skill');

const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/users', userRoutes);
app.use('/vacancies', vacanciesRoutes)
app.use('/admin/vacancies',adminVacancyRoutes)
app.use('/resume',resumeRoutes)
app.use('/admin/resume',adminResumeRoutes)
app.use('/rate',rateRoutes)
app.use('/response',responseRouter);
app.use('/education',educationRouter)
app.use('/experience',experienceRouter)
app.use('/skill',skillRouter)

async function main() {

    try{
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            retryWrites: true,
            authSource: 'admin'
        })
        app.listen(port);
        console.log("Сервер ожидает подключения...");
    }
    catch(err) {
        return console.log(err);
    }
}

main();


