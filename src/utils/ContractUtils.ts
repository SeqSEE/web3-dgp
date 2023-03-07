import Deployment from '@/interfaces/Deployment';
import {NetworkType} from '@metrixcoin/metrilib';
import {contracts as MainNet} from '@/network/2.0.0/MainNet';
import {contracts as TestNet} from '@/network/2.0.0/TestNet';

const contracts: {MainNet: Deployment; TestNet: Deployment} = {
  MainNet: MainNet,
  TestNet: TestNet,
};

export const getDeployedContract = (network: NetworkType, name: string) => {
  const deployment = contracts[network ? network : 'MainNet'];
  return deployment[name as 'Budget' | 'DGP' | 'Governance'];
};
