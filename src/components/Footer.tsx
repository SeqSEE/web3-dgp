import {Grid, Icon, List} from 'semantic-ui-react';

export default function Footer(): JSX.Element {
  const d = new Date();
  return (
    <Grid className='footer-bar' columns='equal' stackable>
      <Grid.Row className='footerNavBar'>
        <Grid.Column>
          <List.Item as='a' href='https://metrixcoin.com' target='_blank'>
            <Icon name='bolt' />
            Powered by MetrixCoin
          </List.Item>
        </Grid.Column>

        <Grid.Column style={{padding: '0px 4px'}}>
          <a
            href={`https://github.com/TheLindaProjectInc/Budget-Proposals`}
            target='_blank'
            rel='noreferrer'
          >
            ©{`2022`}
            {d.getFullYear() !== Number(`2022`) ? `-${d.getFullYear()} ` : ' '}
            &nbsp;&nbsp;
            {`MetrixCoin Developers`}
          </a>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}
