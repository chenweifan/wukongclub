import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { readAuthToken } from '@/data/authToken';
import { clearAllData } from '@/data/db/demoData';
import { ensureDemoUser } from '@/data/db/userData';
import { DEMO_CREDENTIALS } from '@/data/seeds/user.seed';
import { useSessionStore } from '@/entities/session';
import { LoginPanel } from '@/features/auth/LoginPanel';
import { useDemoStore } from '@/demo/demoStore';
import { COPY } from '@/utils/copy';

function renderPanel(initialMode?: 'login' | 'register') {
  return render(
    <MemoryRouter>
      <LoginPanel initialMode={initialMode} />
    </MemoryRouter>,
  );
}

async function fillLoginForm(username: string, password: string) {
  fireEvent.change(screen.getByLabelText(COPY.auth.username), { target: { value: username } });
  fireEvent.change(screen.getByLabelText(COPY.auth.password), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: COPY.auth.loginAction }));
}

describe('LoginPanel', () => {
  beforeEach(async () => {
    await clearAllData();
    useSessionStore.getState().markAnonymous();
  });

  it('本地校验先于请求：用户名不合规时不发请求、不产生令牌', async () => {
    renderPanel();

    await fillLoginForm('x', 'hmw-demo');

    expect(await screen.findByRole('alert')).toHaveTextContent(/用户名/);
    expect(readAuthToken()).toBeNull();
    expect(useSessionStore.getState().status).toBe('anonymous');
  });

  it('密码过短同样被本地规则拦下', async () => {
    renderPanel();

    await fillLoginForm('tianming', '123');

    expect(await screen.findByRole('alert')).toHaveTextContent(/密码/);
    expect(readAuthToken()).toBeNull();
  });

  it('一键登录演示账号后进入已登录态，入口收敛为「你已经登录了」', async () => {
    renderPanel();

    fireEvent.click(screen.getByRole('button', { name: COPY.auth.demoLogin }));

    await waitFor(() => {
      expect(useSessionStore.getState().status).toBe('authenticated');
    });
    expect(await screen.findByText(COPY.auth.alreadyLoggedIn)).toBeInTheDocument();
    expect(readAuthToken()).not.toBeNull();
  });

  it('用演示账号凭据登录同样成功（账号由首次播种创建）', async () => {
    // 真实应用里 demo 账号由 main.tsx 的首次播种创建；测试里显式补上这一步，
    // 因为上面的 beforeEach 刚清空了数据库
    await ensureDemoUser(new Date());

    renderPanel();

    await fillLoginForm(DEMO_CREDENTIALS.username, DEMO_CREDENTIALS.password);

    await waitFor(() => {
      expect(useSessionStore.getState().status).toBe('authenticated');
    });
  });

  it('密码错误时展示服务端错误（401 文案），且保持未登录', async () => {
    renderPanel();

    await fillLoginForm(DEMO_CREDENTIALS.username, 'wrong-password');

    expect(await screen.findByRole('alert')).toHaveTextContent(/用户名或密码/);
    expect(useSessionStore.getState().status).toBe('anonymous');
  });

  it('注册模式下会多出道号与确认密码字段，密码不一致被拦下', async () => {
    renderPanel('register');

    expect(screen.getByLabelText(COPY.auth.displayName)).toBeInTheDocument();
    expect(screen.getByLabelText(COPY.auth.passwordConfirm)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(COPY.auth.username), { target: { value: 'newcomer' } });
    fireEvent.change(screen.getByLabelText(COPY.auth.displayName), { target: { value: '新来的' } });
    fireEvent.change(screen.getByLabelText(COPY.auth.password), { target: { value: 'hmw-demo' } });
    fireEvent.change(screen.getByLabelText(COPY.auth.passwordConfirm), {
      target: { value: 'hmw-demo2' },
    });
    fireEvent.click(screen.getByRole('button', { name: COPY.auth.registerAction }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/不一致/);
  });

  it('注册成功后进入已登录态', async () => {
    renderPanel('register');

    fireEvent.change(screen.getByLabelText(COPY.auth.username), { target: { value: 'newcomer' } });
    fireEvent.change(screen.getByLabelText(COPY.auth.displayName), { target: { value: '新来的' } });
    fireEvent.change(screen.getByLabelText(COPY.auth.password), { target: { value: 'hmw-demo' } });
    fireEvent.change(screen.getByLabelText(COPY.auth.passwordConfirm), {
      target: { value: 'hmw-demo' },
    });
    fireEvent.click(screen.getByRole('button', { name: COPY.auth.registerAction }));

    await waitFor(() => {
      expect(useSessionStore.getState().user?.username).toBe('newcomer');
    });
  });

  it('断网态下提交得到统一失败提示（演示状态覆盖真实请求）', async () => {
    useDemoStore.getState().patch({ uiState: 'offline' });
    renderPanel();

    await fillLoginForm(DEMO_CREDENTIALS.username, DEMO_CREDENTIALS.password);

    expect(await screen.findByRole('alert')).toHaveTextContent(/网络|服务端/);
    expect(useSessionStore.getState().status).toBe('anonymous');
  });
});
