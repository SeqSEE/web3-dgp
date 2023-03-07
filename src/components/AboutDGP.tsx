import {Header, Segment} from 'semantic-ui-react';

export default function AboutDGP() {
  return (
    <Segment style={{paddingTop: '22px'}}>
      <Header as='h2'>About the Metrix DGP</Header>
      <hr />
      <Header as='h4' style={{marginTop: '5%'}}>
        <p>
          The Metrix community has the opportunity to affect change on-chain and
          off-chain. Metroids may make suggestions, propose a development
          (non-technological or technological) for a preliminary vote and may
          also submit proposals through the project&apos;s Governance Protocol.
        </p>
        <p>
          To activate a Governor, Metroids must lock 7.5M MRX in collateral. One
          responsibility of a Governor is to ping the network or participate in
          a vote every 28800 blocks, roughly every 30 days. Governors may pass,
          deny or abstain their vote on any given proposal.
        </p>
        <p>
          The minimum number of active Governors in the network to vote for
          budget and blockchain proposals is 100. The maximum number of
          Governors in the network is capped at 1,920. This is in line with
          approximately 1 Governor per block reward every 48 hours. If there is
          no Governor to receive the reward (e.g. The Governor already received
          a reward within the last 48 hours), then it goes to the development
          budget fund.
        </p>
        <p>
          The Governance Protocol ensures development through the ever growing
          Metroid Community. Metroids decide the direction of the project.
        </p>
      </Header>
    </Segment>
  );
}
