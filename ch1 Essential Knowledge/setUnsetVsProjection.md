
in MongoDB's Query Language (MQL) to define or restrict fields we use projection.

in most cases, are preferable to using $project for declaring field inclusion and exclusion.
How these works and guidance on when to use $set & $unset stages is described in the section

### When To Use Set & Unset
you should always look to use $set (or $addFields) and $unset for field inclusion and exclusion, rather than $project.
The main exception is  requirement for a very different structure for result documents, where you only need to retain a small subset of the input fields.


#### $addFields
$addFields has same behaviour as $set.
$set is actually just an alias for $addFields.
$set and $unset , their counter purposes are obvious to deduce by their names ($set Vs $unset).
The name $addFields doesn't fully reflect that you can modify existing fields rather than just adding new fields.


## Examples

#### input
```javascript
// INPUT  (a record from the source collection to be operated on by an aggregation)
const input = {
  _id: ObjectId("6044faa70b2c21f8705d8954"),
  card_name: "Mrs. Jane A. Doe",
  card_num: "1234567890123456",
  card_expiry: "2023-08-31T23:59:59.736Z",
  card_sec_code: "123",
  card_provider_name: "Credit MasterCard Gold",
  transaction_id: "eb1bd77836e8713656d9bf2debba8900",
  transaction_date: ISODate("2021-01-13T09:32:07.000Z"),
  transaction_curncy_code: "GBP",
  transaction_amount: NumberDecimal("501.98"),
  reported: true
}
``` 

#### output
```javascript
// OUTPUT  (a record in the results of the executed aggregation)const 
output = 
    {
        card_name: "Mrs. Jane A. Doe",
        card_num: "1234567890123456",
        card_expiry: ISODate("2023-08-31T23:59:59.736Z"), // Field type converted from text
        card_sec_code: "123",
        card_provider_name: "Credit MasterCard Gold",
        transaction_id: "eb1bd77836e8713656d9bf2debba8900",
        transaction_date: ISODate("2021-01-13T09:32:07.000Z"),
        transaction_curncy_code: "GBP",
        transaction_amount: NumberDecimal("501.98"),
        reported: true,
        card_type: "CREDIT"                               // New added literal value field
    }
```

#### using project
```javascript

//using project
// BAD
const project = [
        {"$project": {
                // Modify a field + add a new field
                "card_expiry": {"$dateFromString": {"dateString": "$card_expiry"}},
                "card_type": "CREDIT",

                // Must now name all the other fields for those fields to be retained
                "card_name": 1,
                "card_num": 1,
                "card_sec_code": 1,
                "card_provider_name": 1,
                "transaction_id": 1,
                "transaction_date": 1,
                "transaction_curncy_code": 1,
                "transaction_amount": 1,
                "reported": 1,

                // Remove _id field
                "_id": 0,
            }},
]

//using project
// GOOD
const setUnser =

    [
        {"$set": {
                // Modified + new field
                "card_expiry": {"$dateFromString": {"dateString": "$card_expiry"}},
                "card_type": "CREDIT",
            }},

        {"$unset": [
                // Remove _id field
                "_id",
            ]},
    ]
```


### When To Use $project
```javascript
// OUTPUT  (a record in the results of the executed aggregation)
const input = {
    transaction_info: {
        date: ISODate("2021-01-13T09:32:07.000Z"),
        amount: NumberDecimal("501.98")
    },
    status: "REPORTED"
}


// BAD
const pipeline = [
    {
        "$set": {
// Add some fields
            "transaction_info.date": "$transaction_date",
            "transaction_info.amount": "$transaction_amount",
            "status": {"$cond": {"if": "$reported", "then": "REPORTED", "else": "UNREPORTED"}},
        }
    },

    {
        "$unset": [
// Remove _id field
            "_id",

            // Must name all other existing fields to be omitted
            "card_name",
            "card_num",
            "card_expiry",
            "card_sec_code",
            "card_provider_name",
            "transaction_id",
            "transaction_date",
            "transaction_curncy_code",
            "transaction_amount",
            "reported",
        ]
    },
]


// GOOD
const pipelineusingSetUnset = [
    {
        "$project": {
// Add some fields
            "transaction_info.date": "$transaction_date",
            "transaction_info.amount": "$transaction_amount",
            "status": {"$cond": {"if": "$reported", "then": "REPORTED", "else": "UNREPORTED"}},

            // Remove _id field
            "_id": 0,
        }
    },
]
```
