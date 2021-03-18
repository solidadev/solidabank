const Token = artifacts.require("Token");
const SolidaBank = artifacts.require("SolidaBank");

module.exports = async function(deployer) {
	//deploy Token
	await deployer.deploy(Token)

	//assign token into variable to get it's address
	const token = await Token.deployed()
	//pass token address for SolidaBank contract(for future minting)
	await deployer.deploy(SolidaBank, token.address)
	//assign SolidaBank contract into variable to get it's address
	const solidabank = await SolidaBank.deployed()
	//change token's owner/minter from deployer to SolidaBank
	await token.passMinterRole(solidabank.address)
};