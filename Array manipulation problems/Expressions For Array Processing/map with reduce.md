Reproducing $map Behaviour Using $reduce
It is possible to implement the $map behaviour using $reduce to transform an array. This method is more complex, but you may need to use it in some rare circumstances. Before looking at an example of why let's first compare a more basic example of using $map and then $reduce to achieve the same thing.

Suppose you have captured some sensor readings for a device:


db.deviceReadings.insertOne({
"device": "A1",
"readings": [27, 282, 38, -1, 187]
});
Imagine you want to produce a transformed version of the readings array, with the device’s ID concatenated with each reading in the array. You want the pipeline to produce an output similar to the following, with the newly included array field:


{
device: 'A1',
readings: [ 27, 282, 38, -1, 187 ],
deviceReadings: [ 'A1:27', 'A1:282', 'A1:38', 'A1:-1', 'A1:187' ]
}
You can achieve this using the $map operator expression in the following pipeline:


var pipeline = [
{"$set": {
"deviceReadings": {
"$map": {
"input": "$readings",
"as": "reading",
"in": {
"$concat": ["$device", ":", {"$toString": "$$reading"}]
}
}
}
}}
];

db.deviceReadings.aggregate(pipeline);
You can also accomplish the same with the $reduce operator expression in the following pipeline:


var pipeline = [
{"$set": {
"deviceReadings": {
"$reduce": {
"input": "$readings",
"initialValue": [],
"in": {
"$concatArrays": [
"$$value",
[{"$concat": ["$device", ":", {"$toString": "$$this"}]}]
]
}
}
}
}}
];

db.deviceReadings.aggregate(pipeline);
You will see the pipeline has to do more work here, holding the transformed element in a new array and then concatenating this with the "final value" array the logic is accumulating in the $$value variable.

So why would you ever want to use $reduce for this requirement and take on this extra complexity? Suppose the mapping code in the stage needs to include a condition to omit outlier readings that signify a device sensor faulty reading (i.e., a -1 reading value). The challenge here when using $map is that for 5 input array elements, 5 array elements will need to be output. However, using $reduce, for an input of 5 array elements, 4 array elements can be output using a pipeline similar to the following:


var pipeline = [
{"$set": {
"deviceReadings": {
"$reduce": {
"input": "$readings",
"initialValue": [],
"in": {
"$concatArrays": [
"$$value",
{"$cond": {
"if": {"$gte": ["$$this", 0]},
"then": [{"$concat": ["$device", ":", {"$toString": "$$this"}]}],  
"else": []
}}                                    
]
}
}
}
}}
];
This time, the output does not include the faulty device reading (`-1'):


[
{
device: 'A1',
readings: [ 27, 282, 38, -1, 187 ],
deviceReadings: [ 'A1:27', 'A1:282', 'A1:38', 'A1:187' ]
}
]
Of course, this being the aggregation framework, multiple ways exist to solve the same problem. Another approach could be to continue with the $map based pipeline and, using the $cond operator, return an empty string ('') for each faulty reading. You would then need to wrap the $map stage in a $filter stage with logic to filter out elements where the element's string length is zero.

In summary, you typically use a $map stage when the ratio of input elements to output elements is the same (i.e. many-to-many or M:M). You employ a $reduce stage when the ratio of input elements to output elements is many-to-one (i.e. M:1). For situations where the ratio of input elements is many-to-few (i.e. M:N), instead of $map, you will invariably reach for $reduce with its "null array concatenation" trick when $filter does not suffice.
