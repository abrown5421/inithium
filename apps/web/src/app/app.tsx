import React from 'react';
import { Box, Text, Input} from '@inithium/ui';

const App = () => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  return (
    <Box direction="col" className="p-8 gap-6">
      <Text size="2xl" weight="bold" className="mb-4" color="primary">
        Welcome to Inithium
      </Text>

      {/* Basic Outlined Input */}
      <Input
        label="Username"
        placeholder="Enter your username"
        variant="outlined"
        color="primary"
        onChange={handleInputChange}
      />

      {/* Filled Input with Description */}
      <Input
        label="Email Address"
        placeholder="you@example.com"
        variant="filled"
        color="secondary"
        description="We'll never share your email."
      />

      {/* Input with Icons and Error State */}
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        invalid={true}
        error="Password is too short"
        leadingIcon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
</svg>
}
      />

      {/* Ghost Variant */}
      <Input
        label="Search"
        variant="ghost"
        placeholder="Search documentation..."
        size="lg"
      />
    </Box>
  );
};

export default App;