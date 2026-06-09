import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { traduzirErroAuth } from "@/lib/auth-errors";

const schema = z.object({ email: z.string().email("E-mail inválido") });
type FormData = z.infer<typeof schema>;

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — AprovaAI" },
      { name: "description", content: "Recupere o acesso à sua conta AprovaAI." },
    ],
  }),
  component: RecuperarSenhaPage,
});

function RecuperarSenhaPage() {
  const [submitting, setSubmitting] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setSubmitting(false);
    if (error) {
      toast.error(traduzirErroAuth(error.message));
      return;
    }
    setEnviado(true);
    toast.success("E-mail de recuperação enviado!");
  };

  return (
    <PublicLayout>
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md items-center px-4 py-10 md:px-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Recuperar senha</CardTitle>
            <CardDescription>
              Enviaremos um link para o seu e-mail para redefinir sua senha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {enviado ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Enviamos um e-mail com instruções. Verifique sua caixa de entrada.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login">Voltar para o login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar link
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  <Link to="/login" className="text-primary hover:underline">
                    Voltar para o login
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
