const express = require('express');
const {Rate} = require('../../models/models'); // Импорт модели оценки

const router = express.Router();

// Добавить или обновить оценку
router.post('/', async (req, res) => {
    const { rate, user_id, rated_by_user_id } = req.body;

    // Валидация обязательных полей
    if (rate === undefined || !user_id || !rated_by_user_id) {
        return res.status(400).json({ error: 'Все поля обязательны для заполнения.' });
    }

    try {
        // Используем метод findOneAndUpdate для добавления или обновления оценки
        const updatedRate = await Rate.findOneAndUpdate(
            { user_id, rated_by_user_id },
            { rate },
            { new: true, upsert: true } // Обновляем, если находим, или создаем новую запись
        );

        res.status(200).json(updatedRate);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при добавлении или обновлении оценки.' });
    }
});

// Получить оценку
router.get('/', async (req, res) => {
    const { user_id, rated_by_user_id } = req.query;

    if (!user_id || !rated_by_user_id) {
        return res.status(400).json({ error: 'Параметры user_id и rated_by_user_id обязательны.' });
    }

    try {
        const rate = await Rate.findOne({ user_id, rated_by_user_id });

        if (!rate) {
            return res.status(404).json({ message: 'Оценка не найдена.' });
        }

        res.status(200).json(rate.rate);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при получении оценки.' });
    }
});



module.exports = router;
