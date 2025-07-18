
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Suggestion } from '@/types';
import { Loader2, ArrowLeft, MessageSquare, Mail, Calendar } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto" />
          <p className="text-gray-600">Chargement des suggestions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 to-amber-50/20">
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)} 
            className="border-orange-200 hover:border-orange-300 hover:bg-orange-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Suggestions des Utilisateurs</h1>
            <p className="text-gray-600">Gérez les retours et suggestions de vos utilisateurs</p>
          </div>
        </div>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <MessageSquare className="h-5 w-5 text-orange-500" />
              Liste des suggestions ({suggestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-orange-100">
                    <TableHead className="font-semibold text-gray-700">
                      <Calendar className="h-4 w-4 inline mr-2" />
                      Date
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Contact
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">Message</TableHead>
                    <TableHead className="font-semibold text-gray-700">Statut</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suggestions.map(s => (
                    <TableRow key={s._id} className="hover:bg-orange-50/50 transition-colors">
                      <TableCell className="font-medium text-gray-900">
                        {new Date(s.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{s.name}</p>
                          <p className="text-xs text-gray-500">{s.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="truncate text-gray-700">{s.message}</p>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={s.status === 'nouveau' ? 'default' : 'secondary'} 
                          className={`capitalize ${
                            s.status === 'nouveau' 
                              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setReplyingTo(s)}
                          className="border-orange-200 hover:border-orange-300 hover:bg-orange-50 text-orange-600"
                        >
                          {s.status === 'répondu' ? 'Voir/Renvoyer' : 'Répondre'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={!!replyingTo} onOpenChange={() => setReplyingTo(null)}>
          <DialogContent className="max-w-2xl border-0 shadow-2xl bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Répondre à {replyingTo?.name}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                L'utilisateur recevra votre réponse par email à l'adresse : {replyingTo?.email}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Message original :</label>
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-300 p-4 rounded-r-lg">
                  <p className="text-gray-700 italic leading-relaxed">
                    "{replyingTo?.message}"
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Votre réponse :</label>
                <Textarea 
                  placeholder="Rédigez votre réponse..." 
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={6}
                  className="resize-none border-orange-200 focus:border-orange-300 focus:ring-orange-200/50"
                />
                <p className="text-xs text-gray-500">
                  Minimum 5 caractères ({replyMessage.length}/5)
                </p>
              </div>
            </div>
            
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => setReplyingTo(null)}
                className="border-gray-300 hover:bg-gray-50"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleReplySubmit} 
                disabled={isSubmittingReply || replyMessage.length < 5}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg hover:shadow-xl transition-all"
              >
                {isSubmittingReply && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Envoyer la réponse
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SuggestionsPage;
