import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";

const formSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide." }),
  password: z.string().min(1, { message: "Le mot de passe est requis." }),
});

const Login = () => {
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: values.email,
          password: values.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail || "Erreur lors de la connexion");
        return;
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);

      // Décoder le token pour récupérer le rôle
      const payload = JSON.parse(atob(data.access_token.split(".")[1]));
      const userRole = payload.role;

      if (userRole === "merchant") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Erreur réseau ou serveur :", error);
      alert("Erreur réseau ou serveur.");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-50/30 px-4">
      <Card className="mx-auto max-w-[450px] w-full shadow-2xl border-0 rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl">
        <CardHeader className="space-y-2 text-center pt-10 pb-6">
          <CardTitle className="text-3xl font-black tracking-tight">Bon retour !</CardTitle>
          <CardDescription className="text-base font-medium">
            Entrez vos accès pour continuer votre expérience.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-gray-700">Email</FormLabel>
                    <FormControl>
                      <Input className="h-12 border-orange-100 focus:border-orange-500 focus:ring-orange-500 transition-all rounded-xl" placeholder="jean.dupont@exemple.com" {...field} />
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
                    <div className="flex items-center justify-between">
                      <FormLabel className="font-bold text-gray-700">Mot de passe</FormLabel>
                      <Link to="#" className="text-sm text-orange-600 font-bold hover:underline">Oublié ?</Link>
                    </div>
                    <FormControl>
                      <Input type="password" className="h-12 border-orange-100 focus:border-orange-500 focus:ring-orange-500 transition-all rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-14 text-lg font-black bg-orange-500 hover:bg-orange-600 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 rounded-2xl">
                Se connecter
              </Button>
            </form>
          </Form>
          <div className="mt-8 text-center text-sm font-medium text-gray-600">
            Nouveau parmi nous ?{" "}
            <Link to="/register" className="text-orange-600 font-black hover:underline">
              Créer un compte
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
