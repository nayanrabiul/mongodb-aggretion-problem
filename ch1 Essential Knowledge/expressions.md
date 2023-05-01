Expressions give aggregation pipelines their data manipulation power. 
Proficiency in aggregation pipelines demands a deeper understanding of expressions.

Aggregation expressions come in one of three primary flavours:

1. **Operators** .$ prefix followed by the operator function name as the main key for the object.  Examples: {$sort: ...}, {$cond: ...}, {$dateToString: ...}
2. **Field** Paths. Accessed as a string with a $ prefix followed by the field's path **in each record being processed**.  Examples: "$account.sortcode", "$addresses.address.city".
   but when using match does not use $ .
   {
      $match: {
         "products.price": {
         $gt: 15
         }
      }
   }
3. **Variables**. Accessed as a string with a $$ prefix followed by the fixed name and falling into three sub-categories:
   1. Context System Variables. With values coming from the system environment rather than each input record an aggregation stage is processing.  Examples: "$$NOW", "$$CLUSTER_TIME"
   2. Marker Flag System Variables. To indicate desired behaviour to pass back to the aggregation runtime.  Examples:  "$$REMOVE", "$$ROOT", "$$PRUNE"
   3. Bind User Variables. For storing values you declare with a $let operator (or with the let option of a $lookup stage, or as option of a $map or $filter stage).  Examples: "$$product_name_var", "$$orderIdVal"

You can combine these three categories of aggregation expressions when operating on input records, 
enabling you to perform complex comparisons and transformations of data. 
To highlight this, the code which combines all three expressions.
```json
{
  "customer_info": {
    "$cond": {
      "if": {
        "$eq": [
          "$customer_info.category",
          "SENSITIVE"
        ]
      },
      "then": "$$REMOVE",
      "else": "$customer_info"
    }
  }
}
```


#### What Do Expressions Produce?
expression (e.g. {$concat: ...}), a Variable (e.g. "$$ROOT") or a Field Path (e.g. "$address") populates and returns a new JSON/BSON data type element, which can be one of:

1. a Number  (including integer, long, float, double, decimal128)
2. a String  (UTF-8)
3. a Boolean
4. a DateTime  (UTC)
5. an Array
6. an Object: A Field Path (e.g. "$address") is different and can return an element of any data type.For example, suppose "$address" references a sub-document. In this case, it will return an Object. However, if it references a list of elements, it will return an Array. As a human, you can guess that the Field Path "$address" won't return a DateTime, but the aggregation runtime does not know this ahead of time. There could be even more dynamics at play. Due to MongoDB's flexible data model, "$address" could yield a different type for each record processed in a pipeline stage. The first record's address may be an Object sub-document with street name and city fields. The second record's address might represent the full address as a single String.

In summary, Field Paths and Bind User Variables are expressions that can return any JSON/BSON data type at runtime depending on their context. 
For the other kinds of expressions (Operators, Context System Variables and Marker Flag System Variables), 
the data type each can return is fixed to one or a set number of documented types. 


### Question: Can aggregation expressions be used within any type of pipeline stage?
Answer: No

There are many types of stages in the Aggregation Framework that don't allow expressions to be embedded. 
Examples of some of the most commonly used of these stages are:
$limit
$skip
$sort
$count
$lookup
$out


### What Is Using $expr Inside $match All About?

#### Restrictions When Using Expressions with $match
its better to use index for match.
Due to the potential challenges outlined, only use a $expr operator in a $match stage if there is no other way of assembling the filter criteria using regular MQL syntax.

What if you wanted to run an aggregation pipeline to only return rectangles with an area greater than 12? 
```js

[
   { _id: 1, width: 2, height: 8 },
   { _id: 2, width: 3, height: 4 },
   { _id: 3, width: 20, height: 1 }
]

var pipeline = [
   {
   "$match": {
   "$expr": {"$gt": [{"$multiply": ["$width", "$height"]}, 12]},
   }
   },
];

//The result of executing an aggregation with this pipeline is:

[
   { _id: 1, width: 2, height: 8 },
   { _id: 3, width: 20, height: 1 }
]
```

