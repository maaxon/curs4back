const {Vacancy} = require("../../../models/models");
const express = require('express');
const emailjs = require("@emailjs/nodejs");
const router = express.Router();


router.post('/publish/:id', async (req, res) => {
    const vacancyId = req.params.id;

    try {
        const publishedVacancy = await Vacancy.findByIdAndUpdate(
            vacancyId,
            {status: 'Published'},
            {new: true}
        ).populate('user_id');

        if (!publishedVacancy) {
            return res.status(404).json({error: 'Вакансия не найдена.'});
        }

        const user = updatedResponse.user_id;
        emailjs.send('service_tvk0sin', 'template_exj0jo7', {user_email:user.email,user_name:user.name,message:"Your vacancy has been published"}, {
            publicKey: 'v3179Takr1EXEB0ig',
            privateKey: 'IfkjeB75sd7pShw8TODYO', // optional, highly recommended for security reasons
        })
            .then(
                (response) => {
                    console.log('SUCCESS!', response.status, response.text);
                },
                (err) => {
                    console.log('FAILED...', err);
                },
            );

        res.json(publishedVacancy);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Ошибка при обновлении статуса вакансии.'});
    }
});

// Заблокировать вакансию
router.post('/block/:id', async (req, res) => {
    const vacancyId = req.params.id;

    try {
        const blockedVacancy = await Vacancy.findByIdAndUpdate(
            vacancyId,
            {status: 'Blocked'},
            {new: true}
        ).populate('user_id');

        if (!blockedVacancy) {
            return res.status(404).json({error: 'Вакансия не найдена.'});
        }

        const user = blockedVacancy.user_id;
        emailjs.send('service_tvk0sin', 'template_exj0jo7', {user_email:user.email,user_name:user.name,message:"Your vacancy has been blocked, please edit it"}, {
            publicKey: 'v3179Takr1EXEB0ig',
            privateKey: 'IfkjeB75sd7pShw8TODYO', // optional, highly recommended for security reasons
        })
            .then(
                (response) => {
                    console.log('SUCCESS!', response.status, response.text);
                },
                (err) => {
                    console.log('FAILED...', err);
                },
            );

        res.json(blockedVacancy);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Ошибка при блокировке вакансии.'});
    }
});

// Получить все вакансии со статусом "Under review"
router.get('/', async (req, res) => {
    try {
        const vacancies = await Vacancy.find({ status: 'Under review' });

        const vacancyList = vacancies.map(vacancy => ({
            id: vacancy._id, // Заменяем _id на id
            title: vacancy.title,
            company_name: vacancy.company_name,
            short_description: vacancy.short_description,
            description: vacancy.description,
            salary: vacancy.salary,
            location: vacancy.location,
            job_type: vacancy.job_type,
            degree: vacancy.degree,
            working_hours: vacancy.working_hours,
            experience: vacancy.experience,
            status: vacancy.status,
            user_id: vacancy.user_id
        }));

        res.json(vacancyList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при получении вакансий.' });
    }
});

module.exports = router;
