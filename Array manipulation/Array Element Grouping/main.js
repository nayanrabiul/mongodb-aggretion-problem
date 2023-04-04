import fs from "fs";
import MONGO_CONNECT from "../../db_connection.js";
import {data} from "./input.js";
import {arrayGroupByCount, arrayGroupBySum} from "../macro_functions.js";

const db = await MONGO_CONNECT();

const COLLECITON_NAME = 'user_rewards';

async function Main(db) {
    //drop collection
    await db.dropCollection(COLLECITON_NAME)
    //create collection and insert data
    await db.collection(COLLECITON_NAME).insertMany(data);

    var pipeline = [
        // Capture new fields grouping elements of each array and remove unwanted fields
        {
            "$set": {
                "coinTypeAwardedCounts": arrayGroupByCount("rewards", "coin"),
                "coinTypeTotals": arrayGroupBySum("rewards", "coin", "amount"),
                "_id": "$$REMOVE",
                "rewards": "$$REMOVE",
            }
        },
    ];

    //aggregate
    const c = await db.collection(COLLECITON_NAME).aggregate(pipeline)
    const result = await c.explain("executionStats")
    if (!!result)
        console.log('pipeline executed successfully.Writting data to output.json file ...')
    await fs.writeFileSync("./output.json", JSON.stringify(result));
    console.log('Result successfully written to output.json file')
    return 0;
}

await Main(db);

