import { RadioGroup } from '@inithium/shared-ui-components';

export default function ExampleRadioGroupBasic() {
  return (
    <RadioGroup
      label="Delivery"
      defaultValue="standard"
      options={[
        { value: 'standard', label: 'Standard', helperText: '3–5 working days, free' },
        { value: 'express', label: 'Express', helperText: 'Next working day, £4.99' },
        { value: 'collect', label: 'Click and collect', helperText: 'Ready in 2 hours' },
      ]}
    />
  );
}
