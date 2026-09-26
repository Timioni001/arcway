export const passportAbi = [
  {
    type: "function",
    name: "profiles",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [
      { name: "xp", type: "uint256" },
      { name: "completedCount", type: "uint256" },
      { name: "createdAt", type: "uint256" }
    ]
  },
  {
    type: "function",
    name: "completedQuest",
    stateMutability: "view",
    inputs: [
      { name: "", type: "address" },
      { name: "", type: "bytes32" }
    ],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    type: "function",
    name: "hasBadge",
    stateMutability: "view",
    inputs: [
      { name: "", type: "address" },
      { name: "", type: "bytes32" }
    ],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    type: "function",
    name: "verifier",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    type: "function",
    name: "completeQuest",
    stateMutability: "nonpayable",
    inputs: [
      { name: "user", type: "address" },
      { name: "questId", type: "bytes32" },
      { name: "xp", type: "uint256" }
    ],
    outputs: []
  },
  {
    type: "event",
    name: "QuestCompleted",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "questId", type: "bytes32", indexed: true },
      { name: "xpAwarded", type: "uint256", indexed: false }
    ]
  }
] as const;
