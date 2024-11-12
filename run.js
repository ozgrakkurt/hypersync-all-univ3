import { keccak256, toHex } from 'viem';
import { HypersyncClient, LogField } from "@envio-dev/hypersync-client";

const event_signatures = [
    "PoolCreated(address,address,uint24,int24,address)",
    "Burn(address,int24,int24,uint128,uint256)",
    "Initialize(uint160,int24)",
    "Mint(address,address,int24,int24,uint128,uint256,uint256)",
    "Swap(address,address,int256,int256,uint160,uint128,int24)"
];

const topic0_list = event_signatures.map(sig => keccak256(toHex(sig)));

console.log(topic0_list);

const client = HypersyncClient.new({
  url: "https://eth.hypersync.xyz"
});

let query = {
    "fromBlock": 0,
    "logs": [
      {
        // Get all events that have any of the topic0 values we want
        "topics": [
          topic0_list,
        ]
      }
    ],
    "fieldSelection": {
      "log": [
        LogField.BlockNumber,
        LogField.LogIndex,
        LogField.TransactionIndex,
        LogField.TransactionHash,
        LogField.Data,
        LogField.Address,
        LogField.Topic0,
        LogField.Topic1,
        LogField.Topic2,
        LogField.Topic3,
      ],
    },
};

const main = async () => {
  let eventCount = 0;
  const startTime = performance.now()

  // Start streaming events in parallel
  const stream = await client.streamEvents(query, {});

  while(true) {
    const res = await stream.recv();

    // Quit if we reached the tip
    if (res === null) {
      console.log(`reached the tip`);
      break;
    }

    eventCount += res.data.length;

    const currentTime = performance.now();

    const seconds = (currentTime - startTime) / 1000;

    console.log(`scanned up to ${res.nextBlock} and got ${eventCount} events. ${seconds} seconds elapsed. Events per second: ${eventCount / seconds}`);
  }
};

main();
