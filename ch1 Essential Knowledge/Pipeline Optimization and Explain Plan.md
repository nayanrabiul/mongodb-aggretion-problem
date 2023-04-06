### Using Explain Plans

When using the MongoDB Query Language (MQL) to develop queries, it is important to view the explain plan for a query to
determine if you've used the appropriate index and if you need to optimise other aspects of the query or the data model.
An explain plan allows you to understand fully the performance implications of the query you have created.
However, with aggregations, an explain plan even more critical because considerably more complex logic can be assembled
and run in the database.

The MongoDB database engine will do its best to apply its own aggregation pipeline optimisations at runtime.
Nevertheless, there could be some optimisations that only you can make. cause a pipeline in such a way as to risk
changing the functional behaviour and outcome of the pipeline.
But an explain plan allows you to understand the database engine's applied optimisations and detect further potential
optimisations you can manually implement in the pipeline.

#### Viewing An Explain Plan

To view the explain plan for an aggregation pipeline, you can execute commands such as the following:

As with MQL, there are three different verbosity modes that you can generate an explain plan with, as shown below:

db.coll.explain("queryPlanner").aggregate(pipeline); //(**default** if no verbosity parameter provided)
db.coll.explain("executionStats").aggregate(pipeline);// ExecutionStats verbosity
db.coll.explain("allPlansExecution").aggregate(pipeline);// AllPlansExecution verbosity


### Let assume a pipeline like this
```javascript
var pipeline = [
    // Unpack each order from customer orders array as a new separate record
    {
        "$unwind": {
            "path": "$orders",
        }
    },

    // Match on only one customer
    {
        "$match": {
            "customer_id": "tonijones@myemail.com",
        }
    },

    // Sort customer's purchases by most expensive first
    {
        "$sort": {
            "orders.value": -1,
        }
    },

    // Show only the top 3 most expensive purchases
    {"$limit": 3},

    // Use the order's value as a top level field
    {
        "$set": {
            "order_value": "$orders.value",
        }
    },

    // Drop the document's id and orders sub-document from the results
    {
        "$unset": [
            "_id",
            "orders",
        ]
    },
];
```

### Query Plan
```javascript
    //aggregate plan
const c = await db.collection(COLLECITON_NAME).aggregate(pipeline)
const result = await c.explain("queryPlanner")

  var output = { stages: [
      {
         '$cursor': {
            queryPlanner: {
               parsedQuery: {
                  customer_id: {
                     '$eq': 'tonijones@myemail.com'
                  }
               },
               winningPlan: {
                  stage: 'FETCH',
                  inputStage: {
                     stage: 'IXSCAN',
                     keyPattern: {
                        customer_id: 1
                     },
                     indexName: 'customer_id_1',
                     direction: 'forward',
                     indexBounds: {
                        customer_id: [
                           '["tonijones@myemail.com", "tonijones@myemail.com"]'
                        ]
                     }
                  }
               }
            }
         }
      },
      {
         '$unwind': {
            path: '$orders'
         }
      },
      {
         '$sort': {
            sortKey: {
               'orders.value': -1
            },
            limit: 3
         }
      },
      {
         '$set': {
            order_value: '$orders.value'
         }
      },
      {
         '$project': {
            _id: false,
            orders: false
         }
      }
   ]}
```
To optimise the aggregation, the database engine has reordered the $match to the top of the pipeline. The database engine moves the content of $match at first stage of the pipeline stages The $cursor runtime stage .
It is always the first action executed for any aggregation.

To further optimise the aggregation, the database engine has collapsed the $sort and $limit into a single specialinternal sort stage which can perform both actions in one go. 
In this situation, pipeline does not have to hold the whole data set in memory when sorting, which requiring more RAM than is available.


### executionStats
**executionStats variant is the most informative mode.**
Rather than showing just the query planner's thought process, it provides actual statistics on the execution plan (e.g.
the total keys examined, the total docs examined, etc.).
However, this isn't the default because it actually executes the aggregation in addition to formulating the query plan.
If the source collection is large or the pipeline is suboptimal, it will take a while to return the explain plan result.
```javascript
    //aggregate plan
const c = await db.collection(COLLECITON_NAME).aggregate(pipeline)
const result = await c.explain("executionStats")
const executionStats = {
   nReturned: 1,
   totalKeysExamined: 1,
   totalDocsExamined: 1,
   executionStages: {
      stage: 'FETCH',
      nReturned: 1,
      works: 2,
      advanced: 1,
      docsExamined: 1,
      inputStage: {
         stage: 'IXSCAN',
         nReturned: 1,
         works: 2,
         advanced: 1,
         keyPattern: {
            customer_id: 1
         },
         indexName: 'customer_id_1',
         direction: 'forward',
         indexBounds: {
            customer_id: [
               '["tonijones@myemail.com", "tonijones@myemail.com"]'
            ]
         },
         keysExamined: 1
      }
   }
}
```
Here, this part of the plan also shows that the aggregation uses the existing index. 
Because totalKeysExamined and totalDocsExamined match, the aggregation fully leverages this index to identify the required records, which is good news. 
Nevertheless, the targeted index doesn't necessarily mean the aggregation's query part is fully optimised. For
example, if there is the need to reduce latency further, you can do some analysis to determine if the index can
completely cover the query. Suppose the cursor query part of the aggregation is satisfied entirely using the index and
does not have to examine any raw documents. In that case, you will see totalDocsExamined: 0 in the explain plan.

## Pipeline Performance Considerations

### 1. Dealing with $sort blocking stage

To circumvent the aggregation needing to manifest the whole data set in memory or overspill to disk, 
**attempt to refactor your pipeline to incorporate one of the following approaches (*in order of most effective firs*t):**

   1. Use Index Sort. If the $sort stage does not depend on a $unwind, $group or $project stage preceding it, move the $sort
stage to near the start of your pipeline to target an index for the sort. The aggregation runtime does not need to
perform an expensive in-memory sort operation as a result. The $sort stage won't necessarily be the first stage in your
pipeline because there may also be a $match stage that takes advantage of the same index. Always inspect the explain
plan to ensure you are inducing the intended behaviour.

   2. Use Limit With Sort. If you only need the first subset of records from the sorted set of data, add a $limit stage
directly after the $sort stage, limiting the results to the fixed amount you require (e.g. 10). At runtime, the
aggregation engine will collapse the $sort and $limit into a single special internal sort stage which performs both
actions together. The in-flight sort process only has to track the ten records in memory, which currently satisfy the
executing sort/limit rule. It does not have to hold the whole data set in memory to execute the sort successfully.

   3. Reduce Records To Sort. Move the $sort stage to as late as possible in your pipeline and ensure earlier stages
significantly reduce the number of records streaming into this late blocking $sort stage. This blocking stage will have
fewer records to process and less thirst for RAM.

### 2. Dealing with $group blocking stage
To ensure you avoid excessive memory consumption when you are looking to use a $group stage, adopt the following principles:

1. Group Summary Data Only. If the use case permits it, use the group stage to accumulate things like totals, counts and
summary roll-ups only, rather than holding all the raw data of each record belonging to a group. The Aggregation
Framework provides a robust set of accumulator operators to help you achieve this inside a $group stage.

2. Avoid Unwinding & Regrouping Documents Just To Process Array Elements.
     For  example:


To bring this to life, imagine a retail orders collection where each document contains an array of products purchased
```javascript
//The retailer wants to see a report of all the orders but only containing the products priced greater than 15 dollars. 
[
   {
      _id: 1197372932325,
      products: [
         {
            prod_id: 'abc12345',
            name: 'Asus Laptop',
            price: NumberDecimal('429.99')
         }
      ]
   },
   {
      _id: 4433997244387,
      products: [
         {
            prod_id: 'def45678',
            name: 'Karcher Hose Set',
            price: NumberDecimal('23.43')
         },
         {
            prod_id: 'jkl77336',
            name: 'Picky Pencil Sharpener',
            price: NumberDecimal('0.67')
         },
         {
            prod_id: 'xyz11228',
            name: 'Russell Hobbs Chrome Kettle',
            price: NumberDecimal('15.76')
         }
      ]
   }
]

// The desired aggregation output might be:

        [
        {
           _id: 1197372932325, products: [
              {
                 prod_id: 'abc12345', name: 'Asus Laptop', price: NumberDecimal('429.99')
              }
           ]
        }, {
           _id: 4433997244387, products: [
              {
                 prod_id: 'def45678', name: 'Karcher Hose Set', price: NumberDecimal('23.43')
              },
              {
                 prod_id: 'xyz11228', name: 'Russell Hobbs Chrome Kettle', price: NumberDecimal('15.76')
              }
           ]
        }
        ]
```

One naïve way of achieving this transformation is to unwind the products array of each order document to produce an intermediate set of individual product records. 
These records can then be matched to retain products priced greater than 15 dollars. 
Finally, the products can be grouped back together again by each order's _id field.  
The required pipeline to achieve this is below:

```js
// SUBOPTIMAL PIPELINE

var pipeline = [
// Unpack each product from the each order's product as a new separate record
   {
      "$unwind": {
         "path": "$products",
      }
   },

// Match only products valued over 15.00
   {
      "$match": {
         "products.price": {
            "$gt": NumberDecimal("15.00"),
         },
      }
   },

// Group by product type
   {
      "$group": {
         "_id": "$_id",
         "products": {"$push": "$products"},
      }
   },
];
```

This pipeline is suboptimal because a $group stage has been introduced, which is a blocking stage.
Both memory consumption and execution time will increase significantly, which could be fatal for a large input data set. 
There is a far better alternative by using one of the Array Operators instead. 

Array Operators are sometimes less intuitive to code, but they avoid introducing a blocking stage into the pipeline. 
Consequently, they are significantly more efficient, especially for large data sets. 
Shown below is a far more economical pipeline, using the $filter array operator, rather than the $unwind/$match/$group combination, to produce the same outcome:

```js
// OPTIMAL PIPELINE

var pipeline = [
// Filter out products valued 15.00 or less
    {
        "$set": {
            "products": {
                "$filter": {
                    "input": "$products",
                    "as": "product",
                    "cond": {"$gt": ["$$product.price", NumberDecimal("15.00")]},
                }
            },
        }
    },
];
// cautions: this could include "empty orders"
```

To reiterate, there should never be the need to use an $unwind/$group combination in an aggregation pipeline to transform an array field's elements for each document in isolation. 
**One way to recognise this anti-pattern is if your pipeline contains a $group on a $_id field.**
Instead, use Array Operators to avoid introducing a blocking stage.


#### The primary use of an $unwind/$group combination 
is to correlate patterns across many records' arrays rather than transforming the content within each input record's array only. 
For an illustration of an appropriate use of $unwind/$group refer to this book's Unpack Array & Group Differently example.

### 3. Encourage Match Filters To Appear Early In The Pipeline 
he database engine will do its best to optimise the aggregation pipeline at runtime, with a particular focus on attempting to move the $match stages to the top of the pipeline. 
Top-level $match content will form part of the filter that the engine first executes as the initial query. 
The aggregation then has the best chance of leveraging an index. 
However, it may not always be possible to promote $match filters in such a way without changing the meaning and resulting output of an aggregation.

Sometimes, a $match stage is defined later in a pipeline to perform a filter on a field that the pipeline computed in an
earlier stage. The computed field isn't present in the pipeline's original input collection. Some examples are:

1. A pipeline where a $group stage creates a new total field based on an accumulator operator. Later in the pipeline, a
$match stage filters groups where each group's total is greater than 1000.

2. A pipeline where a $set stage computes a new total field value based on adding up all the elements of an array field in
each document. Later in the pipeline, a $match stage filters documents where the total is less than 50.

At first glance, it may seem like the match on the computed field is irreversibly trapped behind an earlier stage that
computed the field's value. Indeed the aggregation engine cannot automatically optimise this further. 
In some situations, though, there may be a missed opportunity where beneficial refactoring is possible by you, the developer.

Take the following trivial example of a collection of customer order documents:
```js

[
   {
   customer_id: 'elise_smith@myemail.com',
   orderdate: ISODate('2020-05-30T08:35:52.000Z'),
   value: NumberDecimal('9999')
   },
   {
   customer_id: 'elise_smith@myemail.com',
   orderdate: ISODate('2020-01-13T09:32:07.000Z'),
   value_cents: NumberDecimal('10101')
   }
]
```

Converts cents to dollars where the value is greater than 100 dollars like below:

```js
// SUBOPTIMAL

var pipeline = [
   {"$set": {
      "value_dollars": {"$multiply": [0.01, "$value_cents"]}, // Converts cents to dollars
      }
   },
   {
      "$unset": [
      "_id",
      "value_cents",
      ]
   },
   {
      "$match": {
      "value_dollars": {"$gte": 100}, // Peforms a dollar check
      }
   },
];

```
The collection has an index defined for the value_cents field . However, the $match filter uses a computed field,
value_dollars. When you view the explain plan, you will see the pipeline does not leverage the index. The $match is
trapped behind the $set stage (which computes the field) and cannot be moved to the pipeline's start. MongoDB's
aggregation engine tracks a field's dependencies across multiple stages in a pipeline. It can establish how far up the
pipeline it can promote fields without risking a change in the aggregation's behaviour. In this case, it knows that if
it moves the $match stage ahead of the $set stage, it depends on, things will not work correctly.

In this example, as a developer, you can easily make a pipeline modification that will enable this pipeline to be more
optimal without changing the pipeline's intended outcome. Change the $match filter to be based on the source field value
instead (greater than 10000 cents), rather than the computed field (greater than 100 dollars). Also, ensure the $match
stage appears before the $unset stage (which removes the value field). This change is enough to allow the pipeline to
run efficiently. Below is how the pipeline looks after you have made this change:

```js
// OPTIMAL

var pipeline = [
    {
        "$set": {
            "value_dollars": {"$multiply": [0.01, "$value"]},
        }
    },
    {
        "$match": { // Moved to before the $unset
            "value": {"$gte": 10000}, // Changed to perform a cents check
        }
    },
    {
        "$unset": [
            "_id",
            "value",
        ]
    },
];
```

This pipeline produces the same data output. However, when you look at its explain plan, it shows the database engine
has pushed the $match filter to the top of the pipeline and used an index on the value field. The aggregation is now
optimal because the $match stage is no longer "blocked" by its dependency on the computed field.
