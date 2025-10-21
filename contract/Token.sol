// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ERC20Bundle.sol";

contract Token is ERC20 {
    address internal Tom = 0x990221C5080023298D2abE4C43e07d7D844894a9;
    address internal Ben = 0xD6f9EDa37aC1445755F3ec3c5Fa51660Ca40678C;
    address internal Rick = 0x2cE921Bff1c951914B062f2557d6914521bb8E77;
    address internal Jack = 0xb7ec4240d2A4e5bfB8c398F13e7c47c4138b1A44;

    uint256 allTokenSupply;

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        allTokenSupply = initialSupply;
    }

    function giveStartTokens() external  {
        mint(Tom, allTokenSupply / 4);
        mint(Ben, allTokenSupply / 4);
        mint(Rick, allTokenSupply / 4);
        mint(Jack, allTokenSupply / 4);
    }

    function mint(address account, uint256 amount) public   {
        _mint(account, amount * (10 ** decimals()));
    }

    //Самописная функция для перевода токенов, принимает адрес от кого хотите передать, кому хотите, количество
    //Возвращает в случее успеха true
    function transferTokens(
        address from,
        address to,
        uint256 amount
    ) public returns (bool) {
        _transfer(from, to, amount);
        return true;
    }

    function decimals() public pure override returns(uint8) {
        return 12;
    }
}