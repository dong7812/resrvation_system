import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export const useLogin = () => {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post<{ accessToken: string; admin: any }>('/auth/login', data),
    onSuccess: (res: any) => {
      localStorage.setItem('access_token', res.accessToken);
      setAuth(res.accessToken, res.admin);
      router.push('/dashboard');
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  return () => {
    localStorage.removeItem('access_token');
    logout();
    router.push('/login');
  };
};
