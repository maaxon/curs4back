const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const {User} = require('../../models/models');


router.post('/register', async (req, res) => {
    const { email, password, name, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ email, password: hashedPassword, name, role });
        await newUser.save();

        res.status(201).json({ message: 'Пользователь зарегистрирован' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка регистрации пользователя: ' + error.message });
    }
});

// Эндпоинт для авторизации пользователя
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Неверный email или пароль' });
        }

        // Сравнение паролей
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Неверный email или пароль' });
        }

        res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка авторизации: ' + error.message });
    }
});

// Эндпоинт для смены имени пользователя
router.put('/change-name/:id', async (req, res) => {
    const userId = req.params.id;
    const { name } = req.body;

    try {
        const user = await User.findByIdAndUpdate(userId, { name }, { new: true });
        if (!user) {
            return res.status(404).send('Пользователь не найден');
        }
        res.status(200).send('Имя пользователя успешно изменено');
    } catch (err) {
        console.error('Error changing user name:', err);
        res.status(500).send('Ошибка изменения имени пользователя');
    }
});

// Эндпоинт для смены пароля пользователя
router.put('/change-password/:id', async (req, res) => {
    const userId = req.params.id;
    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = await User.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true });
        if (!user) {
            return res.status(404).send('Пользователь не найден');
        }
        res.status(200).send('Пароль пользователя успешно изменен');
    } catch (err) {
        console.error('Error changing user password:', err);
        res.status(500).send('Ошибка изменения пароля пользователя');
    }
});

// Эндпоинт для удаления пользователя
router.delete('/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).send('Пользователь не найден');
        }
        res.status(200).send('Пользователь успешно удален');
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).send('Ошибка удаления пользователя');
    }
});

module.exports = router;
