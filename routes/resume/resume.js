const express = require('express');
const {Resume, Education, Experience, Skill} = require('../../models/models');
const {startSession} = require("mongoose");

const router = express.Router();

// Эндпоинт для получения всех резюме
router.get('/', async (req, res) => {
    try {
        const resumes = await Resume.find().populate('user_id', 'name email');// Заполнение информации о пользователе
        res.json(resumes.map(resume => ({id: resume._id, user: resume.user_id, ...resume._doc})));
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Эндпоинт для получения резюме пользователя
router.get('/user/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const resumes = await Resume.find({user_id: userId}).populate('user_id', 'name email');
        res.json(resumes.map(resume => ({id: resume._id, user: resume.user_id, ...resume._doc})));
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

router.post('/', async (req, res) => {
    try {
        const {
            title,
            description,
            salary,
            location,
            userId,
            educations,
            experience,
            skills,
            image
        } = req.body
        console.log(userId)
        const newResume = new Resume({
            title,
            description,
            salary,
            location,
            user_id: userId,
            image
        })

        const savedResume = await newResume.save();

        const resumeId = savedResume._id;

        const nd = educations.map(education => ({
            resume_id: resumeId,
            from_date: education.from_date,
            to_date: education.from_date,
            degree: education.degree,
            major: education.major,
            school: education.school,
            description: education.description,
        }))


        const newEducations = await Education.insertMany(nd)

        const newExperience = await Experience.insertMany(experience.map(exp => ({
                company_name: exp.company,
                resume_id: resumeId,
                from_date: exp.from_date,
                to_date: exp.from_date,
                position: exp.position,
                description: exp.description
            }))
        )
        const newSkills = await Skill.insertMany(skills.map(skill => ({
            name: skill.name,
            proficiency_level: skill.proficiencyLevel,
            resume_id: resumeId
        })))
        res.status(201).send();
    } catch (err) {
        res.status(500).json({error: err});
    }
});

router.get('/:id', async (req, res) => {
    const resumeId = req.params.id;

    try {
        // Ищем резюме по ID
        const resume = await Resume.findById(resumeId).populate('user_id', 'name email'); // Заполнение информации о пользователе
        console.log(resume)
        if (!resume) {
            return res.status(404).json({error: 'Resume not found'});
        }

        const educations = await Education.find({resume_id: resumeId})
        const experience = await Experience.find({resume_id: resumeId})
        const skills = await Skill.find({resume_id: resumeId})

        const result = {
            id: resumeId,
            user: resume.user_id,
            ...resume._doc,
            education: educations.map(education => ({id: education._id, ...education._doc})),
            experience: experience.map(experience => ({...experience._doc, company:experience.company_name,id: experience._id})),
            skills: skills.map(skill => ({id: skill._id, ...skill._doc, proficiencyLevel: skill.proficiency_level}))
        }

        res.json(result);
    } catch (error) {
        console.error('Error retrieving resume:', error);
        res.status(500).json({error: 'Error retrieving resume'});
    }
});

router.delete('/:id', async (req, res) => {
    const resumeId = req.params.id;
    try {
        const result = await Resume.findByIdAndDelete(resumeId);
        if (!result) {
            throw new Error('Resume not found');
        }
        await Education.deleteMany({resume_id: resumeId});
        await Experience.deleteMany({resume_id: resumeId});
        await Skill.deleteMany({resume_id: resumeId});
        res.status(204).send()
    } catch (error) {
        console.error('Error deleting resume:', error);
        res.status(500).json({error: 'Error deleting resume'});
    }
})

router.put('/:id', async (req, res) => {
    const resumeId = req.params.id;
    const {title, description, salary, location, educations, experience, skills,image} = req.body;

    try {
        // Обновление основного резюме
        const updatedResume = await Resume.findByIdAndUpdate(
            resumeId,
            {title, description, salary, location, image, status: 'Under review'},
            {new: true} // Возвращаем обновленный документ
        );

        if (!updatedResume) {
            return res.status(404).json({error: 'Resume not found'});
        }

        // Обновление или добавление образований
        for (const {id, school, description, from_date, to_date, degree, major} of educations) {
            try {
                const updateData = {
                    school,
                    description,
                    from_date,
                    to_date,
                    degree,
                    major,
                    resume_id: resumeId,
                };

                const result = await Education.findOneAndUpdate(
                    id ? { _id: id, resume_id: resumeId } : {
                        // Unique combination for new records
                        school,
                        degree,
                        major,
                        resume_id: resumeId,
                        from_date
                    },
                    updateData,
                    {
                        new: true,         // Return the modified document
                        upsert: true,      // Create if doesn't exist
                        setDefaultsOnInsert: true,
                        runValidators: true // Ensure validations run
                    }
                );
                console.log('Education record processed:', result);
            } catch (error) {
                console.error('Error processing education record:', error);
            }
        }
        // Update or add experience
        for (const { id, company, position, description, from_date, to_date } of experience) {
            try {
                const updateData = {
                    company_name: company,
                    description,
                    from_date,
                    to_date,
                    position,
                    resume_id: resumeId,
                };

                const result = await Experience.findOneAndUpdate(
                    id ? { _id: id, resume_id: resumeId } : {
                        // Unique combination for new records
                        company_name: company,
                        position,
                        resume_id: resumeId,
                        from_date,
                        to_date
                    },
                    updateData,
                    {
                        new: true,         // Return the modified document
                        upsert: true,      // Create if doesn't exist
                        setDefaultsOnInsert: true,
                        runValidators: true // Ensure validations run
                    }
                );

                console.log('Experience record processed:', result);
            } catch (error) {
                console.error('Error processing experience record:', error);
                // Consider adding error to an array to report all failures at end
            }
        }

// Update or add skills
        for (const {id, name, proficiencyLevel} of skills) {
            try {
                const updateData = {
                    proficiency_level: proficiencyLevel,
                    name,
                    resume_id: resumeId,
                };

                const result = await Skill.findOneAndUpdate(
                    id ? { _id: id, resume_id: resumeId } : {
                        // Unique combination for new skills
                        name,
                        resume_id: resumeId
                    },
                    updateData,
                    {
                        new: true,
                        upsert: true,
                        setDefaultsOnInsert: true,
                        runValidators: true
                    }
                );
                console.log('Skill record processed:', result);
            } catch (error) {
                console.error('Error processing skill record:', error);
            }
        }
        res.status(200).json({message: 'Resume updated successfully', updatedResume});
    } catch (err) {
        console.error('Error updating resume:', err);
        res.status(500).json({error: 'Error updating resume'});
    }
});
module.exports = router;
