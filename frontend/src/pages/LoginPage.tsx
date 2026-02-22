import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
    IdCard,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    Gem,
    ChevronRight,
    Headset
} from 'lucide-react';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

const loginSchema = z.object({
    nik: z.string().regex(/^\d{2}-\d{5}$/, 'Format NIK tidak valid (contoh: 21-00123)'),
    password: z.string().min(1, 'Kata sandi wajib diisi'),
    rememberMe: z.boolean().default(false).optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            nik: '',
            password: '',
            rememberMe: false,
        },
    });

    const onSubmit = async (values: LoginFormValues) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', {
                nik: values.nik,
                password: values.password,
            });

            const { token, user } = response.data;
            const storage = values.rememberMe ? localStorage : sessionStorage;

            storage.setItem('token', token);
            storage.setItem('user', JSON.stringify(user));

            toast.success('Login berhasil!');
            navigate('/welcome');
        } catch (error: unknown) {
            let message = 'Gagal masuk. Silakan cek NIK dan kata sandi Anda.';
            if (axios.isAxiosError(error)) {
                message = error.response?.data?.message || error.message;
            }
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-background">
            {/* Left Panel - Branding & Image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 hover:scale-110"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1578314196155-246d61d15764?q=80&w=2070&auto=format&fit=crop')`,
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-primary/30" />

                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <Gem className="text-primary-foreground w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-xl tracking-tight">PT PRIMA SARANA GEMILANG</h2>
                            <p className="text-white/60 text-xs font-medium tracking-widest uppercase">Site Taliabu</p>
                        </div>
                    </div>

                    <div className="max-w-md">
                        <h1 className="text-6xl font-black text-white mb-6 leading-tight tracking-tighter">
                            BEBANG <br />
                            <span className="text-primary italic">Information</span> <br />
                            System
                        </h1>
                        <p className="text-white/70 text-lg leading-relaxed font-light">
                            Platform manajemen sumber daya manusia terpadu untuk efisiensi operasional dan pengembangan potensi karyawan.
                        </p>
                        <div className="mt-8 flex items-center gap-4 text-white/40 text-sm font-medium">
                            <div className="h-px w-12 bg-white/20" />
                            Efficiency • Excellence • Integrity
                        </div>
                    </div>

                    <div className="text-white/40 text-xs font-medium">
                        © {new Date().getFullYear()} PT Prima Sarana Gemilang. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-20 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

                <div className="w-full max-w-[420px] space-y-8 relative z-10">
                    <div className="text-center lg:text-left">
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                                <Gem className="text-primary-foreground w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">BEBANG System</h2>
                        </div>

                        <h3 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Masuk ke akun Anda</h3>
                        <p className="mt-3 text-muted-foreground font-medium">
                            Masukkan detail akses Anda untuk mengelola sistem.
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="nik"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Nomor Induk Karyawan (NIK)</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                                    <IdCard className="w-5 h-5" />
                                                </div>
                                                <Input
                                                    placeholder="xx-xxxxx (contoh: 21-00123)"
                                                    className="pl-11 h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-primary/10 transition-all rounded-xl"
                                                    {...field}
                                                    autoComplete="username"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Kata Sandi</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                                    <Lock className="w-5 h-5" />
                                                </div>
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="pl-11 pr-11 h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-primary/10 transition-all rounded-xl"
                                                    {...field}
                                                    autoComplete="current-password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-center justify-between">
                                <FormField
                                    control={form.control}
                                    name="rememberMe"
                                    render={({ field }) => (
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="remember"
                                                className="rounded-md"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                            <label
                                                htmlFor="remember"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                Ingat saya
                                            </label>
                                        </div>
                                    )}
                                />
                                <Button variant="link" className="px-0 text-primary font-bold text-sm h-auto hover:no-underline hover:text-primary/80" type="button">
                                    Lupa kata sandi?
                                </Button>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl text-md font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        Masuk Ke Sistem
                                        <ChevronRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>

                    <div className="pt-8 flex flex-col items-center gap-6">
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />

                        <p className="text-center text-sm text-muted-foreground">
                            Butuh bantuan akses? <br className="sm:hidden" />
                            <Button variant="link" className="px-1 text-primary font-bold h-auto">
                                Hubungi IT Support
                            </Button>
                        </p>

                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="icon" className="rounded-full w-10 h-10 border-muted-foreground/20 hover:bg-primary/5 hover:border-primary/40 transition-all">
                                <Headset className="w-5 h-5 text-muted-foreground hover:text-primary" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
