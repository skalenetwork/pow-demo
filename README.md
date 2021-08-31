# pow-demo
Demo of sChain PoW script

# Run simple page demo

1. Run command from project directory:

   ```bash
   python -m SimpleHTTPServer 8000
   ```

2. Run page in browser using `http://localhost:8000/demo.html`

3. Deploy contract and receive 1 ETH on your metamask account

# Install and run pow-test script

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
3. Run `node pow-test.js`

# Benchmark

The CPU time used for this PoW can be measured as:

```
time node benchmark.js    # 10 runs
time node benchmark.js 15 # 15 runs
```

# Project structure

- `skale-miner.js` - script for mining with PoW
- `pow-test.js` - example of usage `skale-miner.js`