import Head from 'next/head';
import {
  Accordion,
  Button,
  Container,
  Grid,
  Icon,
  Image,
  Message,
} from 'semantic-ui-react';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import React from 'react';
import styles from '@/styles/Home.module.css';
import Footer from '@/components/Footer';
import {NetworkType} from '@metrixcoin/metrilib';
import AboutDGP from '@/components/AboutDGP';
import ClientStatus from '@/components/ClientStatus';
import CreateProposalModal from '@/components/CreateProposalModal';
import DebugContracts from '@/components/DebugContracts';
import Proposals from '@/components/Proposals';

export default function Home() {
  const [debugging, setDebugging] = React.useState(false);
  const [enrolled, setEnrolled] = React.useState(false);
  const [connected, setConnected] = React.useState(false);
  const [network, setNetwork] = React.useState(
    undefined as NetworkType | undefined
  );
  const [address, setAddress] = React.useState(undefined as string | undefined);
  const [error, setError] = React.useState(false);
  const [message, setMessage] = React.useState('' as string | JSX.Element);
  const [debug, setDebug] = React.useState([] as JSX.Element[]);

  return (
    <>
      <Head>
        <title>Metrix DGP</title>
        <meta name='description' content='A web3 based governance dapp' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.png' />
      </Head>
      <main className={styles.main}>
        <Container>
          <Grid padded stackable stretched container>
            <Grid.Row stretched>
              <Grid.Column width='6'>
                <Header icon>
                  <Image
                    style={{width: '64px', height: '64px'}}
                    src='/images/logo.png'
                    alt='logo'
                  />
                  <Header.Content as='h1'>Metrix DGP</Header.Content>
                </Header>
              </Grid.Column>
              <Grid.Column width='10'></Grid.Column>
            </Grid.Row>
            <Grid.Row stretched>
              <Grid padded stackable>
                <Grid.Row>
                  <Grid.Column width='6' stretched>
                    <ClientStatus
                      network={network}
                      setNetwork={setNetwork}
                      connected={connected}
                      setConnected={setConnected}
                      address={address}
                      setAddress={setAddress}
                      enrolled={enrolled}
                      setEnrolled={setEnrolled}
                      setDebug={setDebug}
                      setError={setError}
                      setMessage={setMessage}
                    />
                  </Grid.Column>
                  <Grid.Column width='9' stretched>
                    <AboutDGP />
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Grid.Row>
            <Grid.Row stretched>
              <Grid.Column stretched width='16'>
                <Message hidden={!!!message} error={error} success={!error}>
                  {message}
                </Message>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row stretched columns='equal'>
              <Grid.Column></Grid.Column>
              <Grid.Column>
                {connected ? (
                  enrolled ? (
                    <CreateProposalModal
                      network={network}
                      trigger={
                        <Button color='green' inverted icon size='large'>
                          <Icon name='edit outline' />
                          Create New Proposal
                        </Button>
                      }
                    />
                  ) : (
                    ''
                  )
                ) : (
                  ''
                )}
              </Grid.Column>
              <Grid.Column></Grid.Column>
            </Grid.Row>
            <Grid.Row stretched>
              <Grid.Column stretched width={'16'}>
                <Proposals
                  network={network}
                  connected={connected}
                  enrolled={enrolled}
                  setError={setError}
                  setMessage={setMessage}
                />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row stretched>
              <Grid.Column width='16'>
                <DebugContracts
                  connected={connected}
                  debug={debug}
                  debugging={debugging}
                  setDebugging={setDebugging}
                />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row stretched>
              <Grid.Column stretched>
                <Footer />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Container>
      </main>
    </>
  );
}
