// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract Store {
  struct EvidenceData {
    uint256 timestamp;
    string extension;
    string dataHash;
    uint256 size;
    string name;
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

  mapping(address => EvidenceData[]) public evidences; // Owner => (EvidenceId => Evidence)

  mapping(address => OwnerData) public owners; // Owner => OwnerData
  mapping(address => address) internal sentReq; // SubOwner => MasterOwner
  mapping(address => AccessPolicy) internal acl; // SubOwner => Access Rule & Control
  mapping(address => RequestType[]) internal requests; // MasterOwner => SubOwners (max 32)
  mapping(address => mapping(address => bool)) internal hasRequested; // SubOwners => (MasterOwner => Sent?)

  event EvidenceStored(
    address indexed owner,
    uint256 timestamp,
    string dataHash,
    uint256 size,
    string name
  );

  event AccessGranted(address subOwner, uint256 expirationTime, string metaSignature);
  event OwnerAdded(address indexed owner, string name);
}
