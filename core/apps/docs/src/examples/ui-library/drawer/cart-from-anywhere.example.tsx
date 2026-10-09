import { useDispatch } from 'react-redux';
import { Button, Container, Divider, Text } from '@inithium/shared-ui-components';
import { Drawer } from '@inithium/shared-ui-composites';
import { openModal, useModal } from '@inithium/shared-data-access';

const lines = [
  { name: 'Linen shirt', price: 48 },
  { name: 'Canvas tote', price: 22 },
];

// Declared once, e.g. at the app root, and opened through the same global state as modals.
function CartDrawer() {
  const cart = useModal('docs-cart');
  return (
    <Drawer
      {...cart.modalProps}
      title="Your cart"
      description="2 items"
      footer={
        <Container flex={{ align: 'center', justify: 'between' }}>
          <Text fontWeight={700}>Total: $70</Text>
          <Button leadingIcon="lock" onClick={cart.close}>Check out</Button>
        </Container>
      }
    >
      <Container flex={{ direction: 'column', gap: 12 }}>
        {lines.map((line) => (
          <Container key={line.name} flex={{ direction: 'column', gap: 12 }}>
            <Container flex={{ justify: 'between' }}>
              <Text>{line.name}</Text>
              <Text>${line.price}</Text>
            </Container>
            <Divider />
          </Container>
        ))}
      </Container>
    </Drawer>
  );
}

// Anywhere else, e.g. a header button.
function CartButton() {
  const dispatch = useDispatch();
  return <Button variant="outlined" leadingIcon="shopping-cart" onClick={() => dispatch(openModal('docs-cart'))}>Cart (2)</Button>;
}

export default function ExampleDrawerCart() {
  return (
    <>
      <CartButton />
      <CartDrawer />
    </>
  );
}
