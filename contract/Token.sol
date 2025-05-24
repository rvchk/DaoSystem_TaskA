// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ERC20Bundle.sol";

contract Token is ERC20, ERC20Permit, ERC20Votes {
    address public Tom = 0xda82d8e188e355c380d77616B2b63b0267aA68eD;
    address public Ben = 0xa0Fddc85DA6Fbe53D2e7d55cbDa9a22c3620816C;
    address public Rick = 0x58E4a1126170CfA7CCF016a9362AE1a9f1c70914;
    address public Jack = 0xB6458438e80Ad9bd3DD3DdB5FB1942a139C1ffD3;

    uint256 allTokenSupply;

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) ERC20Permit(name) {
        allTokenSupply = initialSupply;
    }

    function giveStartTokens() public {
        mint(Tom, allTokenSupply / 4);
        mint(Ben, allTokenSupply / 4);
        mint(Rick, allTokenSupply / 4);
        mint(Jack, allTokenSupply / 4);
    }

    function mint(address account, uint256 amount) public {
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
    function _update(address from, address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._update(from, to, amount);
    }

    function nonces(address owner) public view virtual override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}