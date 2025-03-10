// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @dev All contract addresses used by example scripts
 * @notice all contract addresses are for Ethereum Mainnet
 */
contract AddressRegistry {
    address internal permit2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

    // balancer v3 infrastructure
    address internal router = 0x5C6fb490BDFD3246EB0bB062c168DeCAF4bD9FDd;
    address internal compositeRouter = 0xb21A277466e7dB6934556a1Ce12eb3F032815c8A;

    // pool & tokens
    address internal aaveLidowETHwstETHPool = 0xc4Ce391d82D164c166dF9c8336DDF84206b2F812; // pool
    address internal wETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2; //underlying
    address internal waEthLidowETH = 0x0FE906e030a44eF24CA8c7dC7B7c53A6C4F00ce9; // boosted
    address internal stETH = 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84; // use to get wstETH
    address internal wstETH = 0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0; // underlying
    address internal waEthLidowstETH = 0x775F661b0bD1739349b9A2A3EF60be277c5d2D29; // boosted
}
