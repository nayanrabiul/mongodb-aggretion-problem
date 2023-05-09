# Manual way
```js
exports.getMarketingGroups = async (req, res) => {
    const {query} = req;
    if (query._id) {
        try {
            // @ts-ignore
            const _id = new mongoose.Types.ObjectId(query._id);
            //parameters for pagination
            const page = query.page && parseInt(query.page) > 0 ? parseInt(query.page) : 1;
            const limit = parseInt(query.size ? query.size : (50)); //max size for each page, (2 ** 53 - 1) means get all  ; using 50 for saving server resources
            const skip = parseInt((page - 1) * limit)
            console.log({page, skip, limit})

            //get total docs in groups
            let totalDocs = await MarketingGroup.findById(_id).populate('groups', ('_ID'))
            totalDocs = totalDocs?.groups?.length || 0
            let data = await MarketingGroup.findById(_id).populate('groups', ('username email phone'))
            data.groups = data?.groups.slice(skip, skip + limit)

            const payload = {_id: mongoose.Types.ObjectId, name: '', docs: []};
            // @ts-ignore
            payload._id = _id
            payload.name = data?.name || ''
            payload.docs = data?.groups || ''
            payload.totalDocs = totalDocs
            payload.totalPages = Math.ceil(totalDocs / limit)

            //search filters
            const filters = {}
            if (query.search) {
                filters['name'] = new RegExp(query.search, 'i');
                filters['email'] = new RegExp(query.search, 'i');
                filters['phone'] = new RegExp(query.search, 'i');
            }

            //filter data
            payload.docs = payload.docs.filter((item) => {
                    return item.username.match(filters['name']) || item.email.match(filters['email']) || String(item.phone).match(filters['phone'])
                }
            )

            return res.status(200).send({
                error: false,
                msg: "Fetch Successful",
                data: payload,
            })
        } catch (err) {
            console.log('This error occurred in getMarketingGroups function', err);
            return res.status(500).send({
                error: true,
                msg: "Server failed"
            })
        }

    } else {
        try {
            let data = []

            if (req.query.type === "email") {
                if (req.query.status === 'true') {
                    data = await MarketingGroup.find({type: "email", status: true})
                } else {
                    data = await MarketingGroup.find({type: "email"})
                }
            } else if (req.query.type === "sms") {
                if (req.query.status === 'true') {
                    data = await MarketingGroup.find({type: "sms", status: true})
                } else {
                    data = await MarketingGroup.find({type: "sms"})
                }
            } else if (req.query.type === "whatsapp_sms") {
                if (req.query.status === 'true') {
                    data = await MarketingGroup.find({type: "whatsapp_sms", status: true})
                } else {
                    data = await MarketingGroup.find({type: "whatsapp_sms"})
                }
            } else if (req.query.type === "notification") {
                if (req.query.status === 'true') {
                    data = await MarketingGroup.find({type: "notification", status: true})
                } else {
                    data = await MarketingGroup.find({type: "notification"})
                }
            }

            //query match and filter query.search
            //define seach filter
            let filters = {}
            if (query.search) {
                filters['name'] = new RegExp(query.search, 'i');
            }

            data = data.filter((item) => {
                    return item.name.match(filters['name'])
                }
            )

            return res.status(200).send({
                error: false,
                msg: "Fetch Successful",
                data: data
            })
        } catch (err) {
            console.log('This error occurred in getMarketingGroups function');
            return res.status(500).send({
                error: true,
                msg: "Server failed"
            })
        }
    }
}
```

# pipeline way
```js
export const getMarketingGroups = async (req, res) => {
    const {query} = req;
    if (query._id) {
        try {
            // @ts-ignore
            const _id = new mongoose.Types.ObjectId(query._id);
            // @ts-ignore
            const data = await MarketingGroup.aggregatePaginate(
                    MarketingGroup.aggregate([
                        {
                            $match: {_id: _id}
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "groups",
                                foreignField: "_id",
                                as: "groups"
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                groups: {
                                    _id: 1,
                                    name: 1,
                                    phone: 1,
                                    email: 1,
                                }
                            }
                        },
                    ]),
                    {
                        page: query.page || 1,
                        limit: query.size || 20,
                    }
                )
            ;
            const payload = {_id: mongoose.Types.ObjectId, name: '', docs: []};
            // @ts-ignore
            payload._id = _id
            payload.name = data.docs[0]?.name || ''
            payload.docs = data.docs[0]?.groups || ''

            //search filters
            const filters = {}
            if (query.search) {
                filters['name'] = new RegExp(query.search, 'i');
                filters['email'] = new RegExp(query.search, 'i');
                filters['phone'] = new RegExp(query.search, 'i');
            }
            payload.docs = payload.docs.filter((item) => {
                    return item.username.match(filters['name']) || item.email.match(filters['email']) || String(item.phone).match(filters['phone'])
                }
            )

            return res.status(200).send({
                error: false,
                msg: "Fetch Successful",
                data: payload
            })
        } catch (err) {
            console.log('This error occurred in getMarketingGroups function');
            return res.status(500).send({
                error: true,
                msg: "Server failed"
            })
        }


    } else {
        try {
            let data = []

            if (req.query.type === "email") {
                if (req.query.status === 'true') {
                    data = await MarketingGroup.find({type: "email", status: true})
                } else {
                    data = await MarketingGroup.find({type: "email"})
                }
            } else if (req.query.type === "sms") {
                if (req.query.status === 'true') {
                    data = await MarketingGroup.find({type: "sms", status: true})
                } else {
                    data = await MarketingGroup.find({type: "sms"})
                }
            } else if (req.query.type === "whatsapp_sms") {
                if (req.query.status === 'true') {
                    data = await MarketingGroup.find({type: "whatsapp_sms", status: true})
                } else {
                    data = await MarketingGroup.find({type: "whatsapp_sms"})
                }
            } else if (req.query.type === "notification") {
                if (req.query.status === 'true') {
                    data = await MarketingGroup.find({type: "notification", status: true})
                } else {
                    data = await MarketingGroup.find({type: "notification"})
                }
            }

            //query match and filter query.search
            //define seach filter
            let filters = {}
            if (query.search) {
                filters['name'] = new RegExp(query.search, 'i');
            }

            data = data.filter((item) => {
                    return item.name.match(filters['name'])
                }
            )

            return res.status(200).send({
                error: false,
                msg: "Fetch Successful",
                data: data
            })
        } catch (err) {
            console.log('This error occurred in getMarketingGroups function');
            return res.status(500).send({
                error: true,
                msg: "Server failed"
            })
        }
    }
}
```
