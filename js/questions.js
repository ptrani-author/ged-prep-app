// Question utilities and helper functions

// Subject configuration
const SUBJECTS = {
    math: {
        name: 'Mathematics',
        icon: '📊',
        color: '#4CAF50'
    },
    rla: {
        name: 'Reasoning Through Language Arts',
        icon: '📚',
        color: '#2196F3'
    },
    science: {
        name: 'Science',
        icon: '🔬',
        color: '#FF9800'
    },
    social: {
        name: 'Social Studies',
        icon: '🌍',
        color: '#9C27B0'
    }
};

// Get subject configuration
function getSubjectConfig(subjectKey) {
    return SUBJECTS[subjectKey] || {
        name: subjectKey,
        icon: '📝',
        color: '#666'
    };
}

// Format question number with leading zeros
function formatQuestionNumber(number, totalQuestions = 100) {
    const digits = totalQuestions.toString().length;
    return number.toString().padStart(digits, '0');
}

// Shuffle array (for randomizing questions if needed)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Get random questions from a subject
function getRandomQuestions(questions, count) {
    const shuffled = shuffleArray(questions);
    return shuffled.slice(0, count);
}

// Filter questions by answered status
function filterQuestionsByStatus(questions, status, subject) {
    switch (status) {
        case 'answered':
            return questions.filter(q => getQuestionAnswer(subject, q.id) !== null);
        case 'unanswered':
            return questions.filter(q => getQuestionAnswer(subject, q.id) === null);
        case 'correct':
            return questions.filter(q => {
                const answer = getQuestionAnswer(subject, q.id);
                return answer && answer.isCorrect;
            });
        case 'incorrect':
            return questions.filter(q => {
                const answer = getQuestionAnswer(subject, q.id);
                return answer && !answer.isCorrect;
            });
        default:
            return questions;
    }
}

// Calculate performance statistics
function calculateStats(subject, questions) {
    const totalQuestions = questions.length;
    const answeredQuestions = questions.filter(q => getQuestionAnswer(subject, q.id) !== null);
    const correctAnswers = questions.filter(q => {
        const answer = getQuestionAnswer(subject, q.id);
        return answer && answer.isCorrect;
    });
    
    const answered = answeredQuestions.length;
    const correct = correctAnswers.length;
    const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    const completion = Math.round((answered / totalQuestions) * 100);
    
    return {
        total: totalQuestions,
        answered,
        correct,
        incorrect: answered - correct,
        unanswered: totalQuestions - answered,
        accuracy,
        completion
    };
}

// Validate question data structure
function validateQuestion(question) {
    const required = ['id', 'question', 'options', 'correctAnswer', 'correctLetter', 'explanation'];
    const missing = required.filter(field => !question.hasOwnProperty(field));
    
    if (missing.length > 0) {
        console.error(`Question ${question.id} is missing: ${missing.join(', ')}`);
        return false;
    }
    
    if (!Array.isArray(question.options) || question.options.length !== 4) {
        console.error(`Question ${question.id} must have exactly 4 options`);
        return false;
    }
    
    if (question.correctAnswer < 0 || question.correctAnswer > 3) {
        console.error(`Question ${question.id} has invalid correctAnswer index`);
        return false;
    }
    
    return true;
}

// Validate entire question set
function validateQuestionSet(questions, subject) {
    console.log(`Validating ${questions.length} questions for ${subject}...`);
    
    let validCount = 0;
    const errors = [];
    
    questions.forEach(question => {
        if (validateQuestion(question)) {
            validCount++;
        } else {
            errors.push(question.id);
        }
    });
    
    console.log(`${validCount}/${questions.length} questions are valid`);
    
    if (errors.length > 0) {
        console.error(`Invalid questions: ${errors.join(', ')}`);
    }
    
    return errors.length === 0;
}

// Search questions by text content
function searchQuestions(questions, searchTerm) {
    const term = searchTerm.toLowerCase();
    
    return questions.filter(question => {
        const questionText = question.question.toLowerCase();
        const optionsText = question.options.join(' ').toLowerCase();
        const explanationText = question.explanation.toLowerCase();
        
        return questionText.includes(term) || 
               optionsText.includes(term) || 
               explanationText.includes(term);
    });
}

// Export functions for use in other modules
window.questionUtils = {
    getSubjectConfig,
    formatQuestionNumber,
    shuffleArray,
    getRandomQuestions,
    filterQuestionsByStatus,
    calculateStats,
    validateQuestion,
    validateQuestionSet,
    searchQuestions
};