import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Suggestion } from '@/types';
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";

const SuggestionsPage: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<Suggestion | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const token = localStorage.getItem('token');

  const fetchSuggestions = useCallback(async () => {
    if (!token) { navigate('/login'); return; }
    try {
      const response = await fetch("http://localhost:8000/admin/suggestions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erreur de chargement des suggestions.");
      setSuggestions(await response.json());
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [token, navigate, toast]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleReplySubmit = async () => {
    if (!replyingTo || replyMessage.length < 5) {
      toast({ title: "Erreur", description: "La réponse doit contenir au moins 5 caractères.", variant: "destructive" });
      return;
    }
    setIsSubmittingReply(true);
    try {
      const response = await fetch(`http://localhost:8000/admin/suggestions/${replyingTo._id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reply_message: replyMessage })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur lors de l'envoi.");
      }
      toast({ title: "Succès", description: "Réponse envoyée avec succès." });
      setReplyingTo(null);
      setReplyMessage("");
      fetchSuggestions();
    } catch (error) {
      toast({ title: "Erreur", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>;

  return (
    <div className="container mx-auto py-10">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">Retour au Dashboard</Button>
      <h1 className="text-3xl font-bold mb-6">Suggestions des Utilisateurs</h1>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suggestions.map(s => (
              <TableRow key={s._id}>
                <TableCell>{new Date(s.created_at).toLocaleDateString('fr-FR')}</TableCell>
                <TableCell className="font-medium">{s.name}<br/><span className="text-xs text-muted-foreground">{s.email}</span></TableCell>
                <TableCell className="max-w-md truncate">{s.message}</TableCell>
                <TableCell><Badge variant={s.status === 'nouveau' ? 'default' : 'secondary'} className="capitalize">{s.status}</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => setReplyingTo(s)}>
                    {s.status === 'répondu' ? 'Voir/Renvoyer' : 'Répondre'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* --- Modal de Réponse --- */}
      <Dialog open={!!replyingTo} onOpenChange={() => setReplyingTo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Répondre à {replyingTo?.name}</DialogTitle>
            <DialogDescription>
              L'utilisateur recevra votre réponse par email.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <p className="text-sm font-medium">Message original :</p>
            <blockquote className="border-l-2 pl-4 text-sm text-muted-foreground italic max-h-24 overflow-y-auto">
              {replyingTo?.message}
            </blockquote>
            <Textarea 
              placeholder="Votre réponse..." 
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={6}
              className="mt-4"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReplyingTo(null)}>Annuler</Button>
            <Button onClick={handleReplySubmit} disabled={isSubmittingReply}>
              {isSubmittingReply && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer la réponse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuggestionsPage;