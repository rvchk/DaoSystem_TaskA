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
        uint256 totalSupply
    ) ERC20(name, symbol) ERC20Permit(name) {
        allTokenSupply = totalSupply;
    }

    // Функция для выдачи стартовых токенов пользователям, а также _delegate чтобы они могли голосовать от своего имени
    function giveStartTokens() public {
        mint(Tom, allTokenSupply / 4);
        mint(Ben, allTokenSupply / 4);
        mint(Rick, allTokenSupply / 4);
        mint(Jack, allTokenSupply / 4);

        _delegate(Tom, Tom);
        _delegate(Ben, Ben);
        _delegate(Rick, Rick);
        _delegate(Jack, Jack);
    }

    function mint(address account, uint256 value) public {
        _mint(account, value * (10 ** decimals()));
    }

    // Функция для получения количества нулей, в задании 12
    function decimals() public pure override returns (uint8) {
        return 12;
    }

    // Функция перевода токенов
    function transferTokens(
        address from,
        address to,
        uint256 value
    ) public payable {
        _transfer(from, to, value);
    }

    // Зависимость ERC20Votes и ERC20Permit
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }

    // Зависимость ERC20Votes и ERC20Permit
    function nonces(
        address owner
    ) public view virtual override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}
