## Connect to mongoDB

You'll need the driver in order to connect to your database and execute the queries described in this Quick Start series.
If you don't have the MongoDB Node.js Driver installed, you can install it with the following command.

`npm install mongodb`

### Connect to a MongoDB instance
place the mongoDB connection string in the db_connection.js file in the root directory of the project.

### import the connection db
make sure to import connection db at **top** in the file where you make the query.
```javascript
import MONGO_CONNECT  from "../../db_connection.js";
const db = await MONGO_CONNECT();
```
