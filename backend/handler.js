const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const TASKS_TABLE = process.env.TASKS_TABLE;
let client;

if (process.env.IS_OFFLINE) {
  console.log('*** Conectando a DynamoDB Local (http://localhost:8000) ***');

  client = new DynamoDBClient({
    region: 'us-east-1',
    endpoint: 'http://localhost:8000',
    credentials: {
      accessKeyId: "fakeMyKeyId",
      secretAccessKey: "fakeSecretAccessKey",
    }
  });
} else {
  console.log('*** Conectando a DynamoDB en AWS Cloud ***');

  client = new DynamoDBClient({
    region: 'us-east-1',
  });
};

const dynamoDb = DynamoDBDocumentClient.from(client);

// Headers CORS comunes
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};

// Función auxiliar para respuestas
const response = (statusCode, body) => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});

// Generar UUID manualmente (sin librería)
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
/**
 * GET / - Obtener mensaje inicial (Raíz)
 */
module.exports.getRoot = async () => {
  return response(200, { message: 'API de Gestión de Tareas está en funcionamiento' });
}

/**
 * GET /tasks - Obtener todas las tareas
 */
module.exports.getTasks = async () => {
  const params = {
    TableName: TASKS_TABLE,
  };

  try {
    const result = await dynamoDb.send(new ScanCommand(params));

    if (!result.Items || result.Items.length === 0) {
      return response(404, {
        error: 'No hay tareas disponibles',
      });
    }
    // Ordenar por fecha de creación (más reciente primero)
    const tasks = result.Items.sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    return response(200, tasks);
  } catch (error) {
    console.error('Error getting tasks:', error);
    return response(500, { error: 'No se pudieron obtener las tareas' });
  }
};

/**
 * GET /tasks/{id} - Obtener una tarea específica
 */
module.exports.getTask = async (event) => {
  try {
    const { id } = event.pathParameters;

    const params = {
      TableName: TASKS_TABLE,
      Key: { PK: `TASK#${id}` },
    };

    const result = await dynamoDb.send(new GetCommand(params));

    if (!result.Item) {
      return response(404, { error: 'Tarea no encontrada' });
    }

    return response(200, result.Item);
  } catch (error) {
    console.error('Error getting task:', error);
    return response(500, { error: 'No se pudo obtener la tarea' });
  }
};

/**
 * POST /tasks - Crear nueva tarea
 */
module.exports.createTask = async (event) => {
  try {
    const data = JSON.parse(event.body);

    // Validación básica
    if (!data.title || !data.priority) {
      return response(400, { error: 'Título y prioridad son requeridos' });
    }

    const taskId = generateUUID();
    const timestamp = new Date().toISOString();
    const task = {
      PK: `TASK#${taskId}`,
      taskId: taskId,
      title: data.title,
      description: data.description || '',
      priority: data.priority,
      status: 'pendiente',
      createdAt: timestamp,
      dueDate: data.dueDate || '',
    };

    await dynamoDb.send(
      new PutCommand({
        TableName: TASKS_TABLE,
        Item: task,
      })
    );

    return response(201, task);
  } catch (error) {
    console.error('Error creating task:', error);
    return response(500, { error: 'No se pudo crear la tarea' });
  }
};

/**
 * PUT /tasks/{id} - Actualizar tarea
 */
module.exports.updateTask = async (event) => {
  try {
    const { id } = event.pathParameters;
    const data = JSON.parse(event.body);
    const key = { PK: `TASK#${id}` };

    // Verificar que la tarea existe
    const existing = await dynamoDb.send(
      new GetCommand({
        TableName: TASKS_TABLE,
        Key: key,
      })
    );

    if (!existing.Item) {
      return response(404, { error: 'Tarea no encontrada' });
    }

    // Construir expresión de actualización dinámica
    const updateExpressions = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    if (data.title !== undefined) {
      updateExpressions.push('#title = :title');
      expressionAttributeNames['#title'] = 'title';
      expressionAttributeValues[':title'] = data.title;
    }
    if (data.description !== undefined) {
      updateExpressions.push('#description = :description');
      expressionAttributeNames['#description'] = 'description';
      expressionAttributeValues[':description'] = data.description;
    }
    if (data.priority !== undefined) {
      updateExpressions.push('#priority = :priority');
      expressionAttributeNames['#priority'] = 'priority';
      expressionAttributeValues[':priority'] = data.priority;
    }
    if (data.status !== undefined) {
      updateExpressions.push('#status = :status');
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = data.status;
    }
    if (data.dueDate !== undefined) {
      updateExpressions.push('#dueDate = :dueDate');
      expressionAttributeNames['#dueDate'] = 'dueDate';
      expressionAttributeValues[':dueDate'] = data.dueDate;
    }

    const params = {
      TableName: TASKS_TABLE,
      Key: key,
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamoDb.send(new UpdateCommand(params));

    return response(200, result.Attributes);
  } catch (error) {
    console.error('Error updating task:', error);
    return response(500, { error: 'No se pudo actualizar la tarea' });
  }
};

/**
 * DELETE /tasks/{id} - Eliminar tarea
 */
module.exports.deleteTask = async (event) => {
  try {
    const { id } = event.pathParameters;
    const key = { PK: `TASK#${id}` };

    // Verificar que existe antes de eliminar
    const existing = await dynamoDb.send(
      new GetCommand({
        TableName: TASKS_TABLE,
        Key: key,
      })
    );

    if (!existing.Item) {
      return response(404, { error: 'Tarea no encontrada' });
    }

    await dynamoDb.send(
      new DeleteCommand({
        TableName: TASKS_TABLE,
        Key: key,
      })
    );

    return response(200, { message: 'Tarea eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return response(500, { error: 'No se pudo eliminar la tarea' });
  }
};