import Budget from '@/abi/Budget';
import DGP from '@/abi/DGP';
import Governance from '@/abi/Governance';
import {getDeployedContract} from '@/utils/ContractUtils';
import {parseFromIntString} from '@/utils/MathUtils';
import {NetworkType} from '@metrixcoin/metrilib';
import {toHexAddress} from '@metrixcoin/metrilib/lib/utils/AddressUtils';
import {ethers} from 'ethers';
import React from 'react';
import {Card, Icon, Grid, Header, Button} from 'semantic-ui-react';
import ContractFunctions from './ContractFunctions';

interface ClientStatusProps {
  network: NetworkType | undefined;
  setNetwork(network: NetworkType | undefined): void;
  connected: boolean;
  setConnected(connected: boolean): void;
  enrolled: boolean;
  setEnrolled(enrolled: boolean): void;
  setDebug(debug: JSX.Element[]): void;
  setError(error: boolean): void;
  setMessage(message: string | JSX.Element): void;
  address: string | undefined;
  setAddress(address: string | undefined): void;
}

export default function ClientStatus(props: ClientStatusProps) {
  const [busy, setBusy] = React.useState(false);
  const [collateral, setCollateral] = React.useState('0.0');
  const [blockheight, setBlockheight] = React.useState(BigInt('0'));
  const [lastPing, setLastPing] = React.useState(BigInt('0'));
  const [lastReward, setLastReward] = React.useState(BigInt('0'));

  async function updateEnrollmentStatus(addr: string, network: NetworkType) {
    setBusy(true);
    const iface = new ethers.Interface(Governance);
    const encoded = iface.encodeFunctionData('governors(address)', [
      `0x${addr}`,
    ]);

    let decoded;
    try {
      const call = await (window as any).metrimask.rpcProvider.rawCall(
        'callcontract',
        [
          getDeployedContract(network ? network : 'MainNet', 'Governance'),
          encoded.replace('0x', ''),
        ]
      );
      const result = call.executionResult;

      try {
        decoded = iface.decodeFunctionResult(
          'governors(address)',
          `0x${result.output}`
        );
      } catch (e) {
        decoded = [result.excepted];
      }

      decoded = decoded?.map((data) => {
        return BigInt(data.toString());
      });

      const info = JSON.parse(
        JSON.stringify(
          await (
            await fetch(
              `https://${
                network === 'TestNet' ? 'testnet-' : ''
              }explorer.metrixcoin.com/api/info`
            )
          ).json()
        )
      );

      const [height, ping, collat, reward, addressIndex] = decoded;

      const mature =
        (info.height ? BigInt(info.height) : BigInt(0)) - height >
        BigInt(28 * 960);
      const diff =
        ((info.height ? BigInt(info.height) : BigInt(0)) -
          height -
          BigInt(28 * 960)) /
        BigInt(-960);
      if (height > BigInt(0) && ping > BigInt(0) && collat > BigInt(0)) {
        props.setEnrolled(true);
        setBlockheight(height);
        setLastPing(ping);
        setLastReward(reward);
        setCollateral(
          parseFloat(parseFromIntString(collat.toString(), 8)).toLocaleString()
        );
      }
    } catch (e) {
      console.log(e);
    }
    setBusy(false);
  }

  const handleMessage = async (
    message: any,
    handleAccountChanged: (payload?: any) => void
  ) => {
    if (message.data && message.data.target) {
      if (message.data.target.startsWith('metrimask') && message.data.message) {
        switch (message.data.message.type) {
          case 'GET_INPAGE_METRIMASK_ACCOUNT_VALUES':
            console.log('Updating MetriMask context');
            break;
          case 'METRIMASK_ACCOUNT_CHANGED':
            handleAccountChanged(message.data.message.payload);
            break;
          case 'METRIMASK_INSTALLED_OR_UPDATED':
            if (window) {
              window.location.reload();
            }
            break;
          case 'METRIMASK_WINDOW_CLOSE':
            console.log('Canceled!!!');
            handleAccountChanged();
            break;
          case 'SIGN_TX_URL_RESOLVED':
            break;
          case 'RPC_REQUEST':
            break;
          case 'RPC_RESPONSE':
            break;
          case 'RPC_SEND_TO_CONTRACT':
            break;
          default:
            break;
        }
      }
    }
  };

  function doHandleMessage(message: any): void {
    handleMessage(message, (payload) => {
      handleAccountChanged(payload);
    });
  }

  function handleAccountChanged(data: any): void {
    if (typeof data === 'undefined') {
      props.setNetwork(undefined);
      props.setAddress(undefined);
      props.setConnected(false);
      props.setEnrolled(false);
      return;
    }
    const account = data.account;
    if (account && account.loggedIn) {
      props.setAddress(toHexAddress(account.address));
      updateEnrollmentStatus(toHexAddress(account.address), account.network);
      props.setConnected(true);
      props.setError(false);
      props.setMessage('');
    } else {
      props.setNetwork(undefined);
      props.setAddress(undefined);
      props.setConnected(false);
      props.setEnrolled(false);
    }
    props.setDebug([
      <ContractFunctions
        network={props.network ? props.network : 'MainNet'}
        contract={'Budget'}
        address={getDeployedContract(
          props.network ? props.network : 'MainNet',
          'Budget'
        )}
        abi={Budget}
        key={0}
      />,
      <ContractFunctions
        network={props.network ? props.network : 'MainNet'}
        contract={'DGP'}
        address={getDeployedContract(
          props.network ? props.network : 'MainNet',
          'DGP'
        )}
        abi={DGP}
        key={1}
      />,
      <ContractFunctions
        network={props.network ? props.network : 'MainNet'}
        contract={'Governance'}
        address={getDeployedContract(
          props.network ? props.network : 'MainNet',
          'Governance'
        )}
        abi={Governance}
        key={3}
      />,
    ]);
  }

  async function enroll() {
    if (props.connected && !props.enrolled) {
      const iface = new ethers.Interface(Governance);
      const encoded = iface.encodeFunctionData('enroll()', []);
      try {
        const call = await (window as any).metrimask.rpcProvider.rawCall(
          'sendtocontract',
          [
            getDeployedContract(
              props.network ? props.network : 'MainNet',
              'Governance'
            ),
            encoded.replace('0x', ''),
            7500000,
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
        const msg = (e as any).message
          ? (e as any).message
          : 'An error occurred';
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
  }

  async function unenroll() {
    if (props.connected && props.enrolled) {
      const iface = new ethers.Interface(Governance);
      try {
        const encoded = iface.encodeFunctionData('unenroll(bool)', [false]);
        const call = await (window as any).metrimask.rpcProvider.rawCall(
          'sendtocontract',
          [
            getDeployedContract(
              props.network ? props.network : 'MainNet',
              'Governance'
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
        const msg = (e as any).message
          ? (e as any).message
          : 'An error occurred';
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
  }

  async function ping() {
    if (props.connected && props.enrolled) {
      const iface = new ethers.Interface(Governance);
      const encoded = iface.encodeFunctionData('ping()', []);
      try {
        const call = await (window as any).metrimask.rpcProvider.rawCall(
          'sendtocontract',
          [
            getDeployedContract(
              props.network ? props.network : 'MainNet',
              'Governance'
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
        const msg = (e as any).message
          ? (e as any).message
          : 'An error occurred';
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
  }

  React.useEffect(() => {
    if (window) {
      if (
        (window as any).metrimask &&
        (window as any).metrimask.account &&
        (window as any).metrimask.account.loggedIn === true
      ) {
        props.setAddress(
          toHexAddress((window as any).metrimask.account.address)
        );
        props.setNetwork(
          (window as any).metrimask.account.network as NetworkType
        );
      }
      window.addEventListener('message', doHandleMessage, false);
      window.postMessage({message: {type: 'CONNECT_METRIMASK'}}, '*');
    }
  }, []);
  return (
    <Card
      fluid
      style={{padding: '10%'}}
      color={props.connected ? (props.enrolled ? 'green' : 'yellow') : 'red'}
    >
      <Card.Header as='h3' textAlign='center' style={{padding: '7px'}}>
        {busy ? (
          <>
            <Icon loading name='cog' size='big' /> Loading
          </>
        ) : props.connected ? (
          props.enrolled ? (
            <>
              <Icon name='check circle outline' size='big' color='green' />{' '}
              Enrolled
            </>
          ) : (
            <>
              <Icon name='times circle outline' size='big' color='yellow' /> Not
              Enrolled
            </>
          )
        ) : (
          <>
            <Icon name='unlink' size='big' color='red' /> Not Connected
          </>
        )}
      </Card.Header>
      <Card.Meta textAlign='center'>
        {busy ? (
          ''
        ) : props.connected ? (
          props.enrolled ? (
            <Grid container padded textAlign='center'>
              <Grid.Row stretched></Grid.Row>
              <Grid.Row stretched>
                <Header as='h4'>
                  Enrollment:{' '}
                  <a
                    href={`https://${
                      props.network === 'TestNet' ? 'testnet-' : ''
                    }explorer.metrixcoin.com/block/${blockheight.toString()}`}
                    target='_blank'
                  >
                    {blockheight.toString()}
                  </a>
                </Header>
              </Grid.Row>
              <Grid.Row stretched>
                <Header as='h4'>Collateral: {collateral} MRX</Header>
              </Grid.Row>
            </Grid>
          ) : (
            <Grid container padded textAlign='center'>
              <Grid.Row stretched>
                <Header as='h4'>
                  Paticipating in the DGP requires 7.5 million MRX to be locked
                  as collateral.
                </Header>
              </Grid.Row>
            </Grid>
          )
        ) : (
          <Grid container padded textAlign='center'>
            <Grid.Row stretched>
              <Header as='h4'>No Metrix Web3 wallet connected.</Header>
            </Grid.Row>
          </Grid>
        )}
      </Card.Meta>
      <Card.Description textAlign='center'>
        {busy ? (
          ''
        ) : props.connected ? (
          props.enrolled ? (
            <Grid container padded textAlign='center'>
              <Grid.Row stretched>
                <Header as='h4'>
                  Last Ping:{' '}
                  <a
                    href={`https://${
                      props.network === 'TestNet' ? 'testnet-' : ''
                    }explorer.metrixcoin.com/block/${lastPing.toString()}`}
                    target='_blank'
                  >
                    {lastPing.toString()}
                  </a>
                </Header>
              </Grid.Row>
              <Grid.Row stretched>
                <Header as='h4'>
                  Last Reward:{' '}
                  {lastReward > BigInt(0) ? (
                    <a
                      href={`https://${
                        props.network === 'TestNet' ? 'testnet-' : ''
                      }explorer.metrixcoin.com/block/${lastReward.toString()}`}
                      target='_blank'
                    >
                      {lastReward.toString()}
                    </a>
                  ) : (
                    'Never'
                  )}
                </Header>
              </Grid.Row>
            </Grid>
          ) : (
            <Grid container padded textAlign='center'>
              <Grid.Row stretched>
                <Header as='h4'>Enroll as a governor to continue.</Header>
              </Grid.Row>
            </Grid>
          )
        ) : (
          <Grid container padded textAlign='center'>
            <Grid.Row stretched>
              <Header as='h4'>
                Install and connect a Metrix compatible Web3 wallet to get
                started.
              </Header>
            </Grid.Row>
          </Grid>
        )}
      </Card.Description>
      <Card.Content extra>
        <Grid container padded>
          {busy ? (
            ''
          ) : props.connected ? (
            props.enrolled ? (
              <Grid.Row stretched>
                <Button.Group widths={'4'}>
                  <Button
                    inverted
                    color='red'
                    content='Unenroll'
                    compact
                    style={{marginRight: '2px'}}
                    className='change'
                    size='large'
                    onClick={() => unenroll()}
                  />

                  <Button
                    inverted
                    color='green'
                    content='Ping'
                    compact
                    style={{marginLeft: '2px'}}
                    size='large'
                    onClick={() => ping()}
                  />
                </Button.Group>
              </Grid.Row>
            ) : (
              <Grid.Row stretched columns='1'>
                <Button
                  inverted
                  color='green'
                  content='Enroll'
                  fluid
                  size='large'
                  onClick={() => enroll()}
                />
              </Grid.Row>
            )
          ) : (
            <Grid.Row stretched>
              <Grid.Column stretched textAlign='center'>
                <a
                  href='https://chrome.google.com/webstore/detail/metrimask/pgjlaaokfffcapdcakncnhpmigjlnpei'
                  target='_blank'
                >
                  <Icon name='chrome' />
                  MetriMask for Chrome (Desktop)
                </a>
              </Grid.Column>
            </Grid.Row>
          )}
        </Grid>
      </Card.Content>
    </Card>
  );
}
