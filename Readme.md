Joshua Constne

this application can be tested using thunderclient or a related service to make HTTP requests.
first Install dependencies by entering the command below in a terminal.

npm i

to start the application enter the command below in a terminal.

npm run start

after you start the program there are routes that provide the following features.
● Add transactions for a specific payer and date.
● Spend points using the rules above and return a list of { "payer": <string>, "points": <integer> } for each call.
● Return all payer point balances.

instructions for individual routes
to include data for the HTTP request use the headers section with the provided pattern

● Add transactions for a specific payer and date.

post localhost:8080/

headers:{
payer: 'payer'
points: 'points'
timestamp: 'timestamp'
}

● Spend points using the rules above and return a list of { "payer": <string>, "points": <integer> } for each call.

put localhost:8080/points
headers:{
points: 'points'
}

● Return all payer point balances.
get localhost:8080/balances
