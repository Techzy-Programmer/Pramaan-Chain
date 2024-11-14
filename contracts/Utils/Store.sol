// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract Store {
  struct EvidenceData { // Resolve naming conflict with Evidence contract
    uint256 timestamp;
    bytes32 dataHash;
    uint256 blockId;
    string s3Link;
    address owner;
  }

  struct AccessPolicy {
    uint256 expirationTime;
    string metaSignature;
    address masterOwner;
  }

  struct RequestType {
    address requester;
    uint256 timestamp;
    string name;
  }

  struct OwnerData {
    uint256 timestamp;
    string name;
  }

  uint256 internal _evId = 0; // Auto-Incrementing EvidenceId
  mapping(address => OwnerData) public owners; // Owner => OwnerData
  mapping(address => AccessPolicy) internal acl; // SubOwner => Expiration-TimeStamp
  mapping(address => RequestType[]) internal requests; // MasterOwner => SubOwners (max 10)
  mapping(address => mapping(uint256 => EvidenceData)) public evidences; // Owner => (EvidenceId => Evidence)

  event EvidenceStored(
    address indexed owner,
    uint256 timestamp,
    bytes32 dataHash,
    string s3Link
  );

  event AccessGranted(address subOwner, uint256 expirationTime, string metaSignature);
  event OwnerAdded(address indexed owner, string name);
}
