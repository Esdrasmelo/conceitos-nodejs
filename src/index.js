const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.filter(user => user.username === username);

  if (!user.length > 0) {
    return response.status(404).json({ error: 'User not found' });
  }

  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const findUsedUsername = users.filter(user => user.username === username);

  if (findUsedUsername.length > 0) {
    return response.status(400).json({ error: 'Username already exists' });
  }

  const userObject = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(userObject);

  return response.status(201).send(userObject);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).send(user[0].todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  request.user[0].todos.push(newTodo);

  return response.status(201).send(newTodo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;

  const findTodo = request.user[0].todos.filter(todo => todo.id === id);

  if (findTodo.length === 0) {
    return response.status(404).json({ error: 'ToDo not found' });
  } else {
    request.user[0].todos.map(todo => {
      if (todo.id === id) {
        todo.title = title;
        todo.deadline = deadline;
        return response.status(200).send(todo);
      }
    });
  
  }

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const findTodo = request.user[0].todos.filter(todo => todo.id === id);

  if (findTodo.length === 0) {
    return response.status(404).json({ error: 'ToDo not found' });
  } else {
    request.user[0].todos.map(todo => {
      if (todo.id === id) {
        todo.done = true;
        return response.status(200).send(todo);
      }
    });
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const findTodo = request.user[0].todos.filter(todo => todo.id === id);

  if (findTodo.length === 0) {
    return response.status(404).json({ error: 'ToDo not found' });
  } else {
    const todo = request.user[0].todos.filter(todo => todo.id === id);
    const findTodoIndex = request.user[0].todos.indexOf(todo[0]);
    request.user[0].todos.splice(findTodoIndex, 1);
  
    return response.status(204).send();''
  }

});

module.exports = app;