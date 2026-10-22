import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { contentLockChannel, pagesChannel } from '../pages/pages.channels';
import { defineRealtimeChannel } from './realtime-channels.service';

describe('defineRealtimeChannel (decision 0121)', () => {
  const post = defineRealtimeChannel({ namespace: 'plugin-blog', kind: 'post', params: ['postId'], events: { 'comment.created': z.object({}) } });

  it('builds names from parameters and reads them back', () => {
    expect(post.pattern).toBe('plugin-blog:post/:postId');
    expect(post.name({ postId: 'abc123' })).toBe('plugin-blog:post/abc123');
    expect(post.match('plugin-blog:post/abc123')).toEqual({ postId: 'abc123' });
    expect(pagesChannel.name()).toBe('core:pages');
    expect(contentLockChannel.match('core:content-lock/p1/lock-1')).toEqual({ pageId: 'p1', lockId: 'lock-1' });
  });

  it('matches only its own names', () => {
    expect(post.match('plugin-blog:post')).toBeUndefined();
    expect(post.match('plugin-blog:post/a/b')).toBeUndefined();
    expect(post.match('plugin-blog:posts/a')).toBeUndefined();
    expect(post.match('plugin-blog:post/bad id')).toBeUndefined();
  });

  it('refuses missing or unsafe parameters', () => {
    expect(() => post.name()).toThrow();
    expect(() => post.name({ postId: 'a/b' })).toThrow();
  });

  it('refuses other namespaces and malformed event types', () => {
    expect(() => defineRealtimeChannel({ namespace: 'blog', kind: 'post', params: [], events: {} })).toThrow('namespace');
    expect(() => defineRealtimeChannel({ namespace: 'core', kind: 'x', params: [], events: { 'Bad Type': z.object({}) } })).toThrow('event');
  });
});
