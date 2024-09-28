const express = require('express');
const { Client } = require('@notionhq/client');
require('dotenv').config();

const app = express();
const port = 3000;

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

app.use(express.static('public'));
app.use(express.json());

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description } = req.body;
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Title: { title: [{ text: { content: title } }] },
        Description: { rich_text: [{ text: { content: description } }] },
        Status: {
          select: {
            name: 'Not Started'
          }
        }
      }
    });
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [{ property: 'Title', direction: 'ascending' }]
    });
    res.json(response.results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const response = await notion.pages.update({
      page_id: id,
      properties: {
        Status: { select: { name: status } }
      }
    });
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await notion.pages.update({
      page_id: id,
      archived: true
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});