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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Phone, MessageSquare } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  nom: z.string().min(1, { message: "Le nom est requis." }),
  prenom: z.string().min(1, { message: "Le prénom est requis." }),
  email: z.string().email({ message: "Adresse email invalide." }),
  telephone: z.string().min(1, { message: "Le numéro de téléphone est requis." }),
  whatsapp: z.string().url({ message: "Veuillez entrer un lien WhatsApp valide (ex: https://wa.me/...)." }).optional().or(z.literal('')),
  ville: z.string().min(1, { message: "La ville est requise." }),
  quartier: z.string().min(1, { message: "Le quartier est requis." }),
  role: z.enum(["client", "marchand"], {
    required_error: "Vous devez sélectionner un rôle.",
  }),
  password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      whatsapp: "",
      ville: "",
      quartier: "",
      password: "",
      confirmPassword: "",
      role: "client",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    const roleForBackend = values.role === 'marchand' ? 'merchant' : 'client';

    const userPayload = {
      first_name: `${values.prenom} ${values.nom}`,
      email: values.email,
      phone: values.telephone,
      location: `${values.ville} - ${values.quartier}`,
      role: roleForBackend, 
      password: values.password,
    };
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail || "Erreur lors de l'inscription");
        return;
      }

      alert("Inscription réussie !");
      navigate("/login");

    } catch (error) {
      console.error("Erreur réseau :", error);
      alert("Erreur réseau ou serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-50/30 py-16 px-4">
      <Card className="mx-auto max-w-[550px] w-full shadow-2xl border-0 rounded-[2.5rem] overflow-hidden bg-white/90 backdrop-blur-xl">
        <CardHeader className="space-y-2 text-center pt-12 pb-8">
          <CardTitle className="text-4xl font-black tracking-tight text-gray-900">Rejoindre <span className="text-orange-500">Ahimin</span></CardTitle>
          <CardDescription className="text-base font-semibold text-gray-600">
            Créez votre compte en quelques instants.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-10 pb-12">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="prenom"
                  render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-gray-700">Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} className="h-12 border-orange-100 focus:border-orange-500 rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-gray-700">Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} className="h-12 border-orange-100 focus:border-orange-500 rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-gray-700">Email</FormLabel>
                  <FormControl>
                    <Input placeholder="nom@exemple.com" {...field} className="h-12 border-orange-100 focus:border-orange-500 rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="telephone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-bold text-gray-700">
                      <Phone className="h-4 w-4 text-orange-500" />
                      Téléphone
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="+229 12 34 56 78" {...field} className="h-12 border-orange-100 focus:border-orange-500 rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-bold text-gray-700 text-sm">
                      <MessageSquare className="h-4 w-4 text-green-500" />
                      Lien WhatsApp
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://wa.me/..." {...field} className="h-12 border-orange-100 focus:border-orange-500 rounded-xl text-xs" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="ville"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-gray-700">Ville</FormLabel>
                    <FormControl>
                      <Input placeholder="Cotonou" {...field} className="h-12 border-orange-100 focus:border-orange-500 rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quartier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-gray-700">Quartier</FormLabel>
                    <FormControl>
                      <Input placeholder="Haie Vive" {...field} className="h-12 border-orange-100 focus:border-orange-500 rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Vous êtes ?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="client" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Client
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="marchand" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Marchand
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-gray-700">Mot de passe</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} className="h-12 border-orange-100 focus:border-orange-500 rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-gray-700">Confirmation</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} className="h-12 border-orange-100 focus:border-orange-500 rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full h-14 text-lg font-black bg-orange-500 hover:bg-orange-600 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 rounded-2xl" disabled={loading}>
                {loading ? "Création en cours..." : "Rejoindre maintenant"}
              </Button>
            </form>
          </Form>

          <div className="mt-8 text-center text-sm font-medium text-gray-600">
            Vous avez déjà un compte ?{" "}
            <Link to="/login" className="text-orange-600 font-black hover:underline">
              Se connecter
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
