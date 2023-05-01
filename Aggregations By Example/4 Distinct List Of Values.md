# Scenario
You want to query a collection of persons where each document contains one or more languages used by the person. 
result : an alphabetically sorted list of unique languages

```js
db.persons.insertMany([
  {
    "firstname": "Elise",
    "lastname": "Smith",
    "vocation": "ENGINEER",
    "language": "English",
  },
  {
    "firstname": "Olive",
    "lastname": "Ranieri",
    "vocation": "ENGINEER",
    "language": ["Italian", "English"],
  },
  {
    "firstname": "Toni",
    "lastname": "Jones",
    "vocation": "POLITICIAN",
    "language": ["English", "Welsh"],
  },
  {
    "firstname": "Bert",
    "lastname": "Gooding",
    "vocation": "FLORIST",
    "language": "English",
  },
  {
    "firstname": "Sophie",
    "lastname": "Celements",
    "vocation": "ENGINEER",
    "language": ["Gaelic", "English"],
  },
  {
    "firstname": "Carl",
    "lastname": "Simmons",
    "vocation": "ENGINEER",
    "language": "English",
  },
  {
    "firstname": "Diego",
    "lastname": "Lopez",
    "vocation": "CHEF",
    "language": "Spanish",
  },
  {
    "firstname": "Helmut",
    "lastname": "Schneider",
    "vocation": "NURSE",
    "language": "German",
  },
  {
    "firstname": "Valerie",
    "lastname": "Dubois",
    "vocation": "SCIENTIST",
    "language": "French",
  },
])

var pipeline = [
    // Unpack each language field which may be an array or a single value
    {"$unwind": {
            "path": "$language",
        }},

    // Group by language
    {"$group": {
            "_id": "$language",
        }},

    // Sort languages alphabetically
    {"$sort": {
            "_id": 1,
        }},

    // Change _id field's name to 'language'
    {"$set": {
            "language": "$_id",
            "_id": "$$REMOVE",
        }},
];


[
    {language: 'English'},
    {language: 'French'},
    {language: 'Gaelic'},
    {language: 'German'},
    {language: 'Italian'},
    {language: 'Spanish'},
    {language: 'Welsh'}
]

```

## Observations

### Unwinding Non-Arrays. 
In some of the example's documents, the language field is an array, whilst in others, the field is a simple string value. 
The $unwind stage can seamlessly deal with both field types and does not throw an error if it encounters a non-array value. 
Instead, if the field is not an array, the stage outputs a single record using the field's string value in the same way it would if the field was an array containing 
just one element. 

### Group ID Provides Unique Values. 
By grouping on a single field and not accumulating other fields such as total or count, the output of a $group stage is just every unique group's ID, 
which in this case is every unique language.

### Unset Alternative. 
For the pipeline to be consistent with earlier examples in this book, it could have included an additional $unset stage to exclude the _id field. 
However, partly to show another way, the example pipeline used here marks the _id field for exclusion in the $set stage by being assigned the $$REMOVE variable.
