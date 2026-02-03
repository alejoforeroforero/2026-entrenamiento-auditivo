import '@testing-library/jest-dom';
import React from 'react';

jest.mock('@heroui/react', () => {
  return {
    Button: ({ children, onPress, isDisabled, isIconOnly, color, variant, className, as: Component, href, ...rest }: any) => {
      const Elem = Component || 'button';
      return React.createElement(Elem, {
        onClick: onPress,
        disabled: isDisabled,
        className,
        href,
        'data-icon-only': isIconOnly,
        'data-color': color,
        'data-variant': variant,
        ...rest
      }, children);
    },
    Slider: ({ value, onChange, isDisabled, minValue, maxValue, step, className }: any) => (
      React.createElement('input', {
        type: 'range',
        value,
        onChange: (e: any) => onChange?.(parseInt(e.target.value)),
        disabled: isDisabled,
        min: minValue,
        max: maxValue,
        step,
        className,
        'aria-label': 'slider'
      })
    ),
    Card: ({ children, isPressable, isHoverable, onPress, className }: any) => (
      isPressable
        ? React.createElement('div', { onClick: onPress, className, role: 'button', tabIndex: 0 }, children)
        : React.createElement('div', { className }, children)
    ),
    CardHeader: ({ children, className }: any) => React.createElement('div', { className }, children),
    CardBody: ({ children, className }: any) => React.createElement('div', { className }, children),
    Chip: ({ children, color, variant, size, className }: any) => (
      React.createElement('span', { className, 'data-color': color, 'data-variant': variant, 'data-size': size }, children)
    ),
    Avatar: ({ src, name, showFallback, className }: any) => (
      React.createElement('div', { className, 'data-src': src }, name)
    ),
    Input: ({ label, name, defaultValue, value, onChange, isRequired, placeholder, type, className }: any) => (
      React.createElement('input', { name, defaultValue, value, onChange, required: isRequired, placeholder, type, className, 'aria-label': label })
    ),
    Tabs: ({ children, defaultSelectedKey, classNames }: any) => (
      React.createElement('div', { 'data-selected': defaultSelectedKey }, children)
    ),
    Tab: ({ children, title, key }: any) => React.createElement('div', { 'data-key': key }, title, children),
    Accordion: ({ children, selectionMode, defaultSelectedKeys, variant, className }: any) => (
      React.createElement('div', { className }, children)
    ),
    AccordionItem: ({ children, title, classNames }: any) => (
      React.createElement('div', null, React.createElement('div', null, title), React.createElement('div', null, children))
    ),
    Dropdown: ({ children, placement }: any) => React.createElement('div', null, children),
    DropdownTrigger: ({ children }: any) => children,
    DropdownMenu: ({ children, 'aria-label': ariaLabel, className, disabledKeys }: any) => (
      React.createElement('div', { 'aria-label': ariaLabel, className }, children)
    ),
    DropdownItem: ({ children, onPress, as: Component, href, startContent, color, className }: any) => {
      const Elem = Component || 'div';
      return React.createElement(Elem, { onClick: onPress, href, className }, startContent, children);
    },
    DropdownSection: ({ children, showDivider, className }: any) => React.createElement('div', { className }, children),
    Modal: ({ children, isOpen, onOpenChange, size, scrollBehavior }: any) => (
      isOpen ? React.createElement('div', { role: 'dialog' }, typeof children === 'function' ? children(() => onOpenChange?.(false)) : children) : null
    ),
    ModalContent: ({ children }: any) => React.createElement('div', null, typeof children === 'function' ? children(() => {}) : children),
    ModalHeader: ({ children }: any) => React.createElement('div', null, children),
    ModalBody: ({ children, className }: any) => React.createElement('div', { className }, children),
    ModalFooter: ({ children }: any) => React.createElement('div', null, children),
    Select: ({ children, label, name, defaultSelectedKeys, selectedKeys, onSelectionChange, isRequired, placeholder, className, size, items }: any) => (
      React.createElement('select', {
        name,
        'aria-label': label,
        required: isRequired,
        className,
        defaultValue: defaultSelectedKeys?.[0],
        value: selectedKeys?.[0],
        onChange: (e: any) => onSelectionChange?.(new Set([e.target.value]))
      }, typeof children === 'function' ? items?.map(children) : children)
    ),
    SelectItem: ({ children, key }: any) => React.createElement('option', { value: key }, children),
    useDisclosure: () => ({ isOpen: false, onOpen: jest.fn(), onOpenChange: jest.fn(), onClose: jest.fn() }),
  };
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;

class AudioContext {
  createGain() {
    return { connect: jest.fn(), gain: { value: 1 } };
  }
  createOscillator() {
    return { connect: jest.fn(), start: jest.fn(), stop: jest.fn(), frequency: { value: 440 } };
  }
  createDynamicsCompressor() {
    return { connect: jest.fn() };
  }
  get destination() {
    return {};
  }
  resume() {
    return Promise.resolve();
  }
  close() {
    return Promise.resolve();
  }
}

global.AudioContext = AudioContext as unknown as typeof window.AudioContext;

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});
