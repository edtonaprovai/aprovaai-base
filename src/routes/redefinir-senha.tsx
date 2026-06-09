import { createFileRoute, useNavigate } from "@tanstack/react-router";
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

const schema = z
  .object({
    senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
    confirmar: z.string(),
  })
  .refine((d) => d.senha === d.confirmar, {
    path: ["confirmar"],
    message: "As senhas não coincidem",
  });

type FormData = z.infer<typeof schema>;

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [
      { title: "Redefinir senha — AprovaAI" },
      { name: "description", content: "Defina uma nova senha para sua conta AprovaAI." },
    ],
  }),
  component: RedefinirSenhaPage,
});

function RedefinirSenhaPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { senha: "", confirmar: "" },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: data.senha });
    setSubmitting(false);
    if (error) {
      toast.error(traduzirErroAuth(error.message));
      return;
    }
    toast.success("Senha atualizada com sucesso!");
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <PublicLayout>
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md items-center px-4 py-10 md:px-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Redefinir senha</CardTitle>
            <CardDescription>Escolha uma nova senha de acesso.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="senha">Nova senha</Label>
                <Input
                  id="senha"
                  type="password"
                  autoComplete="new-password"
                  {...form.register("senha")}
                />
                {form.formState.errors.senha && (
                  <p className="text-xs text-destructive">{form.formState.errors.senha.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmar">Confirmar senha</Label>
                <Input
                  id="confirmar"
                  type="password"
                  autoComplete="new-password"
                  {...form.register("confirmar")}
                />
                {form.formState.errors.confirmar && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.confirmar.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar nova senha
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
