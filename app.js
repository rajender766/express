const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const date = require("date-fns");

const dbPath = path.join(__dirname, "todoApplication.db");

const app = express();
app.use(express.json());

let database = null;
const initializerDBAndSever = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server Running at http://localhost:3000/`);
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializerDBAndSever();

const convertDBResponseTOdOTOObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
    category: dbObject.category,
    due_date: dbObject.due_date,
  };
};

//API 1

// SN 1
app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "", category } = request.query;
  console.log(status)
  const getTodoQuery = `
    SELECT
      *
    FROM 
      todo
    WHERE 
    status = '${status}';`;
  const todoArray = await database.all(getTodoQuery);
  console.log(todoArray)
  response.send(
    todoArray.map((eachTodo) => convertDBResponseTOdOTOObject(eachTodo))
  );
});
// SN 2
app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "", category } = request.query;
  const getTodoQueryPriority = `
    SELECT
      *
    FROM 
      todo
    WHERE 
    priority = '${priority}';`;
  const todoArray = await database.all(getTodoQueryPriority);
  response.send(
    todoArray.map((eachTodo) => convertDBResponseTOdOTOObject(eachTodo))
  );
});
// SN 3
app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "", category } = request.query;
  const getTodoQueryPriority = `
    SELECT
      *
    FROM 
      todo
    WHERE 
    priority = '${priority}' && status = '${status}' ;`;
  const todoArray = await database.all(getTodoQueryPriority);
  response.send(
    todoArray.map((eachTodo) => convertDBResponseTOdOTOObject(eachTodo))
  );
});
// SN 4
app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "", category } = request.query;
  const getTodoQueryPriority = `
    SELECT
      *
    FROM 
      todo
    WHERE 
    todo = '%${search_q}%';`;
  const todoArray = await database.all(getTodoQueryPriority);
  response.send(
    todoArray.map((eachTodo) => convertDBResponseTOdOTOObject(eachTodo))
  );
});
// SN 5
app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "", category } = request.query;
  const getTodoQueryPriority = `
    SELECT
      *
    FROM 
      todo
    WHERE 
    category = '${category}' &&  status = '${status}' ;`;
  const todoArray = await database.all(getTodoQueryPriority);
  response.send(
    todoArray.map((eachTodo) => convertDBResponseTOdOTOObject(eachTodo))
  );
});

// SN 6
app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "", category } = request.query;
  const getTodoQueryPriority = `
    SELECT
      *
    FROM 
      todo
    WHERE 
    category = '${category}';`;
  const todoArray = await database.all(getTodoQueryPriority);
  response.send(
    todoArray.map((eachTodo) => convertDBResponseTOdOTOObject(eachTodo))
  );
});

// SN 7
app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "", category } = request.query;
  const getTodoQueryPriority = `
    SELECT
      *
    FROM 
      todo
    WHERE  
       category = '${category}' && priority ='${priority}' ;`;
  const todoArray = await database.all(getTodoQueryPriority);
  response.send(
    todoArray.map((eachTodo) => convertDBResponseTOdOTOObject(eachTodo))
  );
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQueryPriority = `
    SELECT
      *
    FROM 
      todo
    WHERE  
       id = ${todoId};`;
  const todoArray = await database.all(getTodoQueryPriority);
  response.send(
    todoArray.map((eachTodo) => convertDBResponseTOdOTOObject(eachTodo))
  );
});

//API 3

app.get("/agenda/", async (request, response) => {
  const { todoId } = request.params;
  const date = "2021-12-12";
  const getTodoQueryPriority = `
    SELECT
      *
    FROM 
      todo
    WHERE  
       dueDate = ${date};`;
  const todoArray = await database.all(getTodoQueryPriority);
  response.send(
    todoArray.map((eachTodo) => convertDBResponseTOdOTOObject(eachTodo))
  );
});

//API 4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const postQuery = ` INSERT INTO
                              todo(id,todo,priority,status,category,dueDate)
                        VALUES (${id},'${todo}','${priority}','${status}','${category}','${dueDate}');`;
  await database.run(postQuery);
  response.send("Todo Successfully");
});

//API 5

//SN 1
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status } = request.body;
  const updateTodoQuery = `
    UPDATE
      todo
    SET
      status='${status}'
    WHERE
      id = ${todoId};`;
  await database.run(updateTodoQuery);
  response.send("Status Updated");
});

//SN 2
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { priority } = request.body;
  const updateTodoQuery = `
    UPDATE
      todo
    SET
      priority='${priority}'
    WHERE
      id = ${todoId};`;
  await database.run(updateTodoQuery);
  response.send("Priority Updated");
});

//SN 3
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo } = request.body;
  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo ='${todo}'
    WHERE
      id = ${todoId};`;
  await database.run(updateTodoQuery);
  response.send("Tod Updated");
});

//SN 4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { category } = request.body;
  const updateTodoQuery = `
    UPDATE
      todo
    SET
      category ='${category}'
    WHERE
      id = ${todoId};`;
  await database.run(updateTodoQuery);
  response.send("Category Updated");
});

//SN 5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { dueDate } = request.body;
  const updateTodoQuery = `
    UPDATE
      todo
    SET
      dueDate ='${dueDate}'
    WHERE
      id = ${todoId};`;
  await database.run(updateTodoQuery);
  response.send("Due Date Updated");
});

//API 6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const updateTodoQuery = `
    DELETE FROM
      todo
    WHERE
      id = ${todoId};`;
  await database.run(updateTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
