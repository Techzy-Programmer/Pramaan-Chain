// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./Store.sol";

contract Helper is Store {
  function removeFromRequests(uint index) internal {
    require(index < requests[msg.sender].length, "Index out of bounds");
    requests[msg.sender][index] = requests[msg.sender][requests[msg.sender].length - 1];
    requests[msg.sender].pop();
  }

  function getRequesterIndex(address requester) internal view returns (uint) {
    for (uint i = 0; i < requests[msg.sender].length; i++) {
      if (requests[msg.sender][i] == requester) {
        return i; // Return the index directly
      }
    }

    revert("Not requested for access");
  }
}
