import { useState, type CSSProperties } from 'react';
import type { AvatarRecipe, AvatarSerializableProps, SolidColorValue } from '@inithium/shared-contracts';
import { Container, Icon, Tooltip, toCssColor, type AnimationRuntimeProps } from '@inithium/shared-ui-components';
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
    /**
     * An uploaded picture to show instead of the generated art (decision 0098). If it fails to load, the recipe is
     * drawn instead, so the avatar is never blank.
     */
    image?: { src: string };
    /** Adds 'Upload a picture' to the editor, which closes it and calls this; the app does the uploading. */
    onUpload?: () => void;
    /**
     * A status light on the bottom-right edge (decision 0124), e.g. `{ color: 'green', label: 'Active' }`: the label
     * shows in a tooltip and is read by screen readers. With it, the edit button moves to the top-right edge.
     */
    presence?: { color: SolidColorValue; label: string };
  };

/**
 * A circular identifier drawn by DiceBear (decision 0075) from a small recipe: one of 14 styles, a seed, and an
 * optional background, flip, rotation and scale. With `editable`, a pencil button on its edge opens a Modal to
 * change the recipe. Style definitions load on demand. `presence` adds a status light (decision 0124).
 */
export function Avatar({
  value,
  defaultValue,
  onChange,
  image,
  onUpload,
  presence,
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
  // The address that failed to load, if any: the generated art shows in its place.
  const [failed, setFailed] = useState<string | null>(null);
  const picture = image && image.src !== failed ? image.src : undefined;

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
          {picture ? (
            <img className="ui-avatar-circle ui-avatar-photo" src={picture} alt={label ?? ''} aria-hidden={label ? undefined : true} onError={() => setFailed(picture)} />
          ) : (
            <AvatarArt recipe={recipe} name={name} label={label} />
          )}
          {editable && (
            <Tooltip content="Edit avatar">
              <button
                type="button"
                className="ui-avatar-edit"
                data-corner={presence ? 'top' : undefined}
                aria-label="Edit avatar"
                onClick={() => setEditing(true)}
              >
                <Icon name="pencil" size={14} />
              </button>
            </Tooltip>
          )}
          {presence && (
            <Tooltip content={presence.label}>
              {/* A plain span: the light is a dot positioned on the circle's edge, which no component draws. */}
              <span className="ui-avatar-presence" role="img" aria-label={presence.label} style={{ '--ui-avatar-presence': toCssColor(presence.color) } as CSSProperties} />
            </Tooltip>
          )}
        </div>
      </Container>
      {editable && <AvatarEditor open={editing} onOpenChange={setEditing} recipe={recipe} name={name} onSave={save} hasImage={Boolean(picture)} onUpload={onUpload} />}
    </>
  );
}
