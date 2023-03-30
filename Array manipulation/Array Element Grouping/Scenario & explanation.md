### Scenario
You want to provide a report for your online game **showing the total "coin" rewards** each gaming user has accumulated. 
The **challenge** is that the source collection captures each time the game awards a user with a type of coin in a growing array field containing many elements. 

However, for each gamer, you want to show 
*   how may time a gamer is awarded with a particular coin tpe
*   the total number of coins in each types awarded to the gamer.

#### for example 
for this
```js
{
                "userId": 123456789,
                "rewards": [
                    {
                        "coin": "gold",
                        "amount": 25,
                        "date": ISODate("2022-11-01T09:25:23Z")
                    },
                    {
                        "coin": "bronze",
                        "amount": 100,
                        "date": ISODate("2022-11-02T11:32:56Z")
                    },
                    {
                        "coin": "silver",
                        "amount": 50,
                        "date": ISODate("2022-11-09T12:11:58Z")
                    },
                    {
                        "coin": "gold",
                        "amount": 10,
                        "date": ISODate("2022-11-15T12:46:40Z")
                    },
                    {"coin": "bronze", "amount": 75, "date": ISODate("2022-11-22T12:57:01Z")}, {
                        "coin": "gold",
                        "amount": 50,
                        "date": ISODate("2022-11-28T19:32:33Z")
                    },
                ],
            
```
output will be
```json

{
    "userId": 123456789,
    "coinTypeAwardedCounts": [
      {
        "id": "bronze",
        "count": 2
      },
      {
        "id": "gold",
        "count": 3
      },
      {
        "id": "silver",
        "count": 1
      }
    ],
    "coinTypeTotals": [
      {
        "id": "bronze",
        "total": 175
      },
      {
        "id": "gold",
        "total": 85
      },
      {
        "id": "silver",
        "total": 50
      }
    ]
  }
```

_An extra complication exists in that you don't know ahead of time what all the possible coin types can be when developing the solution._ 
For example, the game could introduce different coin types in the future (e.g. "tungsten coins").