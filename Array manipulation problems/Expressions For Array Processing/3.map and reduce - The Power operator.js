import MONGO_CONNECT from "../../db_connection.js";

const db = await MONGO_CONNECT();
const COLLECITON_NAME = 'orders';

async function Main(db) {

    //drop collection if exists
    // await db.dropCollection(COLLECITON_NAME)

    //create collection and insert data
    let order = {
        "orderId": "AB12345",
        "products": ["Laptop", "Kettle", "Phone", "Microwave"]
    };
    // db.collection(COLLECITON_NAME).insertOne(order);

    var map_example_pipeline = [
        {
            $set: {
                products: {
                    $map: {
                        input: '$products',
                        in: {$toUpper: "$$this"}

                    }
                }
            }
        }
    ];
    var reducer_example_pipeline = [{
        $set: {
            productList: {
                $reduce: {
                    initialValue: '',
                    input: '$products',
                    in: {
                        $concat: ['$$value', "$$this", " "]
                    }
                }
            }
        }
    }]


    //aggregate
    // const result1 = await db.collection(COLLECITON_NAME).aggregate(map_example_pipeline).toArray();
    const result2 = await db.collection(COLLECITON_NAME).aggregate(reducer_example_pipeline).toArray();
    console.log(result2)

    return 0;
}

await Main(db);


