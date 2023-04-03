import fs from "fs";
import MONGO_CONNECT from "../../db_connection.js";
import {data} from "./input.js";
import {getArrayOfTwoSubdocsKeysNoDups, getDynamicField} from "../macro_functions.js";

const db = await MONGO_CONNECT();

const COLLECITON_NAME = 'deployments';

async function Main(db) {

    //drop collection
    //await db.dropCollection(COLLECITON_NAME)

    //create collection and insert data
    await db.collection(COLLECITON_NAME).insertMany(data);

    var pipeline = [
        // Compare two different arrays in the same document & get the differences (if any)
        {
            "$set": {
                "differences": {
                    "$reduce": {
                        "input": getArrayOfTwoSubdocsKeysNoDups("$beforeConfig", "$afterConfig"),
                        "initialValue": [],
                        "in": {
                            "$concatArrays": [
                                "$$value",
                                {
                                    "$cond": {
                                        "if": {
                                            "$ne": [
                                                getDynamicField("$beforeConfig", "$$this"),
                                                getDynamicField("$afterConfig", "$$this"),
                                            ]
                                        },
                                        "then": [
                                            {
                                                "field": "$$this",
                                                "change": {
                                                    "$concat": [
                                                        {"$ifNull": [{"$toString": getDynamicField("$beforeConfig", "$$this")}, "<not-set>"]},
                                                        " --> ",
                                                        {"$ifNull": [{"$toString": getDynamicField("$afterConfig", "$$this")}, "<not-set>"]},
                                                    ]
                                                },
                                            }
                                        ],
                                        "else": [],
                                    }
                                }
                            ]
                        }
                    }
                },
            }
        },

        // Add 'status' field and only show 'differences' field if there are differences
        {
            "$set": {
                // Set 'status' to ADDED, REMOVED, MODIFIED or UNCHANGED accordingly
                "status": {
                    "$switch": {
                        "branches": [
                            {
                                "case": {
                                    "$and": [
                                        {"$in": [{"$type": "$differences"}, ["missing", "null"]]},
                                        {"$in": [{"$type": "$beforeConfig"}, ["missing", "null"]]},
                                    ]
                                },
                                "then": "ADDED"
                            },
                            {
                                "case": {
                                    "$and": [
                                        {"$in": [{"$type": "$differences"}, ["missing", "null"]]},
                                        {"$in": [{"$type": "$afterConfig"}, ["missing", "null"]]},
                                    ]
                                },
                                "then": "REMOVED"
                            },
                            {"case": {"$lte": [{"$size": "$differences"}, 0]}, "then": "UNCHANGED"},
                            {"case": {"$gt": [{"$size": "$differences"}, 0]}, "then": "MODIFIED"},
                        ],
                        "default": "UNKNOWN",
                    }

                },

                // If there are differences, keep the differences field, otherwise remove it
                "differences": {
                    "$cond": [
                        {
                            "$or": [
                                {"$in": [{"$type": "$differences"}, ["missing", "null"]]},
                                {"$lte": [{"$size": "$differences"}, 0]},
                            ]
                        },
                        "$$REMOVE",
                        "$differences"
                    ]
                },
            }
        }
        //
        //     // Remove unwanted fields
        //     {
        //         "$unset": [
        //             "_id",
        //             "beforeTimestamp",
        //             "afterTimestamp",
        //             "beforeConfig",
        //             "afterConfig",
        //         ]
        //     },
    ];


//aggregate
    const result = await db.collection(COLLECITON_NAME).aggregate(pipeline).toArray();
    if (!!result)
        console.log('pipeline executed successfully.Writting data to output.json file ...')
    await fs.writeFileSync("./output.json", JSON.stringify(result));
    console.log('Result successfully written to output.json file')
    return 0;
}

await Main(db);



