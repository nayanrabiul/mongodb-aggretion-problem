// Import MongoClient
import {MongoClient} from 'mongodb';

const uri = 'mongodb+srv://nayan:14125114@aggretiontest.pey91eg.mongodb.net/';

async function MONGO_CONNECT() {
    const client = new MongoClient(uri);
    await client.connect();
    // Replace 'myDatabase' with the name of your database
    return client.db('aggretion_test');
}

export default MONGO_CONNECT;


