/** ArcwayCampaigns ABI (the parts the app uses). Generated from contracts/out; keep in sync with contracts/src/ArcwayCampaigns.sol. */
export const campaignsAbi = [
  {
    "type": "function",
    "name": "campaignCount",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "claim",
    "inputs": [
      {
        "name": "id",
        "type": "uint256"
      },
      {
        "name": "amount",
        "type": "uint256"
      },
      {
        "name": "proof",
        "type": "bytes32[]"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "claimed",
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "createCampaign",
    "inputs": [
      {
        "name": "pool",
        "type": "uint128"
      },
      {
        "name": "mode",
        "type": "uint8"
      },
      {
        "name": "maxWinners",
        "type": "uint32"
      },
      {
        "name": "start",
        "type": "uint64"
      },
      {
        "name": "end",
        "type": "uint64"
      },
      {
        "name": "claimWindow",
        "type": "uint64"
      },
      {
        "name": "metadataHash",
        "type": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "id",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "enter",
    "inputs": [
      {
        "name": "id",
        "type": "uint256"
      },
      {
        "name": "deadline",
        "type": "uint256"
      },
      {
        "name": "signature",
        "type": "bytes"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "entered",
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "entryDigest",
    "inputs": [
      {
        "name": "id",
        "type": "uint256"
      },
      {
        "name": "user",
        "type": "address"
      },
      {
        "name": "deadline",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getCampaign",
    "inputs": [
      {
        "name": "id",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "components": [
          {
            "name": "creator",
            "type": "address"
          },
          {
            "name": "mode",
            "type": "uint8"
          },
          {
            "name": "start",
            "type": "uint64"
          },
          {
            "name": "end",
            "type": "uint64"
          },
          {
            "name": "claimUntil",
            "type": "uint64"
          },
          {
            "name": "maxWinners",
            "type": "uint32"
          },
          {
            "name": "entries",
            "type": "uint32"
          },
          {
            "name": "refunded",
            "type": "bool"
          },
          {
            "name": "pool",
            "type": "uint128"
          },
          {
            "name": "paid",
            "type": "uint128"
          },
          {
            "name": "allocated",
            "type": "uint128"
          },
          {
            "name": "resultsRoot",
            "type": "bytes32"
          },
          {
            "name": "metadataHash",
            "type": "bytes32"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "publishResults",
    "inputs": [
      {
        "name": "id",
        "type": "uint256"
      },
      {
        "name": "root",
        "type": "bytes32"
      },
      {
        "name": "total",
        "type": "uint128"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "refund",
    "inputs": [
      {
        "name": "id",
        "type": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "refundable",
    "inputs": [
      {
        "name": "id",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "CampaignCreated",
    "inputs": [
      {
        "name": "id",
        "type": "uint256",
        "indexed": true
      },
      {
        "name": "creator",
        "type": "address",
        "indexed": true
      },
      {
        "name": "mode",
        "type": "uint8",
        "indexed": false
      },
      {
        "name": "pool",
        "type": "uint256",
        "indexed": false
      },
      {
        "name": "maxWinners",
        "type": "uint256",
        "indexed": false
      },
      {
        "name": "start",
        "type": "uint64",
        "indexed": false
      },
      {
        "name": "end",
        "type": "uint64",
        "indexed": false
      },
      {
        "name": "claimUntil",
        "type": "uint64",
        "indexed": false
      },
      {
        "name": "metadataHash",
        "type": "bytes32",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Claimed",
    "inputs": [
      {
        "name": "id",
        "type": "uint256",
        "indexed": true
      },
      {
        "name": "user",
        "type": "address",
        "indexed": true
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Entered",
    "inputs": [
      {
        "name": "id",
        "type": "uint256",
        "indexed": true
      },
      {
        "name": "user",
        "type": "address",
        "indexed": true
      },
      {
        "name": "entryNumber",
        "type": "uint256",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Refunded",
    "inputs": [
      {
        "name": "id",
        "type": "uint256",
        "indexed": true
      },
      {
        "name": "creator",
        "type": "address",
        "indexed": true
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ResultsPublished",
    "inputs": [
      {
        "name": "id",
        "type": "uint256",
        "indexed": true
      },
      {
        "name": "root",
        "type": "bytes32",
        "indexed": false
      },
      {
        "name": "total",
        "type": "uint256",
        "indexed": false
      }
    ],
    "anonymous": false
  }
] as const;

export const erc20ApproveAbi = [
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ name: "", type: "bool" }] },
  { type: "function", name: "allowance", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] }
] as const;
