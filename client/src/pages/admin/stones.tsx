import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Stone } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPrice, slugify } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Gem } from 'lucide-react';
import { STONE_TYPES, STONE_COLORS } from '@/lib/constants';

export function AdminStonesPage() {
  const { isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingStone, setEditingStone] = useState<Stone | null>(null);

  const { data: stones = [], isLoading } = useQuery({
    queryKey: ['admin', 'stones'],
    queryFn: () => apiRequest<Stone[]>('/api/stones?limit=100'),
  });

  const deleteStone = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/admin/stones/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stones'] });
      toast({ title: 'Stone deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  if (!isAdmin) {
    setLocation('/');
    return null;
  }

  const handleEdit = (stone: Stone) => {
    setEditingStone(stone);
    setShowForm(true);
  };

  // Find the handleDelete function (around line 40) and update it:
  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this stone? This action cannot be undone.')) {
      deleteStone.mutate(id);
    }
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Stones</h1>
        <Button
          onClick={() => {
            setEditingStone(null);
            setShowForm(!showForm);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Stone
        </Button>
      </div>

      {showForm && (
        <div className="mb-8">
          <StoneForm
            stone={editingStone}
            onClose={() => {
              setShowForm(false);
              setEditingStone(null);
            }}
          />
        </div>
      )}

      {isLoading ? (
        <p className="text-center">Loading stones...</p>
      ) : stones.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Gem className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No stones yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stones.map((stone) => (
            <Card key={stone.id}>
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-lg mb-4 overflow-hidden">
                  {stone.images[0] ? (
                    <img
                      src={stone.images[0]}
                      alt={stone.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Gem className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold">{stone.name}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {stone.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {stone.shortInfo}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-primary">
                      {formatPrice(stone.price, stone.currency)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Stock: {stone.stock}
                    </p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEdit(stone)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(stone.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StoneForm({ stone, onClose }: { stone: Stone | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: stone?.name || '',
    slug: stone?.slug || '',
    type: stone?.type || 'DIAMOND',
    color: stone?.color || '',
    weight: stone?.weight || '',
    origin: stone?.origin || '',
    shortInfo: stone?.shortInfo || '',
    description: stone?.description || '',
    price: stone?.price || '',
    currency: stone?.currency || 'USD',
    stock: stone?.stock || 0,
    isFeatured: stone?.isFeatured || false,
  });
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, String(value));
      });

      if (imageFiles) {
        Array.from(imageFiles).forEach((file) => {
          form.append('images', file);
        });
      }

      if (stone) {
        form.append('existingImages', JSON.stringify(stone.images));
        return fetch(`/api/admin/stones/${stone.id}`, {
          method: 'PUT',
          body: form,
          credentials: 'include',
        }).then((res) => {
          if (!res.ok) throw new Error('Failed to update stone');
          return res.json();
        });
      } else {
        return fetch('/api/admin/stones', {
          method: 'POST',
          body: form,
          credentials: 'include',
        }).then((res) => {
          if (!res.ok) throw new Error('Failed to create stone');
          return res.json();
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stones'] });
      toast({ title: stone ? 'Stone updated' : 'Stone created' });
      onClose();
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name, slug: slugify(name) });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">
          {stone ? 'Edit Stone' : 'Add New Stone'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={formData.slug} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            >
              {STONE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <select
              id="color"
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            >
              <option value="">Select color</option>
              {STONE_COLORS.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (carats)</Label>
            <Input
              id="weight"
              type="number"
              step="0.01"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="origin">Origin</Label>
            <Input
              id="origin"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="shortInfo">Short Info</Label>
            <Input
              id="shortInfo"
              value={formData.shortInfo}
              onChange={(e) => setFormData({ ...formData, shortInfo: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="images">Images</Label>
            <Input
              id="images"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setImageFiles(e.target.files)}
            />
          </div>
          <div className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
            />
            <Label htmlFor="isFeatured">Featured Stone</Label>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : stone ? 'Update' : 'Create'}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}