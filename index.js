let express = require("express");
let path = require("path");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();
const { DATABASE_URL } = process.env;

let app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.get("/novels/:id", async (req, res) => {
  const id = req.params.id;
  const client = await pool.connect();
  try {
    const query = 'SELECT * FROM novels WHERE id = $1';
    const result = await client.query(query, [id]);
    res.json(result.rows);
  } catch (err) {
    console.error("error: ", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.put("/novels/:id", async (req, res) => {
  const id = req.params.id;
  const editData = req.body;
  const client = await pool.connect();
  try {
    const updateQuery = 'UPDATE novels SET title = $1, author = $2, year_published = $3 WHERE id = $4 RETURNING id,title,author,year_published';
    const queryData = [editData.title, editData.author, editData.year_published, id];
    const result = await client.query(updateQuery, queryData);

    res.json({ "data: ": result.rows })
  } catch (err) {
    console.error("error: ", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(3000, () => {
  console.log("App is listening on port 3000");
});