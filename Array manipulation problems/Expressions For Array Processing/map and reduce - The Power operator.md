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