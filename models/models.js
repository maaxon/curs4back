const mongoose = require('mongoose');

// Модель пользователя
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'employer'], required: true }
});

const User = mongoose.model('User', userSchema);

    // Модель оценки
const rateSchema = new mongoose.Schema({
    rate: { type: Number, min: 1, max: 5 },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rated_by_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Rate = mongoose.model('Rate', rateSchema);

// Модель вакансии
const vacancySchema = new mongoose.Schema({
    title: { type: String, required: true },
    company_name: { type: String, required: true },
    short_description: { type: String, required: true },
    description: { type: String, required: true },
    salary: { type: Number, required: true },
    location: { type: String, required: true },
    job_type: { type: String, enum: ['Full time', 'Part time', 'Internship', 'Freelance', 'Remote'], required: true },
    degree: { type: String, enum: ['Postdoc', 'Ph.D.', 'Master', 'Bachelor'] },
    working_hours: { type: Number, required: true },
    experience: { type: Number, required: true },
    status: { type: String, default: 'Under review', enum: ['Under review', 'Published', 'Blocked'], required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tags: {
        type: [String],
        default: []
    }
});

const Vacancy = mongoose.model('Vacancy', vacancySchema);

// Модель резюме
const resumeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    salary: { type: Number },
    location: { type: String },
    status: { type: String, default: 'Under review', enum: ['Under review', 'Blocked', 'Published'], required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Resume = mongoose.model('Resume', resumeSchema);

// Модель образования
const educationSchema = new mongoose.Schema({
    school: { type: String, required: true },
    description: { type: String },
    resume_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
    from_date: { type: Date, default: Date.now, required: true },
    to_date: { type: Date, required: true },
    degree: { type: String, required: true },
    major: { type: String, required: true }
});

const Education = mongoose.model('Education', educationSchema);

// Модель опыта
const experienceSchema = new mongoose.Schema({
    company_name: { type: String, required: true },
    position: { type: String, required: true },
    description: { type: String },
    resume_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
    from_date: { type: String, required: true },
    to_date: { type: String, required: true }
});

const Experience = mongoose.model('Experience', experienceSchema);

// Модель навыков
const skillSchema = new mongoose.Schema({
    name: { type: String, required: true },
    proficiency_level: { type: Number, min: 0, max: 100, required: true },
    resume_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true }
});

const Skill = mongoose.model('Skill', skillSchema);

// Модель ответов
const responseSchema = new mongoose.Schema({
    rate: { type: Number, min: 1, max: 5 },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vacancy_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vacancy', required: true },
    resume_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
    status: { type: String, default: 'Pending invite', enum: ['Pending invite', 'Accepted', 'Rejected'], required: true }
});

const Response = mongoose.model('Response', responseSchema);

// Экспорт моделей
module.exports = {
    User,
    Rate,
    Vacancy,
    Resume,
    Education,
    Experience,
    Skill,
    Response
};
