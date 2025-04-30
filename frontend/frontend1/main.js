/**
 * Todo List Application
 * 
 * This file contains basic JavaScript skeleton code that can be used as a reference
 * when implementing the frontend functionality with a framework of your choice.
 * 
 * Note: This is just a guideline. You should replace this with a proper implementation
 * using React or Angular 2+
 */

// Sample users data - this would typically come from an API
const users = [
    {
        id: 1,
        username: 'john_doe',
        displayName: 'John Doe',
        avatar: 'placeholder-avatar.png'
    },
    {
        id: 2,
        username: 'jane_smith',
        displayName: 'Jane Smith',
        avatar: 'placeholder-avatar.png'
    },
    {
        id: 3,
        username: 'bob_brown',
        displayName: 'Bob Brown',
        avatar: 'placeholder-avatar.png'
    },
    {
        id: 4,
        username: 'alice_johnson',
        displayName: 'Alice Johnson',
        avatar: 'placeholder-avatar.png'
    },
    {
        id: 5,
        username: 'charlie_davis',
        displayName: 'Charlie Davis',
        avatar: 'placeholder-avatar.png'
    }
];

// Current user - this would be set based on login or selection
let currentUser = users[0];

// Placeholder for the todo data
const todos = [
    // Sample todo data structure
    {
        id: 1,
        title: 'Complete the todo app assignment',
        description: 'Implement all required features of the todo application.',
        priority: 'high',
        completed: false,
        tags: ['work', 'coding'],
        users: ['@john_doe'],
        notes: [
            {
                content: 'This is a sample note for the todo item.',
                date: 'May 10, 2023'
            }
        ],
        userId: 1 // This is the owner of the todo
    }
];

// DOM elements - replace these with your framework's state management
const todoList = document.querySelector('.todo-list');
const addTodoBtn = document.getElementById('add-todo-btn');
const exportBtn = document.getElementById('export-btn');
const userSwitcherBtn = document.querySelector('.user-switcher-btn');
const userDropdownItems = document.querySelectorAll('.user-dropdown-item');
const currentUsername = document.querySelector('.current-username');
const usernameDisplay = document.querySelector('.username');

/**
 * Switch the current user
 * @param {string} username - The username to switch to
 */
function switchUser(username) {
    const user = users.find(u => u.username === username);
    if (user) {
        currentUser = user;
        updateUIForCurrentUser();
        loadTodosForCurrentUser();
    }
}

/**
 * Update the UI to reflect the current user
 */
function updateUIForCurrentUser() {
    // Update username displays
    currentUsername.textContent = currentUser.displayName;
    usernameDisplay.textContent = currentUser.displayName;
    
    // Update avatar
    document.querySelector('.avatar').src = currentUser.avatar;
    
    // You might want to update other UI elements as well
    console.log(`Switched to user: ${currentUser.displayName}`);
}

/**
 * Load todos for the current user
 * In a real implementation, this would fetch from an API
 */
function loadTodosForCurrentUser() {
    // In a real app, you would filter todos by user ID or fetch from API
    const userTodos = todos.filter(todo => todo.userId === currentUser.id);
    renderTodos(userTodos);
}

/**
 * Renders the todo list items
 * In a framework like React or Angular, this would be a component
 * @param {Array} todosToRender - The todos to render
 */
function renderTodos(todosToRender) {
    // Clear the current list
    todoList.innerHTML = '';
    
    if (todosToRender.length === 0) {
        todoList.innerHTML = '<div class="no-todos">No todos found. Add a new one!</div>';
        return;
    }
    
    // Render each todo
    todosToRender.forEach(todo => {
        const todoItem = document.createElement('div');
        todoItem.className = 'todo-item';
        todoItem.dataset.id = todo.id;
        
        todoItem.innerHTML = `
            <div class="todo-checkbox">
                <input type="checkbox" id="todo-${todo.id}" ${todo.completed ? 'checked' : ''}>
                <label for="todo-${todo.id}"></label>
            </div>
            <div class="todo-content">
                <h3 class="todo-title">${todo.title}</h3>
                <div class="todo-meta">
                    <span class="todo-priority priority-${todo.priority}">${todo.priority}</span>
                    <div class="todo-tags">
                        ${todo.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="todo-users">
                        ${todo.users.map(user => `<span class="user-tag">${user}</span>`).join('')}
                    </div>
                </div>
            </div>
            <div class="todo-actions">
                <button class="todo-note-btn" title="Add note">
                    <i class="fas fa-sticky-note"></i>
                </button>
                <button class="todo-edit-btn" title="Edit todo">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="todo-delete-btn" title="Delete todo">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        todoItem.querySelector('.todo-content').addEventListener('click', () => showTodoDetails(todo.id));
        todoItem.querySelector('.todo-note-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            showNoteModal(todo.id);
        });
        todoItem.querySelector('.todo-edit-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            showEditTodoModal(todo.id);
        });
        todoItem.querySelector('.todo-delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            confirmDeleteTodo(todo.id);
        });
        
        todoList.appendChild(todoItem);
    });
}

/**
 * Adds a new todo item
 * @param {Object} todoData - The todo data
 */
function addTodo(todoData) {
    // Add user ID to the todo
    const newTodo = {
        ...todoData,
        id: Date.now(), // Generate a unique ID
        userId: currentUser.id
    };
    
    todos.push(newTodo);
    loadTodosForCurrentUser();
}

/**
 * Updates an existing todo item
 * @param {number} id - The todo ID
 * @param {Object} todoData - The updated todo data
 */
function updateTodo(id, todoData) {
    const index = todos.findIndex(todo => todo.id === id);
    if (index !== -1) {
        todos[index] = { ...todos[index], ...todoData };
        loadTodosForCurrentUser();
    }
}

/**
 * Deletes a todo item
 * @param {number} id - The todo ID
 */
function deleteTodo(id) {
    const index = todos.findIndex(todo => todo.id === id);
    if (index !== -1) {
        todos.splice(index, 1);
        loadTodosForCurrentUser();
    }
}

/**
 * Adds a note to a todo item
 * @param {number} todoId - The todo ID
 * @param {string} noteContent - The note content
 */
function addNote(todoId, noteContent) {
    const todo = todos.find(todo => todo.id === todoId);
    if (todo) {
        const note = {
            content: noteContent,
            date: new Date().toLocaleDateString()
        };
        todo.notes.push(note);
        loadTodosForCurrentUser();
    }
}

/**
 * Shows the todo details modal
 * @param {number} todoId - The todo ID
 */
function showTodoDetails(todoId) {
    const todo = todos.find(todo => todo.id === todoId);
    if (todo) {
        // Show a modal or new page with the todo details
        alert(`Todo Details:\nTitle: ${todo.title}\nDescription: ${todo.description}\nPriority: ${todo.priority}\nTags: ${todo.tags.join(', ')}\nAssigned Users: ${todo.users.join(', ')}\nNotes: ${todo.notes.length} note(s)`);
    }
}

/**
 * Shows the note modal for a todo
 * @param {number} todoId - The todo ID
 */
function showNoteModal(todoId) {
    // Implement the add note modal functionality here
    alert(`You would add a note to todo ID: ${todoId}`);
}

/**
 * Shows the edit todo modal
 * @param {number} todoId - The todo ID
 */
function showEditTodoModal(todoId) {
    const todo = todos.find(todo => todo.id === todoId);
    if (todo) {
        // Implement the edit todo modal functionality here
        alert(`You would edit todo ID: ${todoId}\nCurrent Title: ${todo.title}\nCurrent Priority: ${todo.priority}`);
    }
}

/**
 * Confirms deletion of a todo
 * @param {number} todoId - The todo ID
 */
function confirmDeleteTodo(todoId) {
    // Implement the confirmation dialog functionality here
    const confirmed = confirm(`Are you sure you want to delete todo ID: ${todoId}?`);
    if (confirmed) {
        deleteTodo(todoId);
    }
}

/**
 * Exports todos for the current user
 */
function exportTodos() {
    // Implement the export functionality here
    alert(`Exporting todos for user: ${currentUser.displayName}`);
}

/**
 * Handles pagination (next/prev page)
 * @param {number} page - The page number to navigate to
 */
function handlePagination(page) {
    // Implement pagination logic here
    alert(`Navigating to page ${page}`);
}

/**
 * Sets up infinite scroll for the todo list
 */
function setupInfiniteScroll() {
    // Implement the infinite scroll functionality here
    alert("Infinite scroll would load more todos as you scroll down");
}

/**
 * Filters todos based on selected criteria
 * @param {Object} filters - Filter criteria
 */
function filterTodos(filters) {
    // Implement the filtering functionality here
    alert(`Filtering todos with: ${JSON.stringify(filters)}`);
}

/**
 * Sets up event listeners for UI elements
 */
function setupEventListeners() {
    // User switcher
    userDropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            const username = item.dataset.username;
            switchUser(username);
        });
    });
    
    // Add todo button
    addTodoBtn.addEventListener('click', () => {
        // Show an alert instead of the modal
        alert("You would add a new todo here");
    });
    
    // Export button
    exportBtn.addEventListener('click', exportTodos);
    
    // Setup filter event listeners
    const filterCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const filters = {
                priorities: Array.from(document.querySelectorAll('.filter-options input[type="checkbox"]:checked'))
                    .map(cb => cb.value)
            };
            filterTodos(filters);
        });
    });
    
    // Search button
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search-input');
    searchBtn.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            alert(`Searching for: ${searchTerm}`);
            // In a real app, this would filter todos based on the search term
        }
    });
    
    // Pagination buttons
    const prevBtn = document.querySelector('.pagination-prev');
    const nextBtn = document.querySelector('.pagination-next');
    prevBtn.addEventListener('click', () => {
        const currentPage = parseInt(document.querySelector('.pagination-current').textContent);
        if (currentPage > 1) {
            handlePagination(currentPage - 1);
        }
    });
    nextBtn.addEventListener('click', () => {
        const currentPage = parseInt(document.querySelector('.pagination-current').textContent);
        const totalPages = parseInt(document.querySelector('.pagination-total').textContent);
        if (currentPage < totalPages) {
            handlePagination(currentPage + 1);
        }
    });
}

/**
 * Initializes the application
 */
function initApp() {
    // Set initial user
    updateUIForCurrentUser();
    
    // Load initial todos
    loadTodosForCurrentUser();
    
    // Setup event listeners
    setupEventListeners();
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp); 