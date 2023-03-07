import Budget from '@/abi/Budget';
import DGP from '@/abi/DGP';
import {getDeployedContract} from '@/utils/ContractUtils';
import {toSatoshi} from '@/utils/MathUtils';
import {NetworkType} from '@metrixcoin/metrilib';
import {
  EthereumAddressRegex,
  HexAddressRegex,
} from '@metrixcoin/metrilib/lib/utils/AddressUtils';
import {ethers} from 'ethers';
import React from 'react';
import {
  Button,
  Container,
  Dropdown,
  DropdownProps,
  Form,
  Grid,
  Header,
  Input,
  InputOnChangeData,
  Menu,
  Message,
  Modal,
  TextArea,
  TextAreaProps,
} from 'semantic-ui-react';

interface CreateProposalProps {
  trigger: JSX.Element;
  network: NetworkType | undefined;
}

enum DGPProposalType {
  GAS_SCHEDULE = 1,
  BLOCK_SIZE = 2,
  MIN_GAS_PRICE = 3,
  BLOCK_GAS_LIMIT = 4,
  TX_FEE_RATES = 5,
  COLLATERAL = 6,
  BUDGET_FEE = 7,
}

export default function CreateProposalModal(props: CreateProposalProps) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [url, setURL] = React.useState('');
  const [requested, setRequested] = React.useState(BigInt('0'));
  const [duration, setDuration] = React.useState(0);
  const budgetForm: JSX.Element = (
    <>
      <Form>
        <Form.Field required>
          <label>Title</label>
          <Input
            type='text'
            fluid
            placeholder='Title for proposal'
            onChange={(
              event: React.ChangeEvent<HTMLInputElement>,
              data: InputOnChangeData
            ) => {
              setTitle(data.value ? data.value : '');
            }}
          />
        </Form.Field>
        <Form.Field required>
          <label>Description</label>
          <TextArea
            placeholder='A description of the proposal'
            rows={6}
            onChange={(
              event: React.ChangeEvent<HTMLTextAreaElement>,
              data: TextAreaProps
            ) => {
              setDescription(data.value ? `${data.value}` : '');
            }}
          />
        </Form.Field>
        <Form.Field required>
          <label>URL</label>
          <Input
            type='text'
            fluid
            placeholder='URL to a webpage about the proposal'
            onChange={(
              event: React.ChangeEvent<HTMLInputElement>,
              data: InputOnChangeData
            ) => {
              setURL(data.value ? data.value : '');
            }}
          />
        </Form.Field>
        <Form.Field required>
          <label>Requested</label>
          <Input
            type='number'
            fluid
            placeholder='Amount of MRX requested'
            min={0}
            onChange={(
              event: React.ChangeEvent<HTMLInputElement>,
              data: InputOnChangeData
            ) => {
              setRequested(
                data.value ? BigInt(toSatoshi(data.value)) : BigInt('0')
              );
            }}
          />
        </Form.Field>
        <Form.Field required>
          <label>Duration in months</label>
          <Input
            type='number'
            fluid
            placeholder='How many months to receive the MRX funds'
            min={1}
            max={12}
            onChange={(
              event: React.ChangeEvent<HTMLInputElement>,
              data: InputOnChangeData
            ) => {
              setDuration(data.value ? Number(data.value) : 0);
            }}
          />
        </Form.Field>
      </Form>
    </>
  );
  const [propType, setPropType] = React.useState(DGPProposalType.GAS_SCHEDULE);
  const [proposalAddress, setProposalAddress] = React.useState('');
  const dgpForm: JSX.Element = (
    <>
      <Form>
        <Form.Field required>
          <label>DGP Proposal Type</label>
          <Menu fluid>
            <Dropdown
              defaultValue={1}
              options={[
                {key: 1, text: 'Gas Schedule', value: 1},
                {key: 2, text: 'Block Size', value: 2},
                {key: 3, text: 'Min Gas Price', value: 3},
                {key: 4, text: 'Block Gas Limit', value: 4},
                {key: 5, text: 'Tx Fee Rates', value: 5},
                {key: 6, text: 'Collateral', value: 6},
                {key: 7, text: 'Budget Fee', value: 7},
              ]}
              item
              fluid
              inline
              selection
              onChange={(
                event: React.SyntheticEvent<HTMLElement>,
                data: DropdownProps
              ) => {
                setPropType(data.value as DGPProposalType);
              }}
            />
          </Menu>
        </Form.Field>
        <Form.Field required>
          <label>Proposed Address</label>
          <Input
            type='text'
            fluid
            placeholder='Contract Address'
            onChange={(
              event: React.ChangeEvent<HTMLInputElement>,
              data: InputOnChangeData
            ) => {
              setProposalAddress(data.value ? `${data.value}` : '');
            }}
          />
        </Form.Field>
      </Form>
    </>
  );
  const [open, setOpen] = React.useState(false);
  const [proposalType, setProposalType] = React.useState(
    'budget' as 'budget' | 'dgp'
  );
  const [form, setForm] = React.useState(budgetForm);
  const [error, setError] = React.useState(false);
  const [message, setMessage] = React.useState('' as string | JSX.Element);

  function reset() {
    setProposalType('budget');
    setForm(budgetForm);
    setMessage('');
    setError(false);
    setTitle('');
    setDescription('');
    setURL('');
    setRequested(BigInt('0'));
    setDuration(0);
    setPropType(DGPProposalType.GAS_SCHEDULE);
    setProposalAddress('');
  }

  function updateForm(
    data: string | number | boolean | (string | number | boolean)[] | undefined
  ) {
    setMessage('');
    if (data === 'dgp') {
      setForm(dgpForm);
      setProposalType(data);
    } else if (data === 'budget') {
      setForm(budgetForm);
      setProposalType(data);
    }
  }

  async function submitProposal() {
    switch (proposalType) {
      case 'budget': {
        if (
          !title ||
          title.length == 0 ||
          !description ||
          description.length == 0 ||
          !url ||
          url.length == 0
        ) {
          setError(true);
          setMessage(
            <>
              <Header>Error</Header>
              <p>
                Invalid arguments to create a Budget proposal. Check the inputs
                are correct.
              </p>
            </>
          );
          return;
        }
        const iface = new ethers.Interface(Budget);
        try {
          const encoded = iface.encodeFunctionData(
            'startProposal(string, string, string, uint256, uint8)',
            [
              title,
              description,
              url,
              `0x${requested.toString(16)}`,
              `0x${BigInt(duration).toString(16)}`,
            ]
          );
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
          setError(response.txid != undefined);
          setMessage(
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
          setError(true);
          setMessage(
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
          return;
        }
      }
      case 'dgp': {
        if (
          !proposalAddress.match(EthereumAddressRegex) &&
          !proposalAddress.match(HexAddressRegex)
        ) {
          console.log(
            `propType:${propType}`,
            `proposalAddress:${proposalAddress}`
          );
          setError(true);
          setMessage(
            <>
              <Header>Error</Header>
              <p>
                Invalid arguments to create a DGP proposal. Check the inputs are
                correct.
              </p>
            </>
          );
          return;
        }
        const iface = new ethers.Interface(DGP);
        try {
          const encoded = iface.encodeFunctionData(
            'addProposal(uint8,address)',
            [
              `0x${BigInt(propType)}`,
              proposalAddress.startsWith('0x')
                ? proposalAddress
                : `0x${proposalAddress}`,
            ]
          );
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
          setError(response.txid != undefined);
          setMessage(
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
          setError(true);
          setMessage(
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
        return;
      }
      default:
        return false;
    }
  }

  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={props.trigger}
    >
      <Container className='darkModal' style={{padding: '12px'}}>
        <Modal.Header as='h2'>Create New Proposal</Modal.Header>
        <Modal.Content style={{color: 'black'}}>
          <Modal.Description>
            <Container>
              <Grid padded>
                <Grid.Row stretched>
                  <Grid.Column stretched>
                    <Form>
                      <Form.Field required>
                        <label>Proposal Type</label>
                        <Menu fluid>
                          <Dropdown
                            defaultValue='budget'
                            options={[
                              {key: 1, text: 'Budget', value: 'budget'},
                              {key: 2, text: 'DGP', value: 'dgp'},
                            ]}
                            item
                            fluid
                            selection
                            inline
                            onChange={(
                              event: React.SyntheticEvent<HTMLElement>,
                              data: DropdownProps
                            ) => {
                              updateForm(data.value);
                            }}
                          />
                        </Menu>
                      </Form.Field>
                    </Form>
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column>{form}</Grid.Column>
                </Grid.Row>
              </Grid>
            </Container>
          </Modal.Description>
          <Message hidden={!!!message} error={error} success={!error}>
            {message}
          </Message>
        </Modal.Content>
        <Modal.Actions>
          <br />
          <Button
            color='red'
            onClick={() => {
              reset();
              setOpen(false);
            }}
            inverted
            size='large'
          >
            Cancel
          </Button>
          <Button
            color='green'
            onClick={() => submitProposal()}
            inverted
            size='large'
          >
            Create Proposal
          </Button>
        </Modal.Actions>
      </Container>
    </Modal>
  );
}
