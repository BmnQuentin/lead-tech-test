CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255),
  password VARCHAR(255),
  name VARCHAR(255)
);

CREATE TABLE drawings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  title VARCHAR(255),
  points TEXT,
  surface FLOAT
);
