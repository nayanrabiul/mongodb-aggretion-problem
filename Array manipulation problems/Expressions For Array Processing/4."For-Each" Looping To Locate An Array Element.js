import MONGO_CONNECT from "../../db_connection.js";

const db = await MONGO_CONNECT();
const COLLECITON_NAME = 'buildings';

async function Main(db) {

    //drop collection if exists
    //await db.dropCollection(COLLECITON_NAME)

    //create collection and insert data
    let buildings = {
        "building": "WestAnnex-1",
        "room_sizes": [
            {"width": 9, "length": 5},
            {"width": 8, "length": 7},
            {"width": 7, "length": 9},
            {"width": 9, "length": 8},
        ]
    }
    //db.collection(COLLECITON_NAME).insertOne(buildings);

    //double if condition to get index
    const pipeline1 = [
        {
            $set: {
                firstLargeEnoughRoomArrayIndex: {
                    $reduce: {
                        input: {$range: [0, {$size: '$room_sizes'}]},
                        initialValue: -1,
                        in: {
                            $cond: {
                                if: {
                                    $lt: ['$$value', 0]
                                },
                                then: {
                                    $cond: {
                                        if: {
                                            //cheack if size gt than 60
                                            $gt: [
                                                {
                                                    $multiply: [
                                                        {
                                                            $getField: {
                                                                input: {$arrayElemAt: ["$room_sizes", "$$this"]},
                                                                "field": "width"
                                                            }
                                                        },
                                                        {
                                                            $getField: {
                                                                input: {$arrayElemAt: ["$room_sizes", "$$this"]},
                                                                "field": "length"
                                                            }
                                                        }
                                                    ]
                                                },
                                                60
                                            ]
                                        },
                                        //set initial value
                                        then: '$$this',
                                        else: '$$value'
                                    }
                                },
                                else: '$$value'

                            }
                        }
                    }
                }
            }
        }]

    //using and with single if to get index
    const pipeline2 = [
        {
            $set: {
                firstLargeEnoughRoomArrayIndex: {
                    $reduce: {
                        input: {$range: [0, {$size: '$room_sizes'}]},
                        initialValue: -1,
                        in: {
                            $cond: {
                                if: {
                                    $and: [
                                        {$lt: ['$$value', 0]},
                                        {
                                            //cheack if size gt than 60
                                            $gt: [
                                                {
                                                    $multiply: [
                                                        {
                                                            $getField: {
                                                                input: {$arrayElemAt: ["$room_sizes", "$$this"]},
                                                                "field": "width"
                                                            }
                                                        },
                                                        {
                                                            $getField: {
                                                                input: {$arrayElemAt: ["$room_sizes", "$$this"]},
                                                                "field": "length"
                                                            }
                                                        }
                                                    ]
                                                },
                                                60
                                            ]
                                        },
                                    ]
                                },
                                then: '$$this',
                                else: '$$value'
                            }
                        }
                    }
                }
            }
        }]

    //using $first with $filter to get items
    const pipeline3 = [
        {
            $set: {
                firstLargeEnoughRoomElement: {
                    $first: {
                        $filter: {
                            input: '$room_sizes',
                            cond: {
                                $gt: [
                                    {
                                        $multiply: ["$$this.width", "$$this.length"]
                                    },
                                    60
                                ]
                            }
                        }
                    }
                }
            }
        }
    ]


    //aggregate
    const result = await db.collection(COLLECITON_NAME).aggregate(pipeline3).toArray();
    console.log(result)

    return 0;
}

await Main(db);


