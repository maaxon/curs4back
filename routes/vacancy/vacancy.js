// routes/vacancies.js
const express = require('express');
const {Vacancy, Rate} = require('../../models/models'); // Импорт модели вакансии

const router = express.Router();

// Добавить вакансию
router.post('/', async (req, res) => {
    const {
        title,
        company_name,
        short_description,
        description,
        salary,
        location,
        job_type,
        degree,
        working_hours,
        user_id,
        experience,
        tags
    } = req.body;

    // Валидация обязательных полей
    if (!title || !company_name || !short_description || !description || !salary || !location || !job_type || !degree || !working_hours || !user_id || !experience) {
        return res.status(400).json({error: 'Все поля обязательны для заполнения.'});
    }

    try {
        const newVacancy = new Vacancy({
            title,
            company_name,
            short_description,
            description,
            salary,
            location,
            job_type,
            degree,
            working_hours,
            user_id,
            experience,
            tags
        });

        const savedVacancy = await newVacancy.save();
        res.status(201).json(savedVacancy);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Ошибка при добавлении вакансии.'});
    }
});

// Обновить вакансию
router.put('/:id', async (req, res) => {
    const vacancyId = req.params.id;
    const {
        title,
        company_name,
        short_description,
        description,
        salary,
        location,
        job_type,
        degree,
        working_hours,
        user_id,
        experience,
        tags
    } = req.body;

    try {
        const updatedVacancy = await Vacancy.findByIdAndUpdate(
            vacancyId,
            {
                title,
                company_name,
                short_description,
                description,
                salary,
                location,
                job_type,
                degree,
                working_hours,
                user_id,
                tags,
                experience,
                status: 'Under review' // Обновляем статус
            },
            {new: true}
        );

        if (!updatedVacancy) {
            return res.status(404).json({error: 'Вакансия не найдена.'});
        }

        res.json(updatedVacancy);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Ошибка при обновлении вакансии.'});
    }
});

// Получить все опубликованные вакансии
router.get('/', async (req, res) => {
    try {
        const vacancies = await Vacancy.find({status: 'Published'});
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
            user_id: vacancy.user_id,
            tags: vacancy.tags
        }));

        res.json(vacancyList);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Ошибка при получении вакансий.'});
    }
});

// Получить вакансию по ID
router.get('/:id', async (req, res) => {
    const vacancyId = req.params.id;

    try {
        const vacancy = await Vacancy.findById(vacancyId);
        if (!vacancy) {
            return res.status(404).json({error: 'Вакансия не найдена.'});
        }

        const result = await Rate.aggregate([
            {$match: {user_id: vacancy.user_id}},
            {$group: {_id: null, averageRate: {$avg: '$rate'}}}
        ]);

        const averageRate = result.length === 0 ? 0 : result[0].averageRate;


        const vacancyObject = {
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
            user_id: vacancy.user_id,
            rating: averageRate,
            tags: vacancy.tags
        };

        res.json(vacancyObject);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Ошибка при получении вакансии.'});
    }
});

// Удалить вакансию
router.delete('/:id', async (req, res) => {
    const vacancyId = req.params.id;

    try {
        const deletedVacancy = await Vacancy.findByIdAndDelete(vacancyId);
        if (!deletedVacancy) {
            return res.status(404).json({error: 'Вакансия не найдена.'});
        }
        res.status(200).json({message: 'Вакансия удалена успешно.'});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Ошибка при удалении вакансии.'});
    }
});

// Получить вакансии пользователя
router.get('/user/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const vacancies = await Vacancy.find({user_id: userId});
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
        res.status(500).json({error: 'Ошибка при получении вакансий для пользователя.'});
    }
});


module.exports = router;
