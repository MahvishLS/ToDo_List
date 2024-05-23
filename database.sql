create schema listWebsite;
use listWebsite;

CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category ENUM('personal', 'work', 'household', 'academic') NOT NULL,
  deadline DATETIME NOT NULL
);

ALTER TABLE tasks
ADD reminder_sent INT(1) DEFAULT 0;

CREATE TABLE users (
    name VARCHAR(255) NOT NULL primary KEY,
    email VARCHAR(255) NOT NULL
);