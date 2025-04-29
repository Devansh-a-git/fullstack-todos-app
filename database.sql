-- Create Tags table
DROP TABLE IF EXISTS Tags;

CREATE TABLE IF NOT EXISTS Tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Update Users table to use INT for id
DROP TABLE IF EXISTS Users CASCADE;

CREATE TABLE IF NOT EXISTS Users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update Todos table to use INT for user_id
DROP TABLE IF EXISTS Todo_Tags;
DROP TABLE IF EXISTS Todos CASCADE;

CREATE TABLE IF NOT EXISTS Todos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(10) CHECK (priority IN ('High', 'Medium', 'Low')),
    completed BOOLEAN DEFAULT FALSE,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Create Todo_Tags table (Many-to-Many relationship for tags)
CREATE TABLE IF NOT EXISTS Todo_Tags (
    todo_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (todo_id, tag_id),
    FOREIGN KEY (todo_id) REFERENCES Todos(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tags(id) ON DELETE CASCADE
);

-- Create Todo_Assigned_Users table (Many-to-Many relationship for assigned users)
CREATE TABLE IF NOT EXISTS Todo_Assigned_Users (
    todo_id INT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (todo_id, user_id),
    FOREIGN KEY (todo_id) REFERENCES Todos(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Update Notes table
DROP TABLE IF EXISTS Notes;

CREATE TABLE IF NOT EXISTS Notes (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    todo_id INT NOT NULL,
    FOREIGN KEY (todo_id) REFERENCES Todos(id) ON DELETE CASCADE
);