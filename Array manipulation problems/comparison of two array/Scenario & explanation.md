### Scenario
You are an IT administrator managing some virtual machine deployments in a data centre to host a critical business application in a few environments (e.g. "Production", "QA").
A database collection captured the configuration state of each virtual machine across two days. 
You want to generate a report **showing what configuration changes people made to the virtual machines (if any) between these two days.**

**_Note: Each document has an deforConfig & an afterCongig_**

#### for example

```js
[
    {
        "name": "ProdServer",
        "beforeTimestamp": ISODate("2022-01-01T00:00:00Z"),
        "afterTimestamp": ISODate("2022-01-02T00:00:00Z"),
        "beforeConfig": {
            "vcpus": 8, "ram": 128, "storage": 512, "state": "running",
        },
        "afterConfig": {
            "vcpus": 16, "ram": 256, "storage": 512, "state": "running",
        },
    }, 
    {
        "name": "QAServer",
        "beforeTimestamp": ISODate("2022-01-01T00:00:00Z"),
        "afterTimestamp": ISODate("2022-01-02T00:00:00Z"),
        "beforeConfig": {
            "vcpus": 4, "ram": 64, "storage": 512, "state": "paused",
        },
        "afterConfig": {
            "vcpus": 4, "ram": 64, "storage": 256, "state": "running", "extraParams": "disableTLS;disableCerts;"
        },
    },
    {
        "name": "LoadTestServer", 
        "beforeTimestamp": ISODate("2022-01-01T00:00:00Z"), 
        "beforeConfig": {
            "vcpus": 8, "ram": 128, "storage": 256, "state": "running",
        },
    }, 
    {
        "name": "IntegrationServer",
        "beforeTimestamp": ISODate("2022-01-01T00:00:00Z"),
        "afterTimestamp": ISODate("2022-01-02T00:00:00Z"),
        "beforeConfig": {
            "vcpus": 4, "ram": 32, "storage": 64, "state": "running",
        },
        "afterConfig": {
            "vcpus": 4, "ram": 32, "storage": 64, "state": "running",
        },
    },
    {
        "name": "DevServer", 
        "afterTimestamp": ISODate("2022-01-02T00:00:00Z"), 
        "afterConfig": {
            "vcpus": 2, "ram": 16, "storage": 64, "state": "running",
        },
    },
]
```

Five documents should be returned, showing whether anyone added, removed or modified a deployment or left it unchanged, 
with the deployment's changes shown if modified, as shown below:

```JSON
[
  {
    "name": "ProdServer",
    "status": "MODIFIED",
    "differences": [
      {
        "field": "vcpus",
        "change": "8 --> 16"
      },
      {
        "field": "ram",
        "change": "128 --> 256"
      }
    ]
  },
  {
    "name": "QAServer",
    "status": "MODIFIED",
    "differences": [
      {
        "field": "storage",
        "change": "512 --> 256"
      },
      {
        "field": "state",
        "change": "paused --> running"
      },
      {
        "field": "extraParams",
        "change": "<not-set> --> disableTLS;disableCerts;"
      }
    ]
  },
  {
    "name": "LoadTestServer",
    "status": "REMOVED"
  },
  {
    "name": "IntegrationServer",
    "status": "UNCHANGED"
  },
  {
    "name": "DevServer",
    "status": "ADDED"
  }
]
```



