# Introduuction
This repository contains a collection of MongoDB aggregation problems. The problems are divided into different levels of difficulty, from beginner to advanced. Each problem has a corresponding solution, which is provided in the form of a MongoDB aggregation pipeline.

The purpose of this repository is to provide a resource for learning about MongoDB aggregation. The problems are designed to challenge and stretch your understanding of aggregation. The solutions can be used as a reference when you are working on your own MongoDB aggregation problems.

If you are new to MongoDB aggregation, I recommend starting with the beginner problems. As you become more comfortable with aggregation, you can move on to the intermediate and advanced problems.

I hope you find this repository helpful!

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
