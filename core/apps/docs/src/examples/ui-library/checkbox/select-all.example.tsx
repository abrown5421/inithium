import { useState } from 'react';
import { Checkbox, Container } from '@inithium/shared-ui-components';

const toppings = ['Mushrooms', 'Olives', 'Peppers'];

export default function ExampleCheckboxSelectAll() {
  const [chosen, setChosen] = useState<string[]>(['Olives']);
  const all = chosen.length === toppings.length ? true : chosen.length === 0 ? false : 'indeterminate';

  return (
    <Container flex={{ direction: 'column' }}>
      <Checkbox label="All toppings" checked={all} onCheckedChange={(checked) => setChosen(checked === true ? toppings : [])} />
      <Container flex={{ direction: 'column' }} padding={{ left: 26 }}>
        {toppings.map((topping) => (
          <Checkbox
            key={topping}
            label={topping}
            checked={chosen.includes(topping)}
            onCheckedChange={(checked) =>
              setChosen((current) => (checked === true ? [...current, topping] : current.filter((item) => item !== topping)))
            }
          />
        ))}
      </Container>
    </Container>
  );
}
