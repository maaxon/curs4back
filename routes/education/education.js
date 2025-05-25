const {Vacancy, Education} = require("../../models/models");
const express = require("express");

const router = express.Router();

router.delete('/:id', async (req, res) => {
    const educationId = req.params.id;

    try {
        const deletedVacancy = await Education.findByIdAndDelete(educationId);
        if (!deletedVacancy) {
            return res.status(404).json({error: 'Вакансия не найдена.'});
        }
        res.status(200).json({message: 'Вакансия удалена успешно.'});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Ошибка при удалении вакансии.'});
    }
});

router.get('/', async (req, res) => {
    try {
        const educations = await Education.find();


        res.json(educations);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Ошибка при получении вакансий.'});
    }
});


module.exports = router;
