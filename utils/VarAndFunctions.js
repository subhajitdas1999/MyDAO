const provider = waffle.provider;

const VOTING_DELAY = 10; //In blocks
const VOTING_PERIOD = 10; //In blocks
const PROPOSER_THRESHOLD = 0;
const QUORUM_PERCENTAGE = 5;
const MIN_DELAY = 30; //In Time

const moveTime = async (time) => {
  await provider.send("evm_increaseTime", [time]);
  await provider.send("evm_mine");
};

const moveBlocks = async (number) => {
  for (let i = 0; i < number; i++) {
    await provider.send("evm_mine");
  }
};

module.exports = {
  MIN_DELAY,
  moveBlocks,
  moveTime,
  VOTING_DELAY,
  VOTING_PERIOD,
  PROPOSER_THRESHOLD,
  QUORUM_PERCENTAGE,
};
