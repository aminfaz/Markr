# Markr

## Description
API to ingest &amp; process test results. The application has following capabilities.

### Import Data
This application will consume specific format of XML in order to import test result taken for a given student in a given test.
The application is very strict with the payload and if there is any part of payload does not comply with the expected structure, the whole payload will be ignored.
Tha API is capable of processing same payload multiple times and this will not result in duplicate records.

### Aggregate Data for reporting
The application is capable of reporting the aggregate result for a given test. Since this is a frequent request the aggregate data have been precalculated for better user experience.

## Notes
### Assumptions
- Authorization is NOT required
- Tests are identified by the ID
- Students are identified by the Student Number and First name and Last name
- If a new data for an existing test result received.
    * if the available marks is greater than or equal the existing available marks the higher number will be considered.
    * if the available marks is less than the existing available marks this will be considered as a error in payload and the payload will be rejected.
- The Application is not supporting the query for result for specific student, hence the students are not extracted from the tests document.If this becomes a requirement in future the persistance layer need to be changed to cater this with good performance.
- If the same test result exists for the same student
    * if the obtained mark is higher or equal in the new payload, the higher obtained marks will be considered.
    * if the obtained mark is less than the existing obtained mark, this will be considered as a error in payload and the payload will be rejected.
- If payload has a test result for a student and another payload for the same test received while the student number is the same and either of the first or last name are not, then the payload will not be processed.

### Approach Taken
- mongoDB has been chosen for the persistance layer of this application and test results have been saved as documents
- Node.js and express are chosen for the development of the API.
- Each component of this application is in a container and a docker-compose file is provided for deployment of this application
- For compatibility purpose the Test ID and Student Number have been considered to be string
- For better user experience, after importing the results, the user will receive the success message while the application is calculating the aggregate values for all of the newly created tests or any updated ones.

## How to use?

### Production
Running the following command will create a database and also the backend.
```
docker-compose -f "docker-compose.yml" up -d --build
```
- The database is accessible on (mongodb://localhost:27018)
- The API will be accessible on (http://localhost:8080)

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
To execute unit tests only, run the following command
```
cd ./backend/
npm run utest
```
To execute integration tests only, run the following command
```
cd ./backend/
npm run itest
```
## API Reference
Please refer to our full API documentation on [Swagger](https://app.swaggerhub.com/apis-docs/amin-fazl/Markr/v1#/default/post_import)

## Tech/framework used
- [Node.js](https://nodejs.org/en/)
- [Express](https://expressjs.com)
- [mongoDB](https://www.mongodb.com)
- [mongoose](https://mongoosejs.com/)
