export const  data = [
  {
    "userId": 123456789,
    "rewards": [
      {
        "coin": "gold",
        "amount": 25,
        "date": 'ISODate("2022-11-01T09:25:23Z")'
      },
      {
        "coin": "bronze",
        "amount": 100,
        "date": ISODate(
        "2022-11-02T11:32:56Z"
        )
      },
      {
        "coin": "silver",
        "amount": 50,
        "date": ISODate(
        "2022-11-09T12:11:58Z"
        )
      },
      {
        "coin": "gold",
        "amount": 10,
        "date": ISODate(
        "2022-11-15T12:46:40Z"
        )
      },
      {
        "coin": "bronze",
        "amount": 75,
        "date": ISODate(
        "2022-11-22T12:57:01Z"
        )
      },
      {
        "coin": "gold",
        "amount": 50,
        "date": ISODate(
        "2022-11-28T19:32:33Z"
        )
      }
    ]
  },
  {
    "userId": 987654321,
    "rewards": [
      {
        "coin": "bronze",
        "amount": 200,
        "date": ISODate(
        "2022-11-21T14:35:56Z"
        )
      },
      {
        "coin": "silver",
        "amount": 50,
        "date": ISODate(
        "2022-11-21T15:02:48Z"
        )
      },
      {
        "coin": "silver",
        "amount": 50,
        "date": ISODate(
        "2022-11-27T23:04:32Z"
        )
      },
      {
        "coin": "silver",
        "amount": 50,
        "date": ISODate(
        "2022-11-27T23:29:47Z"
        )
      },
      {
        "coin": "bronze",
        "amount": 500,
        "date": ISODate(
        "2022-11-27T23:56:14Z"
        )
      }
    ]
  },
  {
    "userId": 888888888,
    "rewards": [
      {
        "coin": "gold",
        "amount": 500,
        "date": ISODate(
        "2022-11-13T13:42:18Z"
        )
      },
      {
        "coin": "platinum",
        "amount": 5,
        "date": ISODate(
        "2022-11-19T15:02:53Z"
        )
      }
    ]
  }
]

function ISODate(s) {
  return new Date(s).toISOString();
}