# pow-demo
Demo of sChain PoW script

# Install and run

1. Install dependencies:

    ```bash
    npm i
    ```
   
2. Create `.env` file in project directory:
    ```.dotenv
    OWNER_KEY=... #Key to deploy contract
    PRIVATE_KEY=... #Key from test account
    SKALE_ENDPOINT=... #Test sChain endpoint 
    ```
3. Run `npm run pow-test.js`

# Project structure

- `skale-miner.js` - script for mining with PoW
- `pow-test.js` - example of usage `skale-miner.js`