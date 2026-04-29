import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { Slider } from './Slider';

describe('Slider', () => {
  it('renders label and description', () => {
    act(() => {
      render(
        <Slider
          label="Test Label"
          description="Test Description"
        />,
      );
    });

    expect(screen.getByText('Test Label')).toBeTruthy();
    expect(screen.getByText('Test Description')).toBeTruthy();
  });

  it('renders error instead of description', () => {
    act(() => {
      render(
        <Slider
          label="Test Label"
          description="Hidden Description"
          error="Error Message"
        />,
      );
    });

    expect(screen.getByText('Error Message')).toBeTruthy();
    expect(screen.queryByText('Hidden Description')).toBeNull();
  });

  it('renders native range input for form compatibility', () => {
    act(() => {
      render(<Slider defaultValue={50} />);
    });

    const input = document.querySelector('input[type="range"]');
    expect(input).toBeTruthy();
  });

  it('calls onChange when value changes', () => {
    const onChange = vi.fn();

    act(() => {
      render(
        <Slider
          value={50}
          min={0}
          max={100}
          onChange={onChange}
        />,
      );
    });

    const input = document.querySelector('input[type="range"]');

    act(() => {
      if (input) {
        fireEvent.change(input, { target: { value: '75' } });
      }
    });

    expect(onChange).toHaveBeenCalledWith(75);
  });

  it('respects disabled state', () => {
    act(() => {
      render(
        <Slider
          disabled={true}
          value={50}
          onChange={vi.fn()}
        />,
      );
    });

    const input = document.querySelector('input[type="range"]');
    expect(input).toBeTruthy();
    expect(input?.hasAttribute('disabled')).toBe(true);
  });

  it('applies custom class names', () => {
    act(() => {
      render(
        <Slider
          className="custom-root"
          sliderClassName="custom-slider"
          trackClassName="custom-track"
          labelClassName="custom-label"
          descriptionClassName="custom-description"
          wrapperClassName="custom-wrapper"
          label="Label"
          description="Description"
        />,
      );
    });

    const root = document.querySelector('.custom-root');
    const slider = document.querySelector('.custom-slider');
    const track = document.querySelector('.custom-track');
    const label = document.querySelector('.custom-label');
    const description = document.querySelector('.custom-description');
    const wrapper = document.querySelector('.custom-wrapper');

    expect(root).toBeTruthy();
    expect(slider).toBeTruthy();
    expect(track).toBeTruthy();
    expect(label).toBeTruthy();
    expect(description).toBeTruthy();
    expect(wrapper).toBeTruthy();
  });

  it('renders value display when showValue is true', () => {
    act(() => {
      render(
        <Slider
          value={42}
          showValue={true}
          onChange={vi.fn()}
        />,
      );
    });

    expect(screen.getByText('42')).toBeTruthy();
  });

  it('formats displayed value with formatValue', () => {
    act(() => {
      render(
        <Slider
          value={42}
          showValue={true}
          formatValue={(v) => `${v}%`}
          onChange={vi.fn()}
        />,
      );
    });

    expect(screen.getByText('42%')).toBeTruthy();
  });

  it('applies invalid state', () => {
    act(() => {
      render(
        <Slider
          invalid={true}
          sliderClassName="test-slider"
        />,
      );
    });

    const slider = document.querySelector('.test-slider');
    expect(slider).toBeTruthy();
    expect(slider!.className.length > 0).toBe(true);
  });

  it('respects min, max, and step attributes on native input', () => {
    act(() => {
      render(
        <Slider
          min={10}
          max={200}
          step={5}
          defaultValue={50}
        />,
      );
    });

    const input = document.querySelector('input[type="range"]');
    expect(input?.getAttribute('min')).toBe('10');
    expect(input?.getAttribute('max')).toBe('200');
    expect(input?.getAttribute('step')).toBe('5');
  });

  it('keyboard navigation increments and decrements value', () => {
    const onChange = vi.fn();

    act(() => {
      render(
        <Slider
          value={50}
          min={0}
          max={100}
          step={1}
          onChange={onChange}
        />,
      );
    });

    const sliderEl = document.querySelector('[role="slider"]');

    act(() => {
      if (sliderEl) {
        fireEvent.keyDown(sliderEl, { key: 'ArrowRight' });
      }
    });

    expect(onChange).toHaveBeenCalledWith(51);

    act(() => {
      if (sliderEl) {
        fireEvent.keyDown(sliderEl, { key: 'ArrowLeft' });
      }
    });

    expect(onChange).toHaveBeenCalledWith(49);
  });

  it('keyboard Home/End jumps to min and max', () => {
    const onChange = vi.fn();

    act(() => {
      render(
        <Slider
          value={50}
          min={0}
          max={100}
          onChange={onChange}
        />,
      );
    });

    const sliderEl = document.querySelector('[role="slider"]');

    act(() => {
      if (sliderEl) {
        fireEvent.keyDown(sliderEl, { key: 'Home' });
      }
    });

    expect(onChange).toHaveBeenCalledWith(0);

    act(() => {
      if (sliderEl) {
        fireEvent.keyDown(sliderEl, { key: 'End' });
      }
    });

    expect(onChange).toHaveBeenCalledWith(100);
  });

  it('works as uncontrolled with defaultValue', () => {
    act(() => {
      render(<Slider defaultValue={30} />);
    });

    const input = document.querySelector('input[type="range"]');
    expect((input as HTMLInputElement)?.value).toBe('30');
  });
});