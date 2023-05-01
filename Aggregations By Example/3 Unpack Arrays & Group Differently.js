import MONGO_CONNECT from "../db_connection.js";

import {ISODate, NumberDecimal} from "../lib.js";


const db = await MONGO_CONNECT();
const COLLECITON_NAME = 'orders';

async function Main(db) {
    //create collection and insert data
    const order = [
        {
            "order_id": 6363763262239,
            "products": [
                {
                    "prod_id": "abc12345",
                    "name": "Asus Laptop",
                    "price": NumberDecimal("431.43"),
                },
                {
                    "prod_id": "def45678",
                    "name": "Karcher Hose Set",
                    "price": NumberDecimal("22.13"),
                },
            ],
        },
        {
            "order_id": 1197372932325,
            "products": [
                {
                    "prod_id": "abc12345",
                    "name": "Asus Laptop",
                    "price": NumberDecimal("429.99"),
                },
            ],
        },
        {
            "order_id": 9812343774839,
            "products": [
                {
                    "prod_id": "pqr88223",
                    "name": "Morphy Richardds Food Mixer",
                    "price": NumberDecimal("431.43"),
                },
                {
                    "prod_id": "def45678",
                    "name": "Karcher Hose Set",
                    "price": NumberDecimal("21.78"),
                },
            ],
        },
        {
            "order_id": 4433997244387,
            "products": [
                {
                    "prod_id": "def45678",
                    "name": "Karcher Hose Set",
                    "price": NumberDecimal("23.43"),
                },
                {
                    "prod_id": "jkl77336",
                    "name": "Picky Pencil Sharpener",
                    "price": NumberDecimal("0.67"),
                },
                {
                    "prod_id": "xyz11228",
                    "name": "Russell Hobbs Chrome Kettle",
                    "price": NumberDecimal("15.76"),
                },
            ],
        },
    ]
    const a =
        {
            "order_id": 6363763262239,
            "products": [
                {
                    "prod_id": "abc12345",
                    "name": "Asus Laptop",
                    "price": NumberDecimal("431.43"),
                },
                {
                    "prod_id": "def45678",
                    "name": "Karcher Hose Set",
                    "price": NumberDecimal("22.13"),
                },
            ],
        }
    // await db.dropCollection(COLLECITON_NAME)
    // await db.collection(COLLECITON_NAME).insertMany(order);

    var pipeline = [
        {
            $unwind: {
                path: '$products'
            }
        },
        {
            $match: {
                "products.price": {
                    $gt: 15
                }
            }
        },
        {
        $group:{
            _id:'$products.prod_id',
            total:{$sum:1},
            total_value:{$sum:'$products.price'}
        }
        }

    ]

    //aggregate
    const result = await db.collection(COLLECITON_NAME).aggregate(pipeline).toArray();
    console.log(result)

    return 0;
}

await Main(db);


