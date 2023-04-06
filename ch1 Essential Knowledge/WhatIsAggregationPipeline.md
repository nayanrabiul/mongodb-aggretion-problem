An aggregation pipeline is collection of stages.
The entire output of one stage input of the next stage, and so on.
stages are stateless self-contained components assembled in various combinations (pipelines) to satisfy specific requirements. 

Streaming Vs Blocking Stages Ordering
When executing an aggregation pipeline, the database engine pulls batches of records from the initial query cursor
The database engine then attempts to stream each batch through the aggregation pipeline stages.2 types of stage

1. Streaming stages allow batches to be processed and then passed through without waiting. 
2. Blocking stages wait for the whole of the input data set to arrive and accumulate before processing all this data together.
there are 2 blocking stages:
         $sort
         $group *
           * actually when stating $group, this also includes other less frequently used "grouping" stages too, specifically:
             $bucket, $bucketAuto, $count, $sortByCount & $facet  (it's a stretch to call $facet a group stage, but in the context
             of this topic, it's best to think of it that way)


### why $sort is blocking, Memory Consumption And Mitigation
a $sort stage will need to see all the input records at once, so it need to stop streaming data down.causing blocking.

Suppose the source data set is many gigabytes or even terabytes in size, and earlier pipeline stages have not reduced this size significantly. 
It will be unlikely that the host machine has sufficient memory to support the pipeline's blocking $sort stage. 
**Therefore, MongoDB enforces that every blocking stage is limited to 100 MB of consumed RAM. The database throws an error if it exceeds this limit.**

To avoid the memory limit obstacle, you can set the allowDiskUse:true option for the overall aggregation for handling large result data sets. 
Consequently, the pipeline's sort operation spills to disk if required, and the 100 MB limit no longer constrains the pipeline. 
However, the sacrifice here is significantly higher latency, and the execution time is likely to increase by orders of magnitude.

## $group Memory Consumption And Mitigation
Like the $sort stage, the $group stage has the potential to consume a large amount of memory. 
The aggregation pipeline's 100 MB RAM limit for blocking stages applies equally to the $group stage because it will potentially pressure the host's memory capacity. 
As with sorting, you can use the pipeline's allowDiskUse:true option to avoid this limit for heavyweight grouping operations, but with the same downsides.

In reality, most grouping scenarios focus on accumulating summary data such as totals, counts, averages,highs and lows, and not itemised data. 
In these situations, considerably reduced result data sets are produced, requiring far less processing memory than a $sort stage. 
Contrary to many sorting scenarios, grouping operations will typically demand a fraction of the host's RAM.