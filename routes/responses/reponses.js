const express = require('express');
const mongoose = require('mongoose');
const {Response, User} = require('../../models/models'); // Убедитесь, что путь правильный
const emailjs = require('@emailjs/nodejs')
const router = express.Router();

// Эндпоинт для создания отклика
router.post('/', async (req, res) => {
    const {user_id, employer_id, vacancy_id, resume_id} = req.body;

    try {
        const newResponse = new Response({user_id, employer_id, vacancy_id, resume_id});
        await newResponse.save();
        const user = await User.findById(employer_id)

        emailjs.send('service_tvk0sin', 'template_e41uzjd', {user_email:user.email,user_name:user.name,message:'You got a new response'}, {
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

        res.status(201).json(newResponse);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка при создании отклика: ' + error.message);
    }
});

// Эндпоинт для принятия отклика
router.put('/accept/:id', async (req, res) => {
    const responseId = req.params.id;


    if (!mongoose.isValidObjectId(responseId)) {
        return res.status(400).send('Неверный формат идентификатора отклика.');
    }

    try {
        const updatedResponse = await Response.findByIdAndUpdate(
            responseId,
            {status: 'Accepted'},
            {new: true} // Возвращаем обновленный документ
        ).populate('user_id');

        if (!updatedResponse) {
            return res.status(404).send('Отклик не найден.');
        }
        const user = updatedResponse.user_id;
        emailjs.send('service_tvk0sin', 'template_e41uzjd', {user_email:user.email,user_name:user.name,message:"You have got answer on your response"}, {
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


        res.status(200).json(updatedResponse);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка при изменении статуса отклика: ' + error.message);
    }
});

// Эндпоинт для отклонения отклика
router.put('/reject/:id', async (req, res) => {
    const responseId = req.params.id;

    if (!mongoose.isValidObjectId(responseId)) {
        return res.status(400).send('Неверный формат идентификатора отклика.');
    }

    try {
        const updatedResponse = await Response.findByIdAndUpdate(
            responseId,
            {status: 'Rejected'},
            {new: true} // Возвращаем обновленный документ
        ).populate('user_id');

        if (!updatedResponse) {
            return res.status(404).send('Отклик не найден.');
        }

        const user = updatedResponse.user_id;
        emailjs.send('service_tvk0sin', 'template_e41uzjd', {user_email:user.email,user_name:user.name,message:"You have got answer on your response"}, {
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

        res.status(200).json(updatedResponse);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка при изменении статуса отклика: ' + error.message);
    }
});

// Эндпоинт для получения откликов пользователя
// Эндпоинт для получения откликов пользователя
router.get('/user/:user_id', async (req, res) => {
    const userId = req.params.user_id;

    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).send('Неверный формат user_id.');
    }

    try {
        const responses = await Response.find({user_id: userId})
            .populate('vacancy_id') // Подгружаем данные о вакансии
            .populate('employer_id')
            .populate('resume_id');

        const formattedResponses = responses.map(response => ({
            id: response._id,
            user_id: response.user_id,
            user_name: response.employer_id.name, // Предполагаем, что у пользователя есть поле name
            employer_id: response.employer_id,
            vacancy_id: response.vacancy_id._id,
            vacancy_title: response.vacancy_id.title, // Предполагаем, что у вакансии есть поле title
            status: response.status,
            resume_id: response.resume_id?.id,
            resume_title: response.resume_id?.title,
        }));

        res.status(200).json(formattedResponses);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка при получении откликов: ' + error.message);
    }
});

// Эндпоинт для получения откликов работодателя
router.get('/employer/:employer_id', async (req, res) => {
    const employerId = req.params.employer_id;

    if (!mongoose.isValidObjectId(employerId)) {
        return res.status(400).send('Неверный формат employer_id.');
    }

    try {
        const responses = await Response.find({employer_id: employerId, status: "Pending invite"})
            .populate('vacancy_id') // Подгружаем данные о вакансии
            .populate('user_id') // Подгружаем данные о пользователе
            .populate('resume_id'); // Подгружаем данные о пользователе

        const formattedResponses = responses.map(response => ({
            id: response._id,
            user_id: response.user_id,
            user_name: response.user_id.name, // Предполагаем, что у пользователя есть поле name
            employer_id: response.employer_id,
            vacancy_id: response.vacancy_id._id,
            vacancy_title: response.vacancy_id.title, // Предполагаем, что у вакансии есть поле title
            status: response.status,
            resume_id: response.resume_id?.id,
            resume_title: response.resume_id?.title,
        }));

        res.status(200).json(formattedResponses);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка при получении откликов: ' + error.message);
    }
});

module.exports = router;
