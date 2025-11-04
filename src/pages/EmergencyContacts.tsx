import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, Plus, Trash2, Phone, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface Contact {
  id: string;
  name: string;
  phone_number: string;
  relationship: string | null;
}

const EmergencyContactsContent = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    relationship: '',
  });

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .insert({
          user_id: user.id,
          name: formData.name,
          phone_number: formData.phone_number,
          relationship: formData.relationship || null,
        });

      if (error) throw error;

      toast.success('Contact added successfully');
      setFormData({ name: '', phone_number: '', relationship: '' });
      setShowForm(false);
      fetchContacts();
    } catch (error: any) {
      toast.error('Failed to add contact');
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Contact deleted');
      fetchContacts();
    } catch (error: any) {
      toast.error('Failed to delete contact');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl">SheShield</span>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Emergency Contacts</h1>
          <p className="text-muted-foreground">
            Manage your emergency contacts who will be notified during SOS alerts
          </p>
        </div>

        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="mb-6">
            <Plus className="w-4 h-4 mr-2" />
            Add New Contact
          </Button>
        )}

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add Emergency Contact</CardTitle>
              <CardDescription>Enter contact details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddContact} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name *
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contact name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone Number *
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="+1234567890"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="relationship" className="text-sm font-medium">
                    Relationship
                  </label>
                  <Input
                    id="relationship"
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    placeholder="e.g., Family, Friend"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Add Contact</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : contacts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <UserIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground mb-4">No emergency contacts yet</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Contact
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {contacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-feature rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{contact.name}</h3>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{contact.phone_number}</span>
                        </div>
                        {contact.relationship && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {contact.relationship}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteContact(contact.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const EmergencyContacts = () => {
  return (
    <ProtectedRoute>
      <EmergencyContactsContent />
    </ProtectedRoute>
  );
};

export default EmergencyContacts;
