//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/**
 * Oracle Interface for fetching token prices
 * Implementations should return prices scaled to 8 decimals.
 * @author Ether Index
 */
interface IOracle {
    /**
     * @dev Get the current price of a token in USD with 8 decimals
     * @param token The token address to get price for
     * @return price The current price in USD (8 decimals)
     */
    function getPrice(address token) external view returns (uint256 price);

    /**
     * @dev Associate a token with its Pyth price feed id
     * @param token Token address
     * @param priceId Pyth price feed id (bytes32)
     */
    function setPriceFeed(address token, bytes32 priceId) external;
}
