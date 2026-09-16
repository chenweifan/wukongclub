import { useState } from 'react';
import type { FormEvent } from 'react';

import { useNavigate } from 'react-router-dom';

import { validatePassword, validateRegisterInput, validateUsername } from '@/data/contracts/user';
import { DEMO_CREDENTIALS } from '@/data/seeds/demoAccount';
import { useSession, useSessionActions } from '@/entities/session';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { pushToast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';
import { COPY } from '@/utils/copy';

type AuthMode = 'login' | 'register';

export interface LoginPanelProps {
  /** 初始标签页：story 与单测需要确定的首帧，运行期由用户切换。 */
  initialMode?: AuthMode;
}

const MODE_OPTIONS = [
  { value: 'login' as const, label: COPY.auth.loginTab },
  { value: 'register' as const, label: COPY.auth.registerTab },
];

interface FormValues {
  username: string;
  displayName: string;
  password: string;
  passwordConfirm: string;
}

const EMPTY_FORM: FormValues = { username: '', displayName: '', password: '', passwordConfirm: '' };

/**
 * 注册 / 登录面板。
 *
 * 校验顺序刻意是「本地规则 → 提交」：本地规则与 mock 后端共用同一份
 * （src/data/contracts/user.ts），因此不会出现「前端说没问题、后端 400」的体验割裂。
 * 服务端错误（用户名被占用、密码错误、演示断网态）统一显示在表单下方的 alert 区。
 */
export function LoginPanel({ initialMode = 'login' }: LoginPanelProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [localError, setLocalError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSession();
  const { login, register, loginAsDemo, isPending, error, clearError } = useSessionActions();

  const update = (key: keyof FormValues, value: string) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setLocalError(null);
    clearError();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (mode === 'login') {
      const usernameCheck = validateUsername(values.username);
      if (!usernameCheck.ok) {
        setLocalError(usernameCheck.message);
        return;
      }
      const passwordCheck = validatePassword(values.password);
      if (!passwordCheck.ok) {
        setLocalError(passwordCheck.message);
        return;
      }

      const loggedIn = await login({ username: values.username, password: values.password });
      if (loggedIn !== null) {
        pushToast(COPY.auth.loginSuccess(loggedIn.displayName), 'success');
        void navigate('/user');
      }
      return;
    }

    const check = validateRegisterInput(values);
    if (!check.ok) {
      setLocalError(check.message);
      return;
    }

    const registered = await register({
      username: values.username,
      displayName: values.displayName,
      password: values.password,
    });
    if (registered !== null) {
      pushToast(COPY.auth.registerSuccess(registered.displayName), 'success');
      void navigate('/user');
    }
  };

  const handleDemoLogin = async () => {
    const demoUser = await loginAsDemo();
    if (demoUser !== null) {
      pushToast(COPY.auth.demoLoginSuccess(demoUser.displayName), 'success');
      void navigate('/user');
    }
  };

  if (isAuthenticated && user !== null) {
    return (
      <section className="panel-scroll texture-grain p-6 text-center">
        <h1 className="font-display text-xl">{COPY.auth.alreadyLoggedIn}</h1>
        <p className="mt-2 text-sm text-content-muted">
          {COPY.session.openProfile(user.displayName)}
        </p>
        <button
          type="button"
          onClick={() => {
            void navigate('/user');
          }}
          className="bg-accent text-accent-ink mt-4 rounded-scroll px-4 py-2 text-sm"
        >
          {COPY.auth.toGrowthCenter}
        </button>
      </section>
    );
  }

  return (
    <section className="panel-scroll texture-grain p-6">
      <h1 className="font-display text-xl">{COPY.auth.title}</h1>
      <p className="mt-2 text-xs leading-relaxed text-content-muted">{COPY.auth.description}</p>

      <div className="mt-4">
        <SegmentedControl
          label={COPY.auth.title}
          value={mode}
          options={MODE_OPTIONS}
          onChange={(next) => {
            setMode(next);
            setLocalError(null);
            clearError();
          }}
        />
      </div>

      <form
        className="mt-4 space-y-3"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <Field
          id="auth-username"
          label={COPY.auth.username}
          placeholder={COPY.auth.usernamePlaceholder}
          value={values.username}
          autoComplete="username"
          onChange={(value) => {
            update('username', value);
          }}
        />

        {mode === 'register' ? (
          <Field
            id="auth-display-name"
            label={COPY.auth.displayName}
            placeholder={COPY.auth.displayNamePlaceholder}
            value={values.displayName}
            autoComplete="nickname"
            onChange={(value) => {
              update('displayName', value);
            }}
          />
        ) : null}

        <Field
          id="auth-password"
          label={COPY.auth.password}
          placeholder={COPY.auth.passwordPlaceholder}
          value={values.password}
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          onChange={(value) => {
            update('password', value);
          }}
        />

        {mode === 'register' ? (
          <Field
            id="auth-password-confirm"
            label={COPY.auth.passwordConfirm}
            placeholder={COPY.auth.passwordPlaceholder}
            value={values.passwordConfirm}
            type="password"
            autoComplete="new-password"
            onChange={(value) => {
              update('passwordConfirm', value);
            }}
          />
        ) : null}

        {localError !== null ? (
          <p role="alert" className="text-danger text-xs">
            {localError}
          </p>
        ) : error === null ? null : (
          <p role="alert" className="text-danger text-xs">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="bg-accent text-accent-ink w-full rounded-scroll px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {mode === 'login' ? COPY.auth.loginAction : COPY.auth.registerAction}
        </button>
      </form>

      <div className="border-token border-line mt-4 border-t pt-4">
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            void handleDemoLogin();
          }}
          className="border-token border-line hover:text-accent w-full rounded-scroll border px-4 py-2 text-sm disabled:opacity-60"
        >
          {COPY.auth.demoLogin}
        </button>
        <p className="mt-2 text-[11px] leading-relaxed text-content-muted">
          {COPY.auth.demoHint(DEMO_CREDENTIALS.username, DEMO_CREDENTIALS.password)}
        </p>
      </div>
    </section>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'password';
  autoComplete?: string;
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete,
}: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-xs text-content-muted">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        className={cn(
          'border-token border-line bg-surface-2 mt-1 w-full rounded-scroll border px-3 py-2 text-sm text-content',
          'placeholder:text-content-muted focus:border-accent',
        )}
      />
    </div>
  );
}
