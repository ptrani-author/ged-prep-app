// LocalStorage management for GED Study Guide

// Storage keys
const STORAGE_KEYS = {
    ANSWERS: 'ged_answers',
    PROGRESS: 'ged_progress',
    CURRENT_SUBJECT: 'currentSubject',
    CURRENT_QUESTION: 'currentQuestionId'
};

// Initialize storage if it doesn't exist
function initializeStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.ANSWERS)) {
        localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify({}));
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.PROGRESS)) {
        const initialProgress = {
            math: { answered: 0, correct: 0 },
            rla: { answered: 0, correct: 0 },
            science: { answered: 0, correct: 0 },
            social: { answered: 0, correct: 0 }
        };
        localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(initialProgress));
    }
}

// Save answer for a specific question
function saveQuestionAnswer(subject, questionId, selectedAnswer, isCorrect) {
    initializeStorage();
    
    // Get current answers
    const answers = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANSWERS));
    
    // Create subject object if it doesn't exist
    if (!answers[subject]) {
        answers[subject] = {};
    }
    
    // Check if this is a new answer
    const wasAlreadyAnswered = answers[subject][questionId] !== undefined;
    const wasCorrectBefore = wasAlreadyAnswered ? answers[subject][questionId].isCorrect : false;
    
    // Save the answer
    answers[subject][questionId] = {
        selectedAnswer: selectedAnswer,
        isCorrect: isCorrect,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(answers));
    
    // Update progress
    updateProgress(subject, questionId, isCorrect, wasAlreadyAnswered, wasCorrectBefore);
}

// Get answer for a specific question
function getQuestionAnswer(subject, questionId) {
    initializeStorage();
    
    const answers = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANSWERS));
    
    if (answers[subject] && answers[subject][questionId]) {
        return answers[subject][questionId];
    }
    
    return null;
}

// Update progress statistics
function updateProgress(subject, questionId, isCorrect, wasAlreadyAnswered, wasCorrectBefore) {
    const progress = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS));
    
    if (!progress[subject]) {
        progress[subject] = { answered: 0, correct: 0 };
    }
    
    // If this is a new answer (not previously answered)
    if (!wasAlreadyAnswered) {
        progress[subject].answered++;
        if (isCorrect) {
            progress[subject].correct++;
        }
    } else {
        // If answer changed from incorrect to correct
        if (!wasCorrectBefore && isCorrect) {
            progress[subject].correct++;
        }
        // If answer changed from correct to incorrect
        else if (wasCorrectBefore && !isCorrect) {
            progress[subject].correct--;
        }
    }
    
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
}

// Get progress for a specific subject
function getSubjectProgress(subject) {
    initializeStorage();
    
    const progress = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS));
    
    return progress[subject] || { answered: 0, correct: 0 };
}

// Get overall progress across all subjects
function getOverallProgress() {
    initializeStorage();
    
    const progress = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS));
    
    let totalAnswered = 0;
    let totalCorrect = 0;
    
    Object.values(progress).forEach(subjectProgress => {
        totalAnswered += subjectProgress.answered;
        totalCorrect += subjectProgress.correct;
    });
    
    return {
        answered: totalAnswered,
        correct: totalCorrect,
        total: 400, // 100 questions per subject * 4 subjects
        percentage: totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0
    };
}

// Get all answers for a subject
function getSubjectAnswers(subject) {
    initializeStorage();
    
    const answers = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANSWERS));
    
    return answers[subject] || {};
}

// Get questions that were answered incorrectly
function getIncorrectQuestions(subject) {
    const subjectAnswers = getSubjectAnswers(subject);
    const incorrectQuestions = [];
    
    Object.entries(subjectAnswers).forEach(([questionId, answer]) => {
        if (!answer.isCorrect) {
            incorrectQuestions.push(parseInt(questionId));
        }
    });
    
    return incorrectQuestions;
}

// Get questions that were answered correctly
function getCorrectQuestions(subject) {
    const subjectAnswers = getSubjectAnswers(subject);
    const correctQuestions = [];
    
    Object.entries(subjectAnswers).forEach(([questionId, answer]) => {
        if (answer.isCorrect) {
            correctQuestions.push(parseInt(questionId));
        }
    });
    
    return correctQuestions;
}

// Get unanswered questions
function getUnansweredQuestions(subject, totalQuestions = 100) {
    const subjectAnswers = getSubjectAnswers(subject);
    const answeredQuestions = Object.keys(subjectAnswers).map(id => parseInt(id));
    const unansweredQuestions = [];
    
    for (let i = 1; i <= totalQuestions; i++) {
        if (!answeredQuestions.includes(i)) {
            unansweredQuestions.push(i);
        }
    }
    
    return unansweredQuestions;
}

// Reset progress for a specific subject
function resetSubjectProgress(subject) {
    // Reset answers
    const answers = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANSWERS));
    if (answers[subject]) {
        delete answers[subject];
        localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(answers));
    }
    
    // Reset progress
    const progress = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS));
    progress[subject] = { answered: 0, correct: 0 };
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
}

// Reset all progress
function resetAllProgress() {
    localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify({}));
    const initialProgress = {
        math: { answered: 0, correct: 0 },
        rla: { answered: 0, correct: 0 },
        science: { answered: 0, correct: 0 },
        social: { answered: 0, correct: 0 }
    };
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(initialProgress));
}

// Export progress data (for backup)
function exportProgressData() {
    const data = {
        answers: JSON.parse(localStorage.getItem(STORAGE_KEYS.ANSWERS)),
        progress: JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS)),
        exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
}

// Import progress data (from backup)
function importProgressData(jsonData) {
    try {
        const data = JSON.parse(jsonData);
        
        if (data.answers) {
            localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(data.answers));
        }
        
        if (data.progress) {
            localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(data.progress));
        }
        
        return true;
    } catch (error) {
        console.error('Error importing progress data:', error);
        return false;
    }
}

// Initialize storage when script loads
initializeStorage();