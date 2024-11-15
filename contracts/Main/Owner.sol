// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "../Utils/Store.sol";
import "../Utils/Helper.sol";

contract Owner is Store, Helper {
  function registerOwner(string memory name) public {
    require(bytes(name).length > 0, "Name cannot be empty");
    require(owners[msg.sender].timestamp == 0, "Owner already exists");

    owners[msg.sender] = OwnerData({
      timestamp: block.timestamp,
      name: name
    });
    
    emit OwnerAdded(msg.sender, name);
  }

  function getSelf() public view returns (OwnerData memory) {
    require(owners[msg.sender].timestamp > 0, "Owner not found");
    return owners[msg.sender];
  }

  function requestAccess(address masterOwner) public {
    require(owners[msg.sender].timestamp > 0, "Owner not found");
    require(masterOwner != msg.sender, "Cannot request access to self");
    require(sentReq[msg.sender] == address(0), "You have already requested access");
    require(requests[masterOwner].length <= 32, "This user has their request limit reached");
    require(hasRequested[msg.sender][masterOwner] == false, "You have already requested access");
    
    hasRequested[msg.sender][masterOwner] = true;
    sentReq[msg.sender] = masterOwner;
    
    requests[masterOwner].push(RequestType({
      name: owners[msg.sender].name,
      timestamp: block.timestamp,
      requester: msg.sender
    }));
  }

  function grantAccess(address subOwner, string memory signature, uint256 expTS) public {
    require(hasRequested[subOwner][msg.sender] == true, "You have not received a request from this user");
    require(expTS > block.timestamp, "Expiration time must be in the future");
    removeFromRequests(subOwner);

    acl[subOwner] = AccessPolicy({
      metaSignature: signature,
      masterOwner: msg.sender,
      expirationTime: expTS
    });

    sentReq[subOwner] = address(0);
    hasRequested[subOwner][msg.sender] = false;
    emit AccessGranted(subOwner, expTS, signature);
  }

  function getAllRequests() public view returns (RequestType[] memory) {
    return requests[msg.sender];
  }

  function getAccessControl() public view returns (AccessPolicy memory) {
    AccessPolicy memory access = acl[msg.sender];
    require(block.timestamp <= access.expirationTime, "Access expired or not granted");
    return access;
  }
}
