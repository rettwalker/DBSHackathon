CREATE DATABASE dbshackathon;

CREATE TABLE topics ( name varchar NOT NULL, description text, id SERIAL PRIMARY KEY );

CREATE TABLE comments (message TEXT NOT NULL, topic_id INT REFERENCES topics(id), user_id INT, id SERIAL PRIMARY KEY );
