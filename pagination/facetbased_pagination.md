```js


export const getSubscribedUsers = async (req, res) => {
const {query} = req;
const page = query.page ? query.page : 1;
const size = Number(query.size ? query.size : 50); //get 50 or max size for each page, (2 ** 53 - 1) means get all users
const skip = Number((page - 1) * size)

    //define match stage
    const matchStage = {email: {$ne: null}}
    //define search stage
    const searchStage = query.search ? {
        $or: [
            {name: {$regex: query.search, $options: 'i'}},
            {email: {$regex: query.search, $options: 'i'}}
        ]
    } : {}

    try {
        let data = await MarketingUser.aggregate([
            {
                $match: matchStage
            },
            {
                $match: searchStage
            },
            {
                $facet: {
                    docs: [
                        {
                            //only include these fields
                            $project: {
                                name: 1,
                                email: 1,
                                marketing_status: 1,
                                createdAt: 1,
                            }
                        },
                        {$skip: skip},
                        {$limit: size}
                    ],
                    totalDocs: [{
                        $count: 'createdAt'
                    }],
                }
            },
            {
                $project: {
                    docs: 1,
                    totalPages: {
                        $ceil: {
                            $divide: [
                                {$first: '$totalDocs.createdAt'},
                                size
                            ]
                        }
                    },
                    totalDocs: {$first: '$totalDocs.createdAt'}
                }
            },
            {
                $addFields: {
                    page: page,
                    limit: size
                }
            }
        ])

        return res.status(200).send({
            error: false,
            msg: "Fetch Successful",
            data: data[0]
        })
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            error: true,
            msg: "Server Error ",
        })
    }
}


```
