import {Accordion, Header, Icon} from 'semantic-ui-react';

interface DebugContractsProps {
  connected: boolean;
  debug: JSX.Element[];
  debugging: boolean;
  setDebugging(debugging: boolean): void;
}

export default function DebugContracts(props: DebugContractsProps) {
  return (
    <Accordion>
      <Accordion.Title
        active={props.debugging}
        onClick={() => props.setDebugging(!props.debugging)}
      >
        <Header as='h3'>
          <Icon name='dropdown' />
          Debug Contacts
        </Header>
      </Accordion.Title>
      <Accordion.Content active={props.debugging && props.connected}>
        {props.debug}
      </Accordion.Content>
    </Accordion>
  );
}
