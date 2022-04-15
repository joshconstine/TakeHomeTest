const express = require("express");
const app = express();

const PORT = 8080;

//stores data
var savedData = [];
/* getBalances function will return an array 
with 1 object for each payer and the respective balance
[
{ "payer": "DANNON", "points": -100 },
{ "payer": "UNILEVER", "points": -200 },
]
*/
function getBalances() {
  /*this array will be returned and will be in the format*/
  let balances = [];
  //lookup table that will be used to track if a payer already has a running balance
  let list = {};
  // loops throught the saved data
  savedData.map((transaction, i) => {
    //checks to see if the payer has a running balance
    if (list.hasOwnProperty(transaction.payer)) {
      /*if there is a running ballance found we will find the object that 
        matches the payer*/
      balances.map((balance, i) => {
        if (balance.payer === transaction.payer) {
          //once the payer is found we will add the points from the current transaction
          balances[i].points = balances[i].points + transaction.points;
        }
      });
    } else {
      /*this block of code runs if the current transactions  payer does not already have an object
        in our balances array*/
      //addes payer to lookup table
      list = { ...list, [transaction.payer]: 1 };
      //added a new balance to our balances array
      balances.push({
        payer: transaction.payer,
        points: transaction.points,
      });
    }
  });

  return balances;
}

/*  spendPoints function will spend points folling the rules
 the oldest points to be spent first (oldest based on transaction timestamp, not the order they’re received)
want no payer's points to go negative.
returns a array with information about where the points where deducted from

*/
function spendPoints(points) {
  //checks to see if the points being passed in begins with a -
  //this is handles the post route { "payer": "DANNON", "points": -200, "timestamp": "2020-10-31T15:00:00Z" }
  //without being able to ask questions I believe this handle the case that a transaction gets added with '-' points
  if (points.charAt(0) === "-") {
    points = Number(points.substring(1));
  }

  //this array will track which accounts have been spent from
  let spentPoints = [];

  //tracks the remaing points we want to spend
  let remamingPointsToSpend = points;
  //sort the data
  sortByTimeStamp();

  //loop that will run untill we have spent all of our points

  while (remamingPointsToSpend > 0 && savedData[0].points !== 0) {
    //checks if all points will be spent
    if (remamingPointsToSpend > savedData[0].points) {
      //sets the remaing points
      remamingPointsToSpend = remamingPointsToSpend - savedData[0].points;
      //object for return statement
      let recipt = {
        payer: savedData[0].payer,
        points: `-${savedData[0].points}`,
      };
      //zero out the points for this payer
      savedData[0].points = 0;
      //move this item to the end of the array
      savedData.push(savedData.shift());
      //adds the reciept to the returned array
      spentPoints.push(recipt);
    } else {
      //object for return statement
      let recipt = {
        payer: savedData[0].payer,
        points: `-${remamingPointsToSpend}`,
      };
      //reduces points
      savedData[0].points = savedData[0].points - remamingPointsToSpend;
      remamingPointsToSpend = 0;
      //adds the reciept to the returned array
      spentPoints.push(recipt);
    }
  }

  return spentPoints;
}

//this function will sort the saved data in order from oldest -> newest based on their timestamp
function sortByTimeStamp() {
  savedData.sort(function (x, y) {
    //create date object
    let first = new Date(x.timestamp);
    let seccond = new Date(y.timestamp);
    //return the array in order from oldest to greatest
    return first - seccond;
  });
}
// GET /
//returns all transactions
app.get("/", (req, res) => {
  try {
    res.send(savedData);
  } catch (e) {
    console.error(e);
  }
});

// PUT  /points
//route to  Spend points
//add  points to the headder of the HTTP request

app.put("/points", async (req, res) => {
  try {
    const data = await spendPoints(req.headers.points);
    res.send(data);
  } catch (e) {
    console.error(e);
  }
});

//  GET /balances
//this route will orginize the data that is stored into a neat form with clear totals from each payer
app.get("/balances", (req, res) => {
  console.log("called GET /balances");
  try {
    res.send(getBalances());
  } catch (e) {
    console.error(e);
  }
});

//POST /
// Add transactions for a specific payer and date
// add the following fields to the headder in the HTTP request
/*
payer: 'name-of-payer'
points: 'number-of-points'
timestamp: 'timestamp'


*/
app.post("/", (req, res) => {
  try {
    //checks for '-' points "points": -200
    //if a '-' if found spend Points is callled
    if (req.headers.points.charAt(0) === "-") {
      res.send(spendPoints(req.headers.points));
    } else {
      //creates transaction
      const transaction = {
        payer: req.headers.payer,
        points: Number(req.headers.points),
        timestamp: req.headers.timestamp,
      };
      //adds transaction to the saved data, this would be replaced by a database
      savedData.push(transaction);
      //return json that was adeed
      res.send(transaction);
    }
  } catch (e) {
    console.error(e);
  }
});

//404
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

//begin listning on port 8080
//localhost:8080
app.listen(PORT, () => {
  console.log(`listning on port ${PORT}`);
});
