// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.27;

import "./Main/Evidence.sol";
import "./Main/Owner.sol";

contract Pramaan is Owner, Evidence {
  function getTimestamp() public view returns (uint256) {
    return block.timestamp;
  }
}
