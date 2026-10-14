import { useState } from 'react';
import { bioFeatures, profileLimits, type RichTextDocument } from '@inithium/shared-contracts';
import { RichTextField } from '@inithium/shared-ui-composites';

export default function ExampleRichTextFieldBio() {
  const [bio, setBio] = useState<RichTextDocument | undefined>();
  return (
    <RichTextField
      label="Bio"
      value={bio}
      onChange={setBio}
      features={bioFeatures}
      maxLength={profileLimits.bio}
      minHeight={80}
      placeholder="A few words about you"
      helperText="Bold, italic and links only. Shift+Enter starts a new line."
    />
  );
}
