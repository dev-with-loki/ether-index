import { expect } from "chai";
import { ethers } from "hardhat";

describe("EtherIndexFund full flow", function () {
  it("deploys, creates a fund, buys, rebalances, and sells in one test", async function () {
    const [deployer, user, treasury] = await ethers.getSigners();

    // Deploy mocks
    const Oracle = await ethers.getContractFactory("MockOracle");
    const oracle = await Oracle.deploy();
    await oracle.waitForDeployment();

    const Weth = await ethers.getContractFactory("MockWETH");
    const weth = await Weth.deploy();
    await weth.waitForDeployment();

    const Router = await ethers.getContractFactory("MockRouter");
    const router = await Router.deploy(await weth.getAddress());
    await router.waitForDeployment();

    const Token = await ethers.getContractFactory("MockToken");
    const tokenA = await Token.deploy("Mock Token A", "MTA", 18);
    const tokenB = await Token.deploy("Mock Token B", "MTB", 18);
    await Promise.all([tokenA.waitForDeployment(), tokenB.waitForDeployment()]);

    // Configure oracle prices (8 decimals)
    const priceDecimals = 10n ** 8n;
    await oracle.setPrice(ethers.ZeroAddress, 2_000n * priceDecimals);
    await oracle.setPrice(await tokenA.getAddress(), 1_000n * priceDecimals);
    await oracle.setPrice(await tokenB.getAddress(), 500n * priceDecimals);

    // Deploy ETI token and factory
    const EtiToken = await ethers.getContractFactory("ETIToken");
    const eti = await EtiToken.deploy(deployer.address);
    await eti.waitForDeployment();

    const Factory = await ethers.getContractFactory("FundFactory");
    const factory = await Factory.deploy(
      await eti.getAddress(),
      await oracle.getAddress(),
      treasury.address,
      await router.getAddress(),
      await weth.getAddress(),
      deployer.address,
    );
    await factory.waitForDeployment();

    // Create a fund
    const creationFee = await factory.creationFee();
    await eti.mint(user.address, creationFee);
    await eti.connect(user).approve(await factory.getAddress(), creationFee);

    const tokens = [await tokenA.getAddress(), await tokenB.getAddress()];
    await factory.connect(user).createFund("Integration Fund", "IFD", tokens);

    const fundAddress = await factory.etherIndexFunds(0);
    const fund = await ethers.getContractAt("EtherIndexFund", fundAddress);

    expect(await fund.fundName()).to.equal("Integration Fund");
    expect(await fund.creator()).to.equal(user.address);
    expect(await fund.getUnderlyingTokens()).to.deep.equal(tokens);

    // Buy flow
    const buyValue = ethers.parseEther("1");
    const buyTx = await fund.connect(user).buy({ value: buyValue });
    await buyTx.wait();

    const userFundTokens = await fund.balanceOf(user.address);
    expect(userFundTokens).to.be.gt(0n);
    expect(await fund.getTokenBalance(tokens[0])).to.be.gt(0n);
    expect(await fund.getTokenBalance(tokens[1])).to.be.gt(0n);

    // Rebalance flow
    const newProportions = [70n, 30n];
    await fund.connect(user).setProportions(tokens, newProportions);
    expect(await fund.targetProportions(tokens[0])).to.equal(newProportions[0]);
    expect(await fund.targetProportions(tokens[1])).to.equal(newProportions[1]);

    // Sell flow
    const preSellEth = await ethers.provider.getBalance(user.address);
    const sellTx = await fund.connect(user).sell(userFundTokens);
    const sellReceipt = await sellTx.wait();
    const postSellEth = await ethers.provider.getBalance(user.address);
    const gasPrice = sellReceipt?.effectiveGasPrice ?? sellTx.gasPrice ?? 0n;
    const gasSpent = sellReceipt?.gasUsed ? sellReceipt.gasUsed * gasPrice : 0n;
    const netReceived = postSellEth + gasSpent - preSellEth;

    expect(await fund.balanceOf(user.address)).to.equal(0n);
    expect(netReceived).to.be.gt(0n);
  });
});
