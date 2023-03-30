import fs from "fs";
import MONGO_CONNECT from "../../db_connection.js";

const db = await MONGO_CONNECT();

const COLLECITON_NAME = 'user_rewards';

async function Main(db) {
    //drop collection
    await db.dropCollection(COLLECITON_NAME)
    //create collection and insert data
    await db.collection(COLLECITON_NAME).insertMany(
        [
            {
                "userId": 123456789,
                "rewards": [
                    {
                        "coin": "gold",
                        "amount": 25,
                        "date": ISODate("2022-11-01T09:25:23Z")
                    },
                    {
                        "coin": "bronze",
                        "amount": 100,
                        "date": ISODate("2022-11-02T11:32:56Z")
                    },
                    {
                        "coin": "silver",
                        "amount": 50,
                        "date": ISODate("2022-11-09T12:11:58Z")
                    },
                    {
                        "coin": "gold",
                        "amount": 10,
                        "date": ISODate("2022-11-15T12:46:40Z")
                    },
                    {"coin": "bronze", "amount": 75, "date": ISODate("2022-11-22T12:57:01Z")}, {
                        "coin": "gold",
                        "amount": 50,
                        "date": ISODate("2022-11-28T19:32:33Z")
                    },
                ],
            },
            {
                "userId": 987654321,
                "rewards": [
                    {"coin": "bronze", "amount": 200, "date": ISODate("2022-11-21T14:35:56Z")}, {
                        "coin": "silver",
                        "amount": 50,
                        "date": ISODate("2022-11-21T15:02:48Z")
                    }, {"coin": "silver", "amount": 50, "date": ISODate("2022-11-27T23:04:32Z")}, {
                        "coin": "silver",
                        "amount": 50,
                        "date": ISODate("2022-11-27T23:29:47Z")
                    }, {"coin": "bronze", "amount": 500, "date": ISODate("2022-11-27T23:56:14Z")},],
            },
            {
                "userId": 888888888,
                "rewards": [
                    {"coin": "gold", "amount": 500, "date": ISODate("2022-11-13T13:42:18Z")}, {
                        "coin": "platinum",
                        "amount": 5,
                        "date": ISODate("2022-11-19T15:02:53Z")
                    },
                ],
            },
        ]
    );

    // Macro function to generate a complex expression to group an array field's
    // content by the value of a field occurring in each array element, counting
    // the number of times it occurs
    function arrayGroupByCount(arraySubdocField, groupByKeyField) {
        return {
            "$map": {
                "input": {
                    "$setUnion": {
                        "$map": {
                            "input": `$${arraySubdocField}`, "in": `$$this.${groupByKeyField}`
                        }
                    }
                },
                "as": "key",
                "in": {
                    "id": "$$key", "count": {
                        "$size": {
                            "$filter": {
                                "input": `$${arraySubdocField}`, "cond": {
                                    "$eq": [`$$this.${groupByKeyField}`, "$$key"]
                                }
                            }
                        }
                    }
                }
            }
        };
    }

    // Macro function to generate a complex expression to group an array field's
    // content by the value of a field occurring in each array element, summing
    // the values from a corresponding amount field in each array element
    function arrayGroupBySum(arraySubdocField, groupByKeyField, groupByValueField) {
        return {
            "$map": {
                "input": {
                    "$setUnion": {
                        "$map": {
                            "input": `$${arraySubdocField}`, "in": `$$this.${groupByKeyField}`
                        }
                    }
                },
                "as": "key",
                "in": {
                    "id": "$$key", "total": {
                        "$reduce": {
                            "input": `$${arraySubdocField}`, "initialValue": 0, "in": {
                                "$cond": {
                                    "if": {"$eq": [`$$this.${groupByKeyField}`, "$$key"]},
                                    "then": {"$add": [`$$this.${groupByValueField}`, "$$value"]},
                                    "else": "$$value"
                                }
                            }
                        }
                    }
                }
            }
        };
    }

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
    const result = await db.collection(COLLECITON_NAME).aggregate(pipeline).toArray();
    fs.writeFileSync("./output.json", JSON.stringify(result));
    return 0;
};

await Main(db);


function ISODate(s) {
    return new Date(s).toISOString();
}