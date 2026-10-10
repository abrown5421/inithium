import { useState } from 'react';
import type { AvatarRecipe, AvatarSerializableProps } from '@inithium/shared-contracts';
import { Container, Icon, Tooltip, type AnimationRuntimeProps } from '@inithium/shared-ui-components';
import { AvatarArt } from './avatar-art.component';
import { AvatarEditor } from './avatar-editor.component';
import { avatarStyleSheet } from './avatar.styles';
import { createAvatarRecipe } from './avatar.service';

export type AvatarProps = AvatarSerializableProps &
  AnimationRuntimeProps & {
    /** The avatar's recipe. With `value`, the avatar is controlled; otherwise it holds its own. */
    value?: AvatarRecipe;
    /** The starting recipe when uncontrolled. Default: the initials style with a random seed. */
    defaultValue?: AvatarRecipe;
    /** Called with the new recipe when the editor is saved. */
    onChange?: (recipe: AvatarRecipe) => void;
  };

/**
 * A circular identifier drawn by DiceBear (decision 0075) from a small recipe: one of 14 styles, a seed, and an
 * optional background, flip, rotation and scale. With `editable`, a pencil button on its edge opens a Modal to
 * change the recipe. Style definitions load on demand.
 */
export function Avatar({
  value,
  defaultValue,
  onChange,
  editable = false,
  name,
  label,
  width = 40,
  height = 40,
  margin,
  animation,
  show,
  replay,
  onEntranceEnd,
  onExitEnd,
}: AvatarProps) {
  const [own, setOwn] = useState(() => defaultValue ?? createAvatarRecipe());
  const recipe = value ?? own;
  const [editing, setEditing] = useState(false);

  const save = (next: AvatarRecipe) => {
    setOwn(next);
    onChange?.(next);
  };

  return (
    <>
      {/* React hoists this to <head> and keeps one copy however many render. */}
      <style href="inithium-avatar" precedence="default">
        {avatarStyleSheet}
      </style>
      <Container
        width={width}
        height={height}
        margin={margin}
        flexItem={{ shrink: 0 }}
        animation={animation}
        show={show}
        replay={replay}
        onEntranceEnd={onEntranceEnd}
        onExitEnd={onExitEnd}
      >
        <div className="ui-avatar">
          <AvatarArt recipe={recipe} name={name} label={label} />
          {editable && (
            <Tooltip content="Edit avatar">
              <button type="button" className="ui-avatar-edit" aria-label="Edit avatar" onClick={() => setEditing(true)}>
                <Icon name="pencil" size={14} />
              </button>
            </Tooltip>
          )}
        </div>
      </Container>
      {editable && <AvatarEditor open={editing} onOpenChange={setEditing} recipe={recipe} name={name} onSave={save} />}
    </>
  );
}
