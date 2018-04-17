CREATE TABLE users (id SERIAL PRIMARY KEY, email varchar UNIQUE NOT NULL , first_name varchar NOT NULL, last_name varchar NOT NULL, password varchar NOT NULL );

CREATE TABLE topics ( name varchar UNIQUE NOT NULL, description text, id SERIAL PRIMARY KEY );

CREATE TABLE comments (message TEXT NOT NULL, topic_id INT REFERENCES topics(id), user_id INT REFERENCES users(id), id SERIAL PRIMARY KEY );
