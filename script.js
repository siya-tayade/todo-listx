
let taskInput, addBtn, taskList, errorMessage, filterBtns, emptyState, dateElement;

let tasks = [];
let currentFilter = 'all';


document.addEventListener('DOMContentLoaded', () => {
    
    taskInput = document.getElementById('task-input');
    addBtn = document.getElementById('add-btn');
    taskList = document.getElementById('task-list');
    errorMessage = document.getElementById('error-message');
    filterBtns = document.querySelectorAll('.filter-btn');
    emptyState = document.getElementById('empty-state');
    dateElement = document.getElementById('current-date');

    
    if (addBtn) addBtn.addEventListener('click', addTask);

    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask();
        });
    }

    if (filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

            
                currentFilter = btn.dataset.filter;
                renderTasks();
            });
        });
    }

    if (taskList) {
        taskList.addEventListener('click', (e) => {
            const item = e.target.closest('.task-item');
            if (!item) return;

            const id = parseInt(item.dataset.id);

            
            if (e.target.closest('.task-checkbox') || e.target.closest('.task-content')) {
                
                if (item.querySelector('.edit-input')) return;
                toggleTask(id);
            }

        
            if (e.target.closest('.delete')) {
                deleteTask(id);
            }

            
            if (e.target.closest('.edit')) {
                startEditing(id, item);
            }
        });
    }

    loadTasks();
    displayDate();
    renderTasks();
});


function displayDate() {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    const today = new Date();
    dateElement.textContent = today.toLocaleDateString('en-US', options);
}


function loadTasks() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
}


function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}


function addTask() {
    const text = taskInput.value.trim();
    
    
    if (text === '') {
        showError('Please enter a task name');
        return;
    }

    const newTask = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask); 
    saveTasks();
    

    taskInput.value = '';
    showError(''); 
    taskInput.focus();
}


function showError(msg) {
    errorMessage.textContent = msg;
    if (msg) {
        setTimeout(() => {
            errorMessage.textContent = '';
        }, 3000);
    }
}

function renderTasks() {
    taskList.innerHTML = '';
    

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    if (filteredTasks.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
    }

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        li.innerHTML = `
            <div class="task-checkbox">
                ${task.completed ? '<i class="fas fa-check"></i>' : ''}
            </div>
            <div class="task-content">${escapeHtml(task.text)}</div>
            <div class="task-actions">
                <button class="action-btn edit" title="Edit">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="action-btn delete" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        taskList.appendChild(li);
    });
}


function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveTasks();
}

function deleteTask(id) {
    const taskItem = document.querySelector(`.task-item[data-id="${id}"]`);
    
    if(confirm('Delete this task?')) {
        
        if (taskItem) {
            taskItem.classList.add('slide-out');
            
            taskItem.addEventListener('animationend', () => {
                tasks = tasks.filter(task => task.id !== id);
                saveTasks();
            });
        } else {
            
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
        }
    }
}

function startEditing(id, itemElement) {
    const contentDiv = itemElement.querySelector('.task-content');
    const currentText = contentDiv.innerText;

    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'edit-input';
    

    contentDiv.innerHTML = '';
    contentDiv.appendChild(input);
    input.focus();


    const saveEdit = () => {
        const newText = input.value.trim();
        if (newText) {
            updateTaskText(id, newText);
        } else {
            renderTasks(); 
        }
    };

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            input.removeEventListener('blur', saveEdit); 
            saveEdit();
        }
    });
}


function updateTaskText(id, newText) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, text: newText };
        }
        return task;
    });
    saveTasks();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}