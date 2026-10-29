'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { styled } from '@yak/react';

import { radiusMd, textSm } from '@/styles/tokens';

type Mode = 'light' | 'dark' | 'system';

const STORE_KEY = 'aq-theme';
const THEME_EVENT = 'aq-theme-change';

function subscribe(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
}

function getSnapshot(): Mode {
  return (localStorage.getItem(STORE_KEY) as Mode | null) ?? 'system';
}

function getServerSnapshot(): Mode {
  return 'system';
}

function apply(mode: Mode) {
  const dark =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}

const Group = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border-radius: ${radiusMd};
  border: 1px solid var(--aq-border);
  background: var(--aq-muted);
`;

const Option = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 26px;
  border-radius: calc(${radiusMd} - 3px);
  color: var(--aq-muted-fg);
  font-size: ${textSm};
  transition:
    background-color 140ms ease,
    color 140ms ease;

  &:hover {
    color: var(--aq-fg);
  }

  &[data-active='true'] {
    background: var(--aq-card);
    color: var(--aq-fg);
    box-shadow: var(--aq-shadow-sm);
  }
`;

export function ThemeToggle() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    apply(mode);
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => apply(mode);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [mode]);

  function select(next: Mode) {
    localStorage.setItem(STORE_KEY, next);
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <Group>
      <Option
        type="button"
        data-active={mode === 'light'}
        onClick={() => select('light')}
        aria-label="Light theme"
      >
        <Sun size={14} />
      </Option>
      <Option
        type="button"
        data-active={mode === 'dark'}
        onClick={() => select('dark')}
        aria-label="Dark theme"
      >
        <Moon size={14} />
      </Option>
      <Option
        type="button"
        data-active={mode === 'system'}
        onClick={() => select('system')}
        aria-label="System theme"
      >
        <Monitor size={14} />
      </Option>
    </Group>
  );
}
