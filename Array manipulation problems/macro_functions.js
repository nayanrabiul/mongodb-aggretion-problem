// Macro function to generate a complex expression to group an array field's
// content by the value of a field occurring in each array element, counting
// the number of times it occurs
// সিকালি , arrayGroupByCount এই ফাংশন টা, কোন array কে , কোন ফিল্ড এর ভ্যালু উপর বেস করে গ্রুপ করে দেয়। এখানে arraySubdocField array কে groupByKeyField এর উপর বেস কর গ্রুপ করে/
export function arrayGroupByCount(arraySubdocField, groupByKeyField) {
    return {
        "$map": {
            "input": {
                "$setUnion": {
                    "$map": {
                        "input": `$${arraySubdocField}`,
                        "in": `$$this.${groupByKeyField}`
                    }
                }
            },
            "as": "key",
            "in": {
                "id": "$$key",
                "count": {
                    "$size": {
                        "$filter": {
                            "input": `$${arraySubdocField}`,
                            "cond": {
                                "$eq": [`$$this.${groupByKeyField}`, "$$key"]
                            }
                        }
                    }
                }
            }
        }
    };
}


// Macro function to generate a complex expression to group an array field's
// content by the value of a field occurring in each array element, summing
// the values from a corresponding amount field in each array element
export function arrayGroupBySum(arraySubdocField, groupByKeyField, groupByValueField) {
    return {
        "$map": {
            "input": {
                "$setUnion": {
                    "$map": {
                        "input": `$${arraySubdocField}`,
                        "in": `$$this.${groupByKeyField}`
                    }
                }
            },
            "as": "key",
            "in": {
                "id": "$$key",
                "total": {
                    "$reduce": {
                        "input": `$${arraySubdocField}`,
                        "initialValue": 0,
                        "in": {
                            "$cond": {
                                "if": {"$eq": [`$$this.${groupByKeyField}`, "$$key"]},
                                "then": {"$add": [`$$this.${groupByValueField}`, "$$value"]},
                                "else": "$$value"
                            }
                        }
                    }
                }
            }
        }
    };
}


// Macro function to generate unique keys from two sub-documents returned as an array of the unique keys
export function getArrayOfTwoSubdocsKeysNoDups(firstArrayRef, secondArrayRef) {
    return {
        "$setUnion": {
            "$concatArrays": [
                {
                    "$map": {
                        "input": {"$objectToArray": firstArrayRef},
                        "in": "$$this.k",
                    }
                },
                {
                    "$map": {
                        "input": {"$objectToArray": secondArrayRef},
                        "in": "$$this.k",
                    }
                },
            ]
        }
    };
}

// Macro function to get the value of a field of a document where the field's name is only known at runtime
export function getDynamicField(obj, fieldname) {
    return {
        "$first": [
            {
                "$map": {
                    "input": {
                        "$filter": {
                            "input": {"$objectToArray": obj},
                            "as": "currObj",
                            "cond": {"$eq": ["$$currObj.k", fieldname]}
                        }
                    },
                    "in": "$$this.v"
                }
            },
        ]
    };
}