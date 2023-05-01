import MONGO_CONNECT from "../db_connection.js";

import {ISODate, NumberDecimal} from "../lib.js";


const db = await MONGO_CONNECT();
const COLLECITON_NAME = 'persons';

async function Main(db) {
    //create collection and insert data
    const order = [
        {
            "firstname": "Elise",
            "lastname": "Smith",
            "vocation": "ENGINEER",
            "language": "English",
        },
        {
            "firstname": "Olive",
            "lastname": "Ranieri",
            "vocation": "ENGINEER",
            "language": ["Italian", "English"],
        },
        {
            "firstname": "Toni",
            "lastname": "Jones",
            "vocation": "POLITICIAN",
            "language": ["English", "Welsh"],
        },
        {
            "firstname": "Bert",
            "lastname": "Gooding",
            "vocation": "FLORIST",
            "language": "English",
        },
        {
            "firstname": "Sophie",
            "lastname": "Celements",
            "vocation": "ENGINEER",
            "language": ["Gaelic", "English"],
        },
        {
            "firstname": "Carl",
            "lastname": "Simmons",
            "vocation": "ENGINEER",
            "language": "English",
        },
        {
            "firstname": "Diego",
            "lastname": "Lopez",
            "vocation": "CHEF",
            "language": "Spanish",
        },
        {
            "firstname": "Helmut",
            "lastname": "Schneider",
            "vocation": "NURSE",
            "language": "German",
        },
        {
            "firstname": "Valerie",
            "lastname": "Dubois",
            "vocation": "SCIENTIST",
            "language": "French",
        },
    ]

    // await db.dropCollection(COLLECITON_NAME)
    //  await db.collection(COLLECITON_NAME).insertMany(order);

    var pipeline = [
        {
            $unwind:'$language'
        },
        {
            $group:{
                _id:"$language"
            }
        },
        {
            $project:{
                language:"$_id",
                _id:0
            }
        }
    ]

    //aggregate
    const result = await db.collection(COLLECITON_NAME).aggregate(pipeline).toArray();
    console.log(result)

    return 0;
}

await Main(db);


