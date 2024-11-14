// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

contract DataStore {
    string public message;

    constructor(string memory initialMessage) {
        message = initialMessage;
    }

    function update(string memory newMessage) public {
        message = newMessage;
    }

    function retrieve() public view returns (string memory) {
        return message;
    }
}
