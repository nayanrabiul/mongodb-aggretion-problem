One of the most compelling aspects of MongoDB is the ability to embed arrays within documents. 
Unlike relational databases, this characteristic typically allows each entity's entire data structure to exist in one place as a document. 
Documents better represent "real-world" objects and how developers think about such entities. 
When writing code to interact with the stored data, this intuitive data representation reduces the cognitive load on developers, enabling them to deliver new application capabilities quicker.

The Aggregation Framework provides a rich set of aggregation operator expressions for analysing and manipulating arrays. 
When optimising for performance, these array expressions are critical to avoid unwinding and regrouping documents where you only need to process each document's array in isolation. 
For most situations when you need to manipulate an array, there is usually a single array operator expression that you can turn to solve your requirement.

Occasionally, you may still need to assemble a composite of multiple lower-level expressions to handle a challenging array manipulation task. 
These situations are the most difficult aspect for anyone using the Aggregation Framework. As a result, this chapter endeavours to bootstrap the knowledge you will require to fulfil such undertakings. 
Like aggregation pipelines in general, a large part of the challenge relates to adapting your mindset to a Functional programming paradigm rather than a Procedural one. 
As this book discusses in its introductory chapter, the functional aspect of aggregations is essential for the database's aggregation engine to process data at scale efficiently.

Comparing with procedural approaches can help to bring clarity when describing array manipulation pipeline logic.
Therefore, the first few explanations in this chapter include examples of equivalent JavaScript code snippets you would use to achieve comparable outcomes in regular client-side applications.

Lastly, if you haven't read this book's Expressions Explained chapter yet, you should do so before continuing with this chapter.