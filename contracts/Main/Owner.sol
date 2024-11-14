// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "../Utils/Store.sol";
import "../Utils//Helper.sol";

contract Owner is Store, Helper {
  function registerOwner(string memory name) public {
    emit OwnerAdded(msg.sender, name);
  }

  function requestAccess(address masterOwner) public {
    require(requests[masterOwner].length >= 32, "This user has their request limit reached");
    requests[masterOwner].push(msg.sender);
  }

  function grantAccess(address subOwner, string memory signature, uint256 duration) public {
    require(duration > 0, "Duration must be greater than zero");

    uint256 expTS = block.timestamp + duration;
    uint i = getRequesterIndex(subOwner);
    removeFromRequests(i);

    acl[subOwner] = AccessPolicy({
      metaSignature: signature,
      masterOwner: msg.sender,
      expirationTime: expTS
    });

    emit AccessGranted(subOwner, expTS, signature);
  }

  function getAllRequests() public view returns (address[] memory) {
    return requests[msg.sender];
  }

  function getAccessControl() public view returns (AccessPolicy memory) {
    AccessPolicy memory access = acl[msg.sender];
    require(block.timestamp <= access.expirationTime, "Access expired or not granted");
    return access;
  }
}
