// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ERC20Bundle.sol";

contract Token is ERC20, ERC20Permit, ERC20Votes {
    address public Tom = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;
    address public Ben = 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2;
    address public Rick = 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db;
    address public Jack = 0xb7ec4240d2A4e5bfB8c398F13e7c47c4138b1A44;

    uint256 allTokenSupply;

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) ERC20Permit(name) {
        allTokenSupply = initialSupply;
    }

    function giveStartTokens() external  {
        mint(Tom, allTokenSupply / 4);
        mint(Ben, allTokenSupply / 4);
        mint(Rick, allTokenSupply / 4);
        mint(Jack, allTokenSupply / 4);

        _delegate(Tom, Tom);
        _delegate(Ben, Ben);
        _delegate(Rick, Rick);
        _delegate(Jack, Jack);
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

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}