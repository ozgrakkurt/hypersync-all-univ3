import { keccak256, toHex } from 'viem';
import { HypersyncClient } from "@envio-dev/hypersync-client";

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
  url: "http://eth.backup.hypersync.xyz"
});

let query = {
    "fromBlock": 15123123,
    "logs": [
      {
        "topics": [
          topic0_list,
        ]
      }
    ],
    "fieldSelection": {
      "block": [
        "number",
        "timestamp",
        "hash",
      ],
      "log": [
        "block_number",
        "log_index",
        "transaction_index",
        "transaction_hash",
        "data",
        "address",
        "topic0",
        "topic1",
        "topic2",
        "topic3"
      ],
      "transaction": [
        "from",
      ]
    },
};

const main = async () => {
  let eventCount = 0;
  const startTime = performance.now()

  while(true) {
    const res = await client.sendEventsReq(query);

    eventCount += res.events.length;

    const currentTime = performance.now();

    const seconds = (currentTime - startTime) / 1000;

    console.log(`scanned up to ${res.nextBlock} and got ${eventCount} events. ${seconds} seconds elapsed. Events per second: ${eventCount / seconds}`);

    if (res.archiveHeight == res.nextBlock) {
      // wait if we are at the head
      console.log(`reached the tip`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Continue query from nextBlock
    query.fromBlock = res.nextBlock;
  }
};

main();
