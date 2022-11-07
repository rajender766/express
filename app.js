const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const isValidDate = require("date-fns/isValid");
const format = require("date-fns/format");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDBResponseTOdOTOObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
    category: dbObject.category,
    dueDate: dbObject.due_date,
  };
};

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status, category } = request.query;
  let invalidColumn = "";
  let isValid = "";
  switch (true) {
    case hasStatusProperty(request.query):
      const statusArr = ["TO DO", "IN PROGRESS", "DONE"];
      isValid = statusArr.includes(status);
      invalidColumn = "Status";
      getTodosQuery = `
            SELECT
                *
            FROM
                todo 
            WHERE
                status = '${status}';`;
      break;
    case hasPriorityProperty(request.query):
      const priorityArr = ["HIGH", "MEDIUM", "LOW"];
      isValid = priorityArr.includes(request.query);
      invalidColumn = "Priority";
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
       priority = '${priority}';`;
      break;
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
        SELECT
            *
        FROM
            todo 
        WHERE
            status = '${status}'
            AND priority = '${priority}';`;
      break;
    case hasCategoryAndStatusProperties(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        status = '${status}'
        AND category = '${category}';`;
      break;
    case hasCategoryProperty(request.query):
      const categoryArr = ["WORK", "HOME", "LEARNING"];
      isValid = categoryArr.includes(request.query);
      invalidColumn = "Category";
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
       category = '${category}';`;
      break;
    case hasCategoryAndPriorityProperties(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        priority = '${priority}'
        AND category = '${category}';`;
      break;
    default:
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%';`;
  }
  if (isValid) {
    data = await database.all(getTodosQuery);
    response.send(data.map((todo) => convertDBResponseTOdOTOObject(todo)));
  }
  response.status(400);
  response.send(`Invalid Todo ${invalidColumn}`);
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
  const todoArray = await database.get(getTodoQueryPriority);
  response.send(convertDBResponseTOdOTOObject(todoArray));
});

//API 3

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  console.log(date);
  const newDate = format(new Date(request.query), "yyyy-mm-dd");
  const isValid = isValidDate(new Date(date));
  console.log(newDate);
  console.log(isValid);
  if (validDate) {
    const getTodoAgenda = `
    SELECT
      *
    FROM 
      todo
    WHERE  
       due_date = ${date};`;
    const todoArray = await database.all(getTodoAgenda);
    response.send(
      todoArray.map((eachTodo) => convertDBResponseTOdOTOObject(eachTodo))
    );
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API 4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const postQuery = ` INSERT INTO
                              todo(id,todo,priority,status,category,due_date)
                        VALUES (${id},'${todo}','${priority}','${status}','${category}','${dueDate}');`;
  await database.run(postQuery);
  response.send("Todo Successfully Added");
});

//API 5

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  let isValid = "";
  const requestBody = request.body;

  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      const statusArr = ["TO DO", "IN PROGRESS", "DONE"];
      isValid = statusArr.includes(requestBody.status);
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      const priorityArr = ["HIGH", "MEDIUM", "LOW"];
      isValid = priorityArr.includes(requestBody.priority);
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      isValid = true;
      break;
    case requestBody.category !== undefined:
      updateColumn = "Category";
      const categoryArr = ["WORK", "HOME", "LEARNING"];
      isValid = categoryArr.includes(requestBody.category);
      break;
    case requestBody.dueDate !== undefined:
      updateColumn = "Due Date";
      const newDate = format(new Date(requestBody.dueDate), "yyyy-mm-dd");
      isValid = isValidDate(new Date(newDate));
      break;
  }
  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
  const previousTodo = await database.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.due_date,
  } = request.body;

  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category = '${category}',
      due_date = '${dueDate}'
    WHERE
      id = ${todoId};`;

  if (isValid) {
    await database.run(updateTodoQuery);
    response.send(`${updateColumn} Updated`);
  } else {
    if (updateColumn === "Due Date") {
      response.status(400);
      response.send(`Invalid ${updateColumn}`);
    }
    response.status(400);
    response.send(`Invalid Todo ${updateColumn}`);
  }
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
