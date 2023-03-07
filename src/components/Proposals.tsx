import Budget from '@/abi/Budget';
import {getDeployedContract} from '@/utils/ContractUtils';
import {parseFromIntString} from '@/utils/MathUtils';
import {APIProvider, NetworkType} from '@metrixcoin/metrilib';
import {ethers} from 'ethers';
import React from 'react';
import {
  Button,
  Card,
  Container,
  Header,
  Icon,
  Segment,
} from 'semantic-ui-react';

interface ProposalsProps {
  network: NetworkType | undefined;
  connected: boolean;
  enrolled: boolean;
  setError(error: boolean): void;
  setMessage(message: string | JSX.Element): void;
}

export default function Proposals(props: ProposalsProps) {
  const [proposals, setProposals] = React.useState([] as JSX.Element[]);
  async function voteForProposal(id: string, vote: string) {
    const iface = new ethers.Interface(Budget);
    try {
      const encoded = iface.encodeFunctionData('voteForProposal(uint8,uint8)', [
        id,
        vote,
      ]);
      const call = await (window as any).metrimask.rpcProvider.rawCall(
        'sendtocontract',
        [
          getDeployedContract(
            props.network ? props.network : 'MainNet',
            'Budget'
          ),
          encoded.replace('0x', ''),
          0,
          250000,
          5000,
        ]
      );

      const response = JSON.parse(JSON.stringify(call));
      props.setError(response.txid != undefined);
      props.setMessage(
        <>
          <Header>Response</Header>
          <p
            style={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {response.txid ? (
              <a
                href="https://${
                  props.network === 'TestNet' ? 'testnet-' : ''
                }explorer.metrixcoin.com/tx/${
                  response.txid
                }"
                target='_blank'
              >
                {response.txid}
              </a>
            ) : (
              'No response'
            )}
          </p>
        </>
      );
    } catch (e) {
      const msg = (e as any).message ? (e as any).message : 'An error occurred';
      props.setError(true);
      props.setMessage(
        <>
          <Header>Error</Header>
          <p
            style={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {msg}
          </p>
        </>
      );
    }
  }

  const getProposals = async () => {
    let p: JSX.Element[] = [];
    const iface = new ethers.Interface(Budget);
    const n = props.network ? props.network : 'MainNet';
    const provider = new APIProvider(n);

    const call = await provider.callContract(
      getDeployedContract(n, 'Budget'),
      'proposalCount()',
      [],
      Budget
    );

    const count = BigInt(call ? call.toString() : 0);
    for (let i = BigInt(0); i < count; i++) {
      const call2 = await provider.callContract(
        getDeployedContract(n, 'Budget'),
        'proposals(uint256)',
        [`0x${i.toString(16)}`],
        Budget
      );

      if (call2) {
        const [
          id,
          owner,
          title,
          desc,
          url,
          requested,
          duration,
          durationsPaid,
          yesVote,
          noVote,
          remove,
        ] = call2.map((data: any) => {
          return `${data}`;
        });
        const card = (
          <Card key={`card${id}`} fluid>
            <Card.Content>
              <Card.Header>
                <strong>{title}</strong>
              </Card.Header>
              <Card.Meta>
                <div>{desc}</div>
                <div
                  style={{
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  Amount:{' '}
                  {parseFloat(
                    parseFromIntString(requested, 8)
                  ).toLocaleString()}{' '}
                  MRX
                </div>
                <div
                  style={{
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  Owner: {owner.replace('0x', '').toLowerCase()}
                </div>
                <div
                  style={{
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  <a
                    href={`${url}`}
                    target='_blank'
                    style={{
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {url}
                  </a>
                </div>
              </Card.Meta>
              <div>
                <span>Yes: {yesVote}&nbsp;&nbsp;&nbsp;</span>
                <span>No: {noVote}&nbsp;&nbsp;&nbsp;</span>
              </div>
              <Card.Description>
                <div>Duration: {duration}</div>
                <div>Durations Paid: {durationsPaid}</div>
              </Card.Description>
            </Card.Content>

            <Card.Content extra>
              <Button.Group fluid>
                <Button
                  inverted
                  color='green'
                  icon
                  style={{marginRight: '2px'}}
                  size='large'
                  onClick={() =>
                    voteForProposal(
                      `0x${BigInt(id).toString(16)}`,
                      `0x${BigInt(3).toString(16)}`
                    )
                  }
                >
                  <Icon name='thumbs up outline' />
                  Yes
                </Button>
                <Button
                  inverted
                  color='blue'
                  icon
                  style={{marginRight: '2px', marginLeft: '2px'}}
                  size='large'
                  onClick={() =>
                    voteForProposal(
                      `0x${BigInt(id).toString(16)}`,
                      `0x${BigInt(1).toString(16)}`
                    )
                  }
                >
                  <Icon name='hand peace outline' />
                  Abstain
                </Button>
                <Button
                  inverted
                  color='red'
                  icon
                  style={{marginLeft: '2px'}}
                  size='large'
                  onClick={() =>
                    voteForProposal(
                      `0x${BigInt(id).toString(16)}`,
                      `0x${BigInt(2).toString(16)}`
                    )
                  }
                >
                  <Icon name='thumbs down outline' />
                  No
                </Button>
              </Button.Group>
            </Card.Content>
          </Card>
        );
        p.push(card);
      }
    }

    setProposals(p);
  };

  React.useEffect(() => {
    if (window) {
      getProposals();
    }
  }, []);
  return (
    <Container>
      <Segment
        style={{
          maxHeight: '35vh',
          minHeight: '25vh',
          overflowY: 'scroll',
        }}
      >
        <Header as='h2'>Proposals</Header>

        {...proposals}
      </Segment>
    </Container>
  );
}
