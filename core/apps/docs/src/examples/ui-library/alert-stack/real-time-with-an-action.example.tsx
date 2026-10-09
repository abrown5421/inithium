import { useDispatch } from 'react-redux';
import { Button } from '@inithium/shared-ui-components';
import { showAlert } from '@inithium/shared-data-access';

const people = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Katherine Johnson'];

// Stands in for a real-time handler, e.g. a websocket message saying a friend request arrived.
export default function ExampleAlertStackRealTime() {
  const dispatch = useDispatch();
  const receiveRequest = () => {
    const name = people[Math.floor(Math.random() * people.length)];
    setTimeout(() => {
      dispatch(
        showAlert({
          icon: 'user-plus',
          title: 'New friend request',
          message: `${name} wants to connect.`,
          action: { label: 'View requests', href: '/getting-started' },
          duration: null,
        }),
      );
    }, 800);
  };

  return (
    <Button variant="outlined" leadingIcon="radio" onClick={receiveRequest}>
      Simulate a friend request
    </Button>
  );
}
