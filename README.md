# Openmina Transaction Generator
NodeJS program used to generate transactions


1. Add your settings in [setup.json](./setup.json) file
2. Run with `npm run start`


# Table of Contents
1. [How to run it on your machine](#how-to-run-it-on-your-machine)
2. [Configuring your own setup](#configuring-your-own-setup)

## How to run it on your machine

1. **Install Node.js:** First, you need to install Node.js on your computer. You can download the installer from the Node.js website at https://nodejs.org/en/download/. NodeJS 18 is recommended.

2. **Clone the project:** Next, clone the Angular project from the Git repository or download the source code as a ZIP file and extract it to a local directory on your computer.

3. **Install project dependencies:** Open a command prompt or terminal window in the project directory and run the following command to install the project dependencies:
   `npm install`.
   This command will install all the required dependencies for the project based on the package.json file.
5. **Run the program:** Finally, run the following command to run the program:
   `npm run start`

## Configuring your own setup

You need to go to [setup.json](./setup.json) where you can add your own configuration.
Explaining each field:
 - `domain` is the domain of the server where you want to send the transactions
 - `port` is the port of the server where you want to send the transactions
 - `network` is the network name. Available options are `mainnet` or `testnet`
 - `activeNodeName` is the name of the node that you want to send the transactions
 - `sendToAllNodes` is a boolean that indicates if you want to send the transactions to all nodes 1 by 1 or, if false, all to the active node
 - `transactionsToSend` is the number of transactions that you want to send
 - `transactionFee` is the fee that you want to pay for each transaction **(in micromina)**
 - `transactionAmount` is the amount that you want to send for each transaction **(in micromina)**
 - `allNodes` is a string array of node names that you want to send the transactions. If you want to send the transactions to active node only, you can leave this array empty
