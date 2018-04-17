```
version: '3'
services:
  db:
    image: "rettwalker/dbshackathon_db"
    container_name: dbshackathon_db
    environment:
      - POSTGRES_PASSWORD=securepassword
      - POSTGRES_USER=postgres
      - POSTGRES_DB=dbshackathon
  server:
    image: "rettwalker/dbshackathon_server"
    container_name: dbshackathon_server
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgres://postgres:securepassword@db/dbshackathon
    ports:
      - "3000:3000"
```
place this into a `docker-compose.yml` file and run docker-compose up and you can run the server and db
