const express = require("express");
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const sgMail = require("@sendgrid/mail");

const app = express();
const port = 3000;

app.use(bodyParser.json());

// MySQL database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",  //password 
  database: "ListWebsite",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
    process.exit(1);
  }
  console.log("MySQL connected...");
});

// Set SendGrid API key
sgMail.setApiKey(
  ""  //api key
);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Serve index.html for the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// add a new task
app.post("/api/add-task", (req, res) => {
  const { title, description, category, deadline } = req.body;
  const sql =
    "INSERT INTO tasks (title, description, category, deadline) VALUES (?, ?, ?, ?)";
  db.query(sql, [title, description, category, deadline], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, error: err });
    }
    res.json({ success: true });
  });
});

// Get a task by id
app.get("/api/task/:id", (req, res) => {
  const sql = "SELECT title, description, category, deadline FROM tasks WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(result[0]);
  });
});

// update task
app.put("/api/edit-task", (req, res) => {
  const { id, title, description, category, deadline } = req.body;
  const sql =
    "UPDATE tasks SET title = ?, description = ?, category = ?, deadline = ? WHERE id = ?";
  db.query(sql, [title, description, category, deadline, id], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, error: err });
    }
    res.json({ success: true });
  });
});


// fetch tasks
app.get("/api/tasks", (req, res) => {
  const sql = "SELECT * FROM tasks";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

// delete task
app.delete("/api/delete-task/:id", (req, res) => {
  const taskId = req.params.id;
  const sql = `DELETE FROM tasks WHERE id = ?`;
  db.query(sql, [taskId], (error, results) => {
    if (error) {
      console.error("Error deleting task:", error);
      res.status(500).send("Error deleting task");
      return;
    }
    console.log("Task deleted successfully");
    res.sendStatus(200);
  });
});

// register 

app.post("/api/register", (req, res) => {
  const { name, email } = req.body;
  const sql = "INSERT INTO users (name, email) VALUES (?, ?)";
  db.query(sql, [name, email], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, error: err });
    }
    res.json({ success: true });
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Function to send reminder email using SendGrid
const sendReminderEmail = (task, recipientEmail='') => {
  const msg = {
    to: recipientEmail,
    from: "", //  sender email address
    subject: "Task Reminder",
    text: `Reminder: Your task "${task.title}" is due in less than 1 hour. Hurry up and finish it before the deadline!`,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error("Error sending email:", error.response.body);
    });
};

// Schedule a cron job to run every minute
cron.schedule('* * * * *', () => {
  const sql = `
    SELECT * FROM users LIMIT 1
  `; // Fetch only one user
  db.query(sql, (err, results) => {
    if (err) {
      return console.error('Error querying users:', err);
    }
    if (results.length > 0) {
      const recipientEmail = results[0].email; 
      // console.log('Recipient email:', recipientEmail);
      const taskSql = `
        SELECT * FROM tasks 
        WHERE deadline BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 1 HOUR) 
        AND reminder_sent = 0 
        LIMIT 1
      `; // Fetch tasks
      db.query(taskSql, (taskErr, taskResults) => {
        if (taskErr) {
          return console.error('Error querying tasks:', taskErr);
        }
        if (taskResults.length > 0) {
          const task = taskResults[0];
          console.log('Task:', task);
          sendReminderEmail(task, recipientEmail);
          // Update task status to mark reminder as sent
          markReminderSent(task.id);
        } 
      });
    } else {
      console.log('No users found');
    }
  });
});

const markReminderSent = (taskId) => {
  const sql = 'UPDATE tasks SET reminder_sent = 1 WHERE id = ?';
  db.query(sql, [taskId], (err, result) => {
    if (err) {
      console.error('Error updating task status:', err);
    } else {
      console.log('Task reminder marked as sent:', taskId);
    }
  });
};
