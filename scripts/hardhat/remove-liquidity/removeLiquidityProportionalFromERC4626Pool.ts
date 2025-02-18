import { parseEther, publicActions } from 'viem';
import { setupTokenBalances, aaveLidowETHwstETHPool, wETH, wstETH } from '../utils';
import hre from 'hardhat';

import {
  RemoveLiquidityKind,
  RemoveLiquidityBoostedV3,
  BalancerApi,
  Slippage,
  PermitHelper,
  RemoveLiquidityBoostedProportionalInput,
} from '@balancer/sdk';

// npx hardhat run scripts/hardhat/remove-liquidity/removeLiquidityProportionalFromERC4626Pool.ts
export async function removeLiquidityProportionalFromERC4626Pool() {
  // User defined inputs
  const chainId = hre.network.config.chainId!;
  const [walletClient] = await hre.viem.getWalletClients();
  const rpcUrl = hre.config.networks.hardhat.forking?.url as string;
  const slippage = Slippage.fromPercentage('1'); // 1%
  const kind = RemoveLiquidityKind.Proportional;
  const bptIn = {
    rawAmount: parseEther('1'),
    decimals: 18,
    address: aaveLidowETHwstETHPool,
  };
  const tokensOut = [wETH, wstETH]; // can be underlying or actual pool tokens

  const input: RemoveLiquidityBoostedProportionalInput = {
    chainId,
    rpcUrl,
    kind,
    bptIn,
    tokensOut,
  };

  const balancerApi = new BalancerApi('https://api-v3.balancer.fi/', chainId);
  const poolState = await balancerApi.boostedPools.fetchPoolStateWithUnderlyings(aaveLidowETHwstETHPool);

  const removeLiquidityBoosted = new RemoveLiquidityBoostedV3();
  const queryOutput = await removeLiquidityBoosted.query(input, poolState);

  const permit = await PermitHelper.signRemoveLiquidityBoostedApproval({
    ...queryOutput,
    slippage,
    client: walletClient.extend(publicActions),
    owner: walletClient.account,
  });

  const call = removeLiquidityBoosted.buildCallWithPermit({ ...queryOutput, slippage }, permit);

  const hash = await walletClient.sendTransaction({
    account: walletClient.account,
    data: call.callData,
    to: call.to,
    value: call.value,
  });

  return hash;
}

setupTokenBalances()
  .then(() => removeLiquidityProportionalFromERC4626Pool())
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
