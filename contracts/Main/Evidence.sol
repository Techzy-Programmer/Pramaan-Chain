// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "../Utils/Store.sol";

contract Evidence is Store {
  modifier ensureAccessGranted(address master) {
    require(acl[msg.sender].expirationTime > block.timestamp, "Access denied");
    require(acl[msg.sender].masterOwner == master, "Access denied");
    _;
  }

  function storeEvidence(string memory dataHash, string memory name, string memory ext) public returns (uint256) {
    require(bytes(dataHash).length == 128, "DataHash must be a 128-character hex string representing SHA-512"); // Ensure correct format
    require(bytes(name).length > 0, "Name cannot be empty");

    evidences[msg.sender].push(EvidenceData({
      timestamp: block.timestamp,
      dataHash: dataHash,
      extension: ext,
      name: name
    }));

    emit EvidenceStored(msg.sender, block.timestamp, dataHash, name);
    return evidences[msg.sender].length - 1;
  }

  function getEvidenceByIndex(uint256 index) public view returns (EvidenceData memory) {
    require(index < evidences[msg.sender].length, "Index out of bounds");
    return evidences[msg.sender][index];
  }

  function getEvidenceByIndexForMaster(uint256 index, address master) public ensureAccessGranted(master) view returns (EvidenceData memory) {
    require(index < evidences[msg.sender].length, "Index out of bounds");
    return evidences[msg.sender][index];
  }

  function getAllEvidence() public view returns (EvidenceData[] memory) {
    return evidences[msg.sender];
  }

  function getAllEvidenceForMaster(address master) public ensureAccessGranted(master) view returns (EvidenceData[] memory) {
    return evidences[msg.sender];
  }
}
