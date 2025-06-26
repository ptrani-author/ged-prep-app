// Main application logic

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        initHomepage();
    } else if (window.location.pathname.includes('quiz.html')) {
        initQuiz();
    }
});

// Homepage initialization
function initHomepage() {
    updateProgressDisplay();
}

// Update progress bars on homepage
function updateProgressDisplay() {
    const subjects = ['math', 'rla', 'science', 'social'];
    
    subjects.forEach(subject => {
        const progress = getSubjectProgress(subject);
        const progressBar = document.getElementById(`${subject}-progress`);
        const progressText = document.getElementById(`${subject}-text`);
        
        if (progressBar && progressText) {
            const percentage = (progress.answered / 100) * 100;
            progressBar.style.width = `${percentage}%`;
            progressText.textContent = `${progress.answered}/100`;
        }
    });
}

// Start quiz for selected subject
function startQuiz(subject) {
    // Save selected subject to localStorage
    localStorage.setItem('currentSubject', subject);
    localStorage.setItem('currentQuestionId', '1');
    
    // Navigate to quiz page
    window.location.href = `quiz.html?subject=${subject}`;
}

// Quiz page initialization
function initQuiz() {
    const urlParams = new URLSearchParams(window.location.search);
    const subject = urlParams.get('subject') || localStorage.getItem('currentSubject');
    
    if (!subject) {
        window.location.href = 'index.html';
        return;
    }
    
    loadQuizData(subject);
}

// Load quiz data for subject
async function loadQuizData(subject) {
    try {
        const response = await fetch(`data/${subject}.json`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Could not load ${subject}.json`);
        }
        
        const questions = await response.json();
        
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error(`No questions found in ${subject}.json`);
        }
        
        // Validate first question structure
        if (!questions[0].id || !questions[0].question) {
            throw new Error(`Invalid question structure in ${subject}.json`);
        }
        
        // Store questions in memory
        window.currentQuestions = questions;
        window.currentSubject = subject;
        
        // Get current question ID from localStorage or start at 1
        const currentQuestionId = parseInt(localStorage.getItem('currentQuestionId')) || 1;
        
        // Initialize quiz interface
        setupQuizInterface(subject, questions, currentQuestionId);
        
    } catch (error) {
        console.error('Error loading quiz data:', error);
        alert(`Error loading quiz data: ${error.message}`);
        // Redirect back to home if there's an error
        setTimeout(() => window.location.href = 'index.html', 2000);
    }
}

// Setup quiz interface
function setupQuizInterface(subject, questions, currentQuestionId) {
    // Update page title and subject display
    document.title = `${subject.toUpperCase()} - GED Study Guide`;
    
    // Render question map
    renderQuestionMap(questions.length, currentQuestionId);
    
    // Load current question
    loadQuestion(currentQuestionId);
}

// Render question navigation map
function renderQuestionMap(totalQuestions, currentId) {
    const mapContainer = document.querySelector('.map-grid');
    if (!mapContainer) return;
    
    mapContainer.innerHTML = '';
    
    for (let i = 1; i <= totalQuestions; i++) {
        const mapItem = document.createElement('div');
        mapItem.className = 'map-item';
        mapItem.textContent = i;
        mapItem.onclick = () => navigateToQuestion(i);
        
        // Apply status classes
        if (i === currentId) {
            mapItem.classList.add('current');
        }
        
        const answer = getQuestionAnswer(window.currentSubject, i);
        if (answer !== null) {
            if (answer.isCorrect) {
                mapItem.classList.add('correct');
            } else {
                mapItem.classList.add('incorrect');
            }
        }
        
        mapContainer.appendChild(mapItem);
    }
}

// Load specific question
function loadQuestion(questionId) {
    const question = window.currentQuestions.find(q => q.id === questionId);
    if (!question) return;
    
    // Update question counter
    const counter = document.querySelector('.question-counter');
    if (counter) {
        counter.textContent = `Question ${questionId} of ${window.currentQuestions.length}`;
    }
    
    // Update subject title
    const subjectTitle = document.querySelector('.subject-title');
    if (subjectTitle) {
        subjectTitle.textContent = window.currentSubject.toUpperCase();
    }
    
    // Render passage if exists
    renderPassage(question.passage);
    
    // Render question
    renderQuestion(question);
    
    // Update localStorage
    localStorage.setItem('currentQuestionId', questionId.toString());
    
    // Update question map
    renderQuestionMap(window.currentQuestions.length, questionId);
}

// Render passage section
function renderPassage(passage) {
    const passageSection = document.querySelector('.passage-section');
    if (!passageSection) return;
    
    if (passage && passage.content) {
        passageSection.style.display = 'block';
        const passageContent = document.querySelector('.passage-content');
        if (passageContent) {
            // Clear previous content
            passageContent.innerHTML = '';
            
            // Add text content
            const textDiv = document.createElement('div');
            textDiv.innerHTML = passage.content.replace(/\n/g, '<br>');
            passageContent.appendChild(textDiv);
            
            // Add table if present
            if (passage.hasTable && passage.table) {
                const tableDiv = document.createElement('div');
                tableDiv.style.marginTop = '1rem';
                
                const table = document.createElement('table');
                table.style.cssText = 'width: 100%; border-collapse: collapse; margin: 1rem 0;';
                
                // Add headers
                if (passage.table.headers) {
                    const thead = document.createElement('thead');
                    const headerRow = document.createElement('tr');
                    passage.table.headers.forEach(header => {
                        const th = document.createElement('th');
                        th.textContent = header;
                        th.style.cssText = 'border: 1px solid #ddd; padding: 8px; background: #f5f5f5; font-weight: bold;';
                        headerRow.appendChild(th);
                    });
                    thead.appendChild(headerRow);
                    table.appendChild(thead);
                }
                
                // Add rows
                if (passage.table.rows) {
                    const tbody = document.createElement('tbody');
                    passage.table.rows.forEach(row => {
                        const tr = document.createElement('tr');
                        row.forEach(cell => {
                            const td = document.createElement('td');
                            td.textContent = cell;
                            td.style.cssText = 'border: 1px solid #ddd; padding: 8px;';
                            tr.appendChild(td);
                        });
                        tbody.appendChild(tr);
                    });
                    table.appendChild(tbody);
                }
                
                tableDiv.appendChild(table);
                passageContent.appendChild(tableDiv);
            }
        }
    } else {
        passageSection.style.display = 'none';
    }
}

// Render question and options
function renderQuestion(question) {
    // Update question text
    const questionText = document.querySelector('.question-text');
    if (questionText) {
        questionText.textContent = question.question;
    }
    
    // Render options
    const optionsList = document.querySelector('.options-list');
    if (!optionsList) return;
    
    optionsList.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const li = document.createElement('li');
        li.className = 'option-item';
        
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
        button.onclick = () => selectAnswer(question.id, index, question.correctAnswer);
        
        li.appendChild(button);
        optionsList.appendChild(li);
    });
    
    // Hide explanation initially
    const explanation = document.querySelector('.explanation');
    if (explanation) {
        explanation.style.display = 'none';
    }
    
    // Check if question was already answered
    const savedAnswer = getQuestionAnswer(window.currentSubject, question.id);
    if (savedAnswer !== null) {
        highlightAnswer(savedAnswer.selectedAnswer, question.correctAnswer);
    }
}

// Handle answer selection
function selectAnswer(questionId, selectedAnswer, correctAnswer) {
    // Save answer
    saveQuestionAnswer(window.currentSubject, questionId, selectedAnswer, selectedAnswer === correctAnswer);
    
    // Highlight correct/incorrect answers
    highlightAnswer(selectedAnswer, correctAnswer);
    
    // Update question map
    renderQuestionMap(window.currentQuestions.length, questionId);
}

// Highlight correct/incorrect answers
function highlightAnswer(selectedAnswer, correctAnswer) {
    const optionButtons = document.querySelectorAll('.option-button');
    
    optionButtons.forEach((button, index) => {
        button.classList.add('disabled');
        
        if (index === correctAnswer) {
            button.classList.add('correct');
        } else if (index === selectedAnswer && index !== correctAnswer) {
            button.classList.add('incorrect');
        }
    });
}

// Show explanation
function showExplanation() {
    const questionId = parseInt(localStorage.getItem('currentQuestionId'));
    const question = window.currentQuestions.find(q => q.id === questionId);
    if (!question) return;
    
    const explanation = document.querySelector('.explanation');
    const explanationContent = document.querySelector('.explanation-content');
    
    if (explanation && explanationContent) {
        // Format explanation with proper line breaks and bullet points
        let formattedExplanation = question.explanation
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n•/g, '<br>•')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        explanationContent.innerHTML = `<p>${formattedExplanation}</p>`;
        explanation.style.display = 'block';
    }
}

// Navigate to specific question
function navigateToQuestion(questionId) {
    loadQuestion(questionId);
}

// Navigate to next question
function nextQuestion() {
    const currentId = parseInt(localStorage.getItem('currentQuestionId'));
    const nextId = currentId + 1;
    
    if (nextId <= window.currentQuestions.length) {
        loadQuestion(nextId);
    }
}

// Navigate to previous question
function previousQuestion() {
    const currentId = parseInt(localStorage.getItem('currentQuestionId'));
    const prevId = currentId - 1;
    
    if (prevId >= 1) {
        loadQuestion(prevId);
    }
}

// Go back to homepage
function goHome() {
    window.location.href = 'index.html';
}