# Markr

## Description
API to ingest &amp; process test results.

## Assumptions

## How to use?

### Production
Running the following command will create a database and also the backend.
```
docker-compose -f "docker-compose.yml" up -d --build
```
The database is accessible on (mongodb://localhost:27018)
The API will be accessible on (http://localhost:8080)

### Development
Running the following command will create a database for development.
```
docker-compose -f "docker-compose.debug.yml" up -d --build
```
The database is accessible on (mongodb://localhost:27018)

To run the API in development mode use following commands
```
cd ./backend/
npm start
```
or with nodemon
```
cd ./backend/
nodemon index.js
```

The API will be accessible on (http://localhost:3000)

#### Unit Tests
In this project there are combination of Unit and Integration tests, for this purpose please make sure that the database is running in the back ground.
```
docker-compose -f "docker-compose.debug.yml" up -d --build
```
The database is accessible on (mongodb://localhost:27018)

To execute tests, run the following command
```
cd ./backend/
npm test
```

## API Reference
Please refer to our full API documentation on [Swagger](https://app.swaggerhub.com/apis-docs/amin-fazl/Markr/v1#/default/post_import)

## Tech/framework used
- [Node.js](https://nodejs.org/en/)
- [Express](https://expressjs.com)
- [mongoDB](https://www.mongodb.com)
- [mongoose](https://mongoosejs.com/)