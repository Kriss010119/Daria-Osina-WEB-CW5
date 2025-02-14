const content = document.getElementById("content");
const form = document.getElementById('numberForm');
const numberInput = document.getElementById('numberInput');
const tasksContainer = document.getElementById('tasksContainer');
const buttonTable = document.getElementById('btn-table');
const buttonLines = document.getElementById('btn-lines');
const tableBody = document.querySelector('#tasksTable tbody');
const tableHeader = document.querySelector('#tasksTable thead');

// Classes for table -----------------------------------------------------------------------------------------------------------------------------------

class ElementTodos {
    #userId
    #id;
    #title;
    #completed;

    constructor(userId, id, title, completed) {
        this.#userId = userId;
        this.#id = id;
        this.#title = title;
        this.#completed = completed;
    }

    get getUserId() {
        return this.#userId;
    }

    get getId() {
        return this.#id;
    }

    get getTitle() {
        return this.#title;
    }

    get getCompleted() {
        return this.#completed;
    }
}

class TableTodos {
    #todos;

    constructor() {
        this.#todos = [];
    }

    addTodo(todo) {
        if (todo instanceof ElementTodos) {
            this.#todos.push(todo);
        } else {
            console.log("Invalid type for Todo.");
        }
    }

    listAllTodos() {
        return this.#todos.map(todo => ({
            Id: todo.getId,
            UserId: todo.getUserId,
            Title: todo.getTitle,
            Completed: todo.getCompleted
        }));
    }

    clearTodos() {
        this.#todos = [];
    }
}

const tableTodos = new TableTodos();
let todosShowLines = [];

// Load JSON and show it on the page --------------------------------------------------------------------------------------------------------------------

function fetchTodosSync(count) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `https://jsonplaceholder.typicode.com/todos?_limit=${count}`, false);
    xhr.send();

    if (xhr.status !== 200) {
        console.log(xhr.status, xhr.responseText);
        return;
    }

    const data = JSON.parse(xhr.responseText);
    return data;
}

function fetchTodosAsync(count) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.onload = function () {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                resolve(data);
            } else {
                reject('Error');
            }
        };

        xhr.onerror = function () {
            reject('Error');
        };

        xhr.open("GET", `https://jsonplaceholder.typicode.com/todos?_limit=${count}`, true);
        xhr.send();
    });
}

function displayTodos(todos) {
    tasksContainer.innerHTML = '';

    todos.forEach(todo => {
        const p = document.createElement('p');
        p.textContent = todo.id + "   " + todo.title;

        if (todo.completed) {
            p.classList.add('completed');
        } else {
            p.classList.add('not-completed');
        }

        tasksContainer.appendChild(p);
    });
}

function displayHeader(todos) {
    let header = document.querySelector('h2');
    header.textContent = `Данные о ${Object.keys(todos).length} пользователях:`;
}

function displayTableTodos(todos) {
    tableBody.innerHTML = '';
    tableHeader.innerHTML = '';

    const row = document.createElement('tr');
    row.innerHTML = `
        <th>№</th>
        <th>ID</th>
        <th>Title</th>
        <th>Completed</th>
    `;
    tableHeader.append(row);

    todos.forEach(todo => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="${todo.Completed ? 'completedTable' : 'not-completedTable'}">${todo.Id}</td>
            <td class="${todo.Completed ? 'completedTable' : 'not-completedTable'}">${todo.UserId}</td>
            <td class="${todo.Completed ? 'completedTable' : 'not-completedTable'}">${todo.Title}</td>
            <td class="${todo.Completed ? 'completed' : 'not-completed'}">${todo.Completed}</td>
        `;  
        tableBody.append(row);
    });
}


// Buttons ----------------------------------------------------------------------------------------------------------------------------------------------

form.addEventListener('submit', function (event) {
    event.preventDefault();
    
    tasksContainer.innerHTML = '';
    tableBody.innerHTML = '';
    tableHeader.innerHTML = '';

    const numberValue = numberInput.value;

    if (event.submitter.id === 'btn-sync') {
        try {
            const todos = fetchTodosSync(numberValue);
            todosShowLines = todos;
            displayHeader(todos);
            tableTodos.clearTodos();
            todos.forEach(todo => {
                const td = new ElementTodos(todo.userId, todo.id, todo.title, todo.completed);
                tableTodos.addTodo(td);
            });
        } catch (error) {
            console.log("Error in creating table (sync).");
            ErrorDisplay();
        }
    } else if (event.submitter.id === 'btn-async') {
        fetchTodosAsync(numberValue)
            .then(todos => {
                todosShowLines = todos;
                displayHeader(todos);
                tableTodos.clearTodos();
                todos.forEach(todo => {
                    const td = new ElementTodos(todo.userId, todo.id, todo.title, todo.completed);
                    tableTodos.addTodo(td);
                });
            })
            .catch(error => {
                console.log("Error in creating table (async).");
                ErrorDisplay();
            });
    }
});


buttonTable.addEventListener('click', function () {
    tasksContainer.innerHTML = '';
    tableBody.innerHTML = '';
    tableHeader.innerHTML = '';

    const todos = tableTodos.listAllTodos();

    if (todos.length > 0) {
        displayTableTodos(todos);
    } else {
        tasksContainer.innerHTML = "No data to display.";
    }
});

buttonLines.addEventListener('click', function () {
    tasksContainer.innerHTML = '';
    tableBody.innerHTML = '';
    tableHeader.innerHTML = '';

    if (todosShowLines.length > 0) {
        displayHeader(todosShowLines);
        displayTodos(todosShowLines);
    } else {
        tasksContainer.innerHTML = "No data to display.";
    }
});

function ErrorDisplay() {
    tasksContainer.innerHTML = 'Error!!!';
}
