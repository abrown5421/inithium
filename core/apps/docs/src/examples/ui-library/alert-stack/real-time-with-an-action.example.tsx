import { useDispatch } from 'react-redux';
import { Button } from '@inithium/shared-ui-components';
import { showAlert } from '@inithium/shared-data-access';

const people = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Katherine Johnson'];

// Stands in for the sender's avatar URL from the API: a picture of their initials.
const avatarOf = (name: string) => {
  const initials = name.split(' ').map((part) => part[0]).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#7c3aed"/><text x="16" y="21" font-family="sans-serif" font-size="13" font-weight="700" fill="#fff" text-anchor="middle">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

// Stands in for a real-time handler, e.g. a websocket message saying a friend request arrived.
export default function ExampleAlertStackRealTime() {
  const dispatch = useDispatch();
  const receiveRequest = () => {
    const name = people[Math.floor(Math.random() * people.length)];
    setTimeout(() => {
      dispatch(
        showAlert({
          image: { src: avatarOf(name), alt: name },
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
