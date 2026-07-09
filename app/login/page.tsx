"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Sprout, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clientApi } from "@/lib/client-api";
import { saveClientUser } from "@/lib/auth";

const schema = z.object({
  phone: z
    .string()
    .min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres")
    .regex(/^0[567]\d{8}$/, "Veuillez entrer un numéro de téléphone marocain valide (ex: 0612345678)"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginForm = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { phone: "", password: "" },
  });

  async function onSubmit(values: LoginForm) {
    try {
      const { data } = await clientApi.post("/auth/login", values);
      if (data.user.role !== "admin") {
        toast.error("Non autorisé : Cet espace est réservé aux administrateurs.");
        return;
      }
      saveClientUser(data.user);
      toast.success("Bienvenue dans votre espace d'administration");
      router.push("/admin");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Numéro de téléphone ou mot de passe incorrect";
      toast.error(message);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden bg-background font-sans">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-25 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600 to-green-300 blur-[130px] rounded-full" />
        </div>
      </div>

      <Card className="w-full max-w-md relative z-10 backdrop-blur-xl bg-background/85 border shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
            <Sprout className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Souk El Fellah - Admin</CardTitle>
          <CardDescription className="text-muted-foreground">
            Espace d'administration de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">Numéro de téléphone</Label>
              <Input
                id="phone"
                type="text"
                placeholder="0612345678"
                autoComplete="tel"
                {...form.register("phone")}
                className="text-left"
                dir="ltr"
              />
              {form.formState.errors.phone ? (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.phone.message}
                </p>
              ) : null}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            <Button className="w-full bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 font-semibold mt-2" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Se connecter
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
