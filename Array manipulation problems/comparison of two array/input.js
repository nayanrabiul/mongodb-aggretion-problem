export const data = [
    {
        "name": "ProdServer",
        "beforeTimestamp": ISODate("2022-01-01T00:00:00Z"),
        "afterTimestamp": ISODate("2022-01-02T00:00:00Z"),
        "beforeConfig": {
            "vcpus": 8,
            "ram": 128,
            "storage": 512,
            "state": "running",
        },
        "afterConfig": {
            "vcpus": 16,
            "ram": 256,
            "storage": 512,
            "state": "running",
        },
    },
    {
        "name": "QAServer",
        "beforeTimestamp": ISODate("2022-01-01T00:00:00Z"),
        "afterTimestamp": ISODate("2022-01-02T00:00:00Z"),
        "beforeConfig": {
            "vcpus": 4,
            "ram": 64,
            "storage": 512,
            "state": "paused",
        },
        "afterConfig": {
            "vcpus": 4,
            "ram": 64,
            "storage": 256,
            "state": "running",
            "extraParams": "disableTLS;disableCerts;"
        },
    },
    {
        "name": "LoadTestServer",
        "beforeTimestamp": ISODate("2022-01-01T00:00:00Z"),
        "beforeConfig": {
            "vcpus": 8,
            "ram": 128,
            "storage": 256,
            "state": "running",
        },
    },
    {
        "name": "IntegrationServer",
        "beforeTimestamp": ISODate("2022-01-01T00:00:00Z"),
        "afterTimestamp": ISODate("2022-01-02T00:00:00Z"),
        "beforeConfig": {
            "vcpus": 4,
            "ram": 32,
            "storage": 64,
            "state": "running",
        },
        "afterConfig": {
            "vcpus": 4,
            "ram": 32,
            "storage": 64,
            "state": "running",
        },
    },
    {
        "name": "DevServer",
        "afterTimestamp": ISODate("2022-01-02T00:00:00Z"),
        "afterConfig": {
            "vcpus": 2,
            "ram": 16,
            "storage": 64,
            "state": "running",
        },
    },
]

function ISODate(s) {
    return new Date(s).toISOString();
}