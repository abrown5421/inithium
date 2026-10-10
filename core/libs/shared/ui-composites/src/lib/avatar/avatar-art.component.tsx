import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { AvatarRecipe } from '@inithium/shared-contracts';
import { toCssColor } from '@inithium/shared-ui-components';
import { avatarBackground, loadAvatarStyle, loadedAvatarStyle, renderAvatar } from './avatar.service';

export type AvatarArtProps = {
  recipe: AvatarRecipe;
  name?: string;
  /** Names the image for screen readers; without it the art is hidden from them. */
  label?: string;
};

/**
 * Draws a recipe as a circle filling its positioned parent (internal to Avatar and its editor). Until the style's
 * definition loads, the circle shows its background alone, at the same size.
 */
export function AvatarArt({ recipe, name, label }: AvatarArtProps) {
  const [, setLoads] = useState(0);
  const entry = loadedAvatarStyle(recipe.style);
  useEffect(() => {
    if (entry) return;
    let current = true;
    loadAvatarStyle(recipe.style)
      .then(() => current && setLoads((count) => count + 1))
      .catch(() => undefined);
    return () => {
      current = false;
    };
  }, [entry, recipe.style]);

  const svg = useMemo(() => (entry ? renderAvatar(entry.style, recipe, name) : ''), [entry, recipe, name]);

  return (
    <span
      className="ui-avatar-circle"
      style={{ '--ui-avatar-bg': toCssColor(avatarBackground(recipe)) } as CSSProperties}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
