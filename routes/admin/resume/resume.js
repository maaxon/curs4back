const express = require('express');
const {Resume} = require('../../../models/models');
const emailjs = require("@emailjs/nodejs"); // Убедитесь, что путь правильный

const router = express.Router();

// Эндпоинт для получения всех резюме
router.get('/', async (req, res) => {
    try {
        const resumes = await Resume.find({ status: 'Under review' }).populate('user_id', 'name email'); // Подгружаем данные о пользователе
        const formattedResumes = resumes.map(row => ({
            id: row._id,
            title: row.title,
            description: row.description,
            salary: row.salary,
            location: row.location,
            user: {
                id: row.user_id._id,
                email: row.user_id.email,
                name: row.user_id.name
            }
        }));

        res.json(formattedResumes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Эндпоинт для публикации резюме
router.post('/publish/:id', async (req, res) => {
    const resumeId = req.params.id;

    try {
        const updatedResume = await Resume.findByIdAndUpdate(
            resumeId,
            { status: 'Published' },
            { new: true } // Возвращаем обновленный документ
        ).populate('user_id');
        console.log(updatedResume);
        if (!updatedResume) {
            return res.status(404).send(`Резюме с ID ${resumeId} не найдено.`);
        }

        const user = updatedResume.user_id;
        emailjs.send('service_tvk0sin', 'template_exj0jo7', {user_email:user.email,user_name:user.name,message:"Your resume has been published"}, {
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

        res.status(200).send(`Резюме с ID ${resumeId} опубликовано.`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка при публикации резюме: ' + error.message);
    }
});

// Эндпоинт для блокировки резюме
router.post('/block/:id', async (req, res) => {
    const resumeId = req.params.id;

    try {
        const updatedResume = await Resume.findByIdAndUpdate(
            resumeId,
            { status: 'Blocked' },
            { new: true } // Возвращаем обновленный документ
        ).populate('user_id');

        if (!updatedResume) {
            return res.status(404).send(`Резюме с ID ${resumeId} не найдено.`);
        }

        const user = updatedResume.user_id;
        emailjs.send('service_tvk0sin', 'template_exj0jo7', {user_email:user.email,user_name:user.name,message:"Your resume has been blocked, please edit it"}, {
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

        res.status(200).send(`Резюме с ID ${resumeId} заблокировано.`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка при блокировке резюме: ' + error.message);
    }
});

module.exports = router;
