When you want to transform or extract data from an array , and a single high-level array operator (e.g. $avg, $max, $filter) does not give you what you need, the tools to turn to are the $map and $reduce array operators. 
These two "power" operators enable you to iterate through an array, perform whatever complexity of logic you need against each array element and collect together the result for inclusion in a stage's output.

The $map and $reduce operators are the "swiss army knives" of the Aggregation Framework. 
Depending on your specific requirements, you would use one or the other to process an array's field, but not both together. Here's an explanation of these two "power" operators:

#### map
$map. Allows you to specify some logic to perform against each element in the array that the operator iterates, returning an array as the final result. 
Typically you use $map to mutate each array member and then return this transformed array. The $map operator exposes the current array element's content to your logic via a special variable, with the default name of $$this.
#### reduce
$reduce. Similarly, you can specify some logic to execute for each element in an array that the operator iterates but instead returning a single value (rather than an array) as the final result. 
You typically use $reduce to compute a summary having analysed each array element. 
For example, you might want to return a number by multiplying together a specific field value from each array's element.
Like the $map operator, the $reduce operator provides your logic with access to the current array element via the variable $$this. 
The operator also provides a second variable, called $$value, for your logic to update when accumulating the single result (e.g. the multiplication result).
The rest of this chapter explores how these two "power" operators are used to manipulate arrays.

# map
### "For-Each" Looping To Transform An Array
Imagine you wanted to process a list of the products ordered by a customer and convert the array of product names to upper case. 
In a procedural style of JavaScript, you might write the following code to loop through each product in the array and convert its name to upper case:

```js
let order = {
"orderId": "AB12345",
"products": ["Laptop", "Kettle", "Phone", "Microwave"]
};


// Procedural style JavaScript
for (let pos in order.products) {
order.products[pos] = order.products[pos].toUpperCase();
}

//This code modifies the order’s product names to the following, with the product names now in uppercase:
{orderId: 'AB12345', products: ['LAPTOP', 'KETTLE', 'PHONE', 'MICROWAVE']}
```


To achieve a similar outcome in an aggregation pipeline, you might use the following:

```js
db.orders.insertOne(order);

var pipeline = [
    {
        "$set": {
                "products": {
                            "$map": {
                                "input": "$products",
                                "as": "product",
                                "in": {"$toUpper": "$$product"}
                           }
        }
    }
    }
];

db.orders.aggregate(pipeline);

//This pipeline produces the following output with the order document transformed to:
{orderId: 'AB12345', products: ['LAPTOP', 'KETTLE', 'PHONE', 'MICROWAVE']}
```

Here, a $map operator expression is applied to loop through each product name in the input products array and add the upper case version of the product name to the replacement output array.
Using functional style in JavaScript, your looping code would more closely resemble the following to achieve the same outcome:

```js
// Functional style JavaScript
order.products = order.products.map(
    product => {
    return product.toUpperCase();
    }
);
```
Comparing an aggregation $map operator expression to a JavaScript map() array function is far more illuminating to help explain how the operator works.




# reduce
### "For-Each" Looping To Compute A Summary Value From An Array
Suppose you wanted to process a list of the products ordered by a customer but produce a single summary string field from this array by concatenating all the product names from the array. 
In a procedural JavaScript style, you could code the following to produce the product names summary field:

```js

let order = {
    "orderId": "AB12345",
    "products": ["Laptop", "Kettle", "Phone", "Microwave"]
};

// Procedural style JavaScript
order.productList = "";
for (const pos in order.products) {
    order.productList += order.products[pos] + "; ";
}
//This code yields the following output with a new productList string field produced, which contains the names of all the products in the order, delimited by semi-colons:
const output = {
    orderId: 'AB12345',
    products: ['Laptop', 'Kettle', 'Phone', 'Microwave'],
    productList: 'Laptop; Kettle; Phone; Microwave; '
}


//You can use the following pipeline to achieve a similar outcome:
db.orders.insertOne(order);
var pipeline = [
    {
        "$set": {
            "productList": {
                "$reduce": {
                    "input": "$products",
                    "initialValue": "",
                    "in": {
                        "$concat": ["$$value", "$$this", "; "]
                    }
                }
            }
        }
    }
];
db.orders.aggregate(pipeline);
//Here, a $reduce operator expression loops through each product in the input array and concatenates each product’s name into an accumulating string. 
// You use the $$this expression to access the current array element's value during each iteration. For each iteration, you employ the $$value expression to reference the final output value, to which you append the current product string (+ delimiter).

//This pipeline produces the following output where it transforms the order document to:
const output = {
    orderId: 'AB12345',
    products: ['Laptop', 'Kettle', 'Phone', 'Microwave'],
    productList: 'Laptop; Kettle; Phone; Microwave; '
}

//Using a functional approach in JavaScript, you could have used the following code to achieve the same result:
// Functional style JavaScript
order.productList = order.products.reduce(
    (previousValue, currentValue) => {
        return previousValue + currentValue + "; ";
    },
    ""
);
//Once more, by comparing the use of the aggregation operator expression ($reduce) to the equivalent JavaScript array function (reduce()), the similarity is more pronounced.
```






### "For-Each" Looping To Locate An Array Element
Imagine storing data about buildings on a campus where each building document contains an array of rooms with their sizes (width and length).
A room reservation system may require finding the first room in the building with sufficient floor space for a particular number of meeting attendees.
Below is an example of one building's data you might load into the database, with its array of rooms and their dimensions in metres:

```js
db.buildings.insertOne(
    {
        "building": "WestAnnex-1",
        "room_sizes": [
            {"width": 9, "length": 5},
            {"width": 8, "length": 7},
            {"width": 7, "length": 9},
            {"width": 9, "length": 8},
        ]
    }
);
```
You want to create a pipeline to locate an appropriate meeting room that produces an output similar to the following.
The result should contain a newly added field, firstLargeEnoughRoomArrayIndex, to indicate the array position of the first room found to have enough capacity.

```js

const output = {
    building: 'WestAnnex-1',
    room_sizes: [
        { width: 9, length: 5 },
        { width: 8, length: 7 },
        { width: 7, length: 9 },
        { width: 9, length: 8 }
    ],
    firstLargeEnoughRoomArrayIndex: 2
}
```

Below is a suitable pipeline that iterates through the room array elements capturing the position of the first one with a calculated area greater than 60m²:
```js
var pipeline = [{
    "$set": {
        "firstLargeEnoughRoomArrayIndex": {
            "$reduce": {
                "input": {
                    "$range": [0, {"$size": "$room_sizes"}]}, 
                    "initialValue": -1, 
                    "in": {
                        "$cond": {
                            "if": {
                                "$and": [
                                    // IF ALREADY FOUND DON'T CONSIDER SUBSEQUENT ELEMENTS
                                    {"$lt": ["$$value", 0]},
                                    // IF WIDTH x LENGTH > 60
                                    {
                                        "$gt": [
                                                {
                                                    "$multiply": [
                                                        {
                                                            "$getField": {
                                                                "input": {"$arrayElemAt": ["$room_sizes", "$$this"]}, "field": "width"
                                                            }
                                                        },
                                                        {
                                                            "$getField": {
                                                                "input": {"$arrayElemAt": ["$room_sizes", "$$this"]}, "field": "length"
                                                            }
                                                        },
                                                    ]                                        
                                                },
                                            60
                                        ]
                                    }]
                            },
                            // IF ROOM SIZE IS BIG ENOUGH CAPTURE ITS ARRAY POSITION
                            "then": "$$this",
                            // IF ROOM SIZE NOT BIG ENOUGH RETAIN EXISTING VALUE (-1)
                            "else": "$$value"
                        }
                    }
            }
        }
    }
}];
db.buildings.aggregate(pipeline);
```

 However, the pipeline uses a generated sequence of incrementing numbers for its input rather than the existing array field in each source document. 
 The $range operator is used to create this sequence which has the same size as the rooms array field of each document. 
 The pipeline uses this approach to track the array position of the matching room using the $$this variable. 
 For each iteration, the pipeline calculates the array room element's area. If the size is greater than 60, the pipeline assigns the current array position (represented by $$this) to the final result (represented by $$value).

The "iterator" array expressions have no concept of a break command that procedural programming languages typically provide. 
Therefore, even though the executing logic may have already located a room of sufficient size, the looping process will continue through the remaining array elements. 
Consequently, the pipeline logic must include a check during each iteration to avoid overriding the final value (the $$value variable) if it already has a value. 
Naturally, for massive arrays containing a few hundred or more elements, an aggregation pipeline will incur a noticeable latency impact when iterating the remaining array members even though the logic has already identified the required element.

Suppose you just wanted to return the first matching array element for a room with sufficient floor space, not its index. 
In that case, the pipeline can be more straightforward, using $filter to trim the array elements to only those with sufficient space and then the $first operator to grab just the first element from the filter. 
You would use a pipeline similar to the following:

```js
var pipeline = [
    {"$set": {
            "firstLargeEnoughRoom": {
                "$first": {
                    "$filter": {
                        "input": "$room_sizes",
                        "as": "room",
                        "cond": {
                            "$gt": [
                                {"$multiply": ["$$room.width", "$$room.length"]},
                                60
                            ]
                        }
                    }
                }
            }
        }}
];
db.buildings.aggregate(pipeline);

//This pipeline produces the following output:
   const output =  [
        {
            _id: ObjectId("637b4b8a86fac07908ef98b3"),
            building: 'WestAnnex-1',
            room_sizes: [
                { width: 9, length: 5 },
                { width: 8, length: 7 },
                { width: 7, length: 9 },
                { width: 9, length: 8 }
            ],
            firstLargeEnoughRoom: { width: 7, length: 9 }
        }
    ]


// In reality, the array of rooms would be likely to also include an ID for each building's room, for example:

"room_sizes": [
    {"roomId": "Mercury", "width": 9, "length": 5},
    {"roomId": "Venus", "width": 8, "length": 7},
    {"roomId": "Jupiter", "width": 7, "length": 9},
    {"roomId": "Saturn", "width": 9, "length": 8},
]

```
Consequently, firstLargeEnoughRoom: { roomId: "Jupiter", width: 7, length: 9 } would be the first element returned from the filtering pipeline stage, 
giving you the room's ID, so there would be no need to obtain the array's index for this particular use case. 
However, the previous example, using the $reduce based pipeline, is helpful for more complicated situations where you do need the index of the matching array element.
