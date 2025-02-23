import { parseEther, publicActions } from 'viem';
import { setupTokenBalances, aaveLidowETHwstETHPool } from '../utils';
import hre from 'hardhat';

import {
  RemoveLiquidityKind,
  RemoveLiquidity,
  BalancerApi,
  Slippage,
  PermitHelper,
  RemoveLiquidityProportionalInput,
  InputAmount,
} from '@balancer/sdk';

// npx hardhat run scripts/hardhat/remove-liquidity/removeLiquidityProportional.ts
export async function removeLiquidityProportional() {
  // User defined inputs
  const chainId = hre.network.config.chainId!;
  const [walletClient] = await hre.viem.getWalletClients();
  const rpcUrl = hre.config.networks.hardhat.forking?.url as string;
  const kind = RemoveLiquidityKind.Proportional;
  const bptIn: InputAmount = {
    rawAmount: parseEther('1'),
    decimals: 18,
    address: aaveLidowETHwstETHPool,
  };
  const slippage = Slippage.fromPercentage('25'); // 25% TODO: fix insane slippage requirement

  const balancerApi = new BalancerApi('https://api-v3.balancer.fi/', chainId);
  const poolState = await balancerApi.pools.fetchPoolState(aaveLidowETHwstETHPool);

  const removeLiquidityInput: RemoveLiquidityProportionalInput = {
    chainId,
    rpcUrl,
    kind,
    bptIn,
  };

  // Query addLiquidity to get the amount of BPT out
  const removeLiquidity = new RemoveLiquidity();
  const queryOutput = await removeLiquidity.query(removeLiquidityInput, poolState);

  console.log('\nRemove Liquidity Query Output:');
  console.log(`BPT In: ${queryOutput.bptIn.amount.toString()}`);
  console.table({
    tokensOut: queryOutput.amountsOut.map((a) => a.token.address),
    amountsOut: queryOutput.amountsOut.map((a) => a.amount),
  });

  // Use helper to create the necessary permit2 signatures
  const permit = await PermitHelper.signRemoveLiquidityApproval({
    ...queryOutput,
    slippage,
    client: walletClient.extend(publicActions),
    owner: walletClient.account,
  });

  // Applies slippage to the BPT out amount and constructs the call
  const call = removeLiquidity.buildCallWithPermit({ ...queryOutput, slippage }, permit);

  console.log('\nWith slippage applied:');
  console.log(`Max BPT In: ${call.maxBptIn.amount}`);
  console.table({
    tokensOut: call.minAmountsOut.map((a) => a.token.address),
    minAmountsOut: call.minAmountsOut.map((a) => a.amount),
  });

  const hash = await walletClient.sendTransaction({
    account: walletClient.account,
    data: call.callData,
    to: call.to,
    value: call.value,
  });

  return hash;
}

setupTokenBalances()
  .then(() => removeLiquidityProportional())
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
