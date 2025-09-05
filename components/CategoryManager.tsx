'use client';

import { useState } from 'react';
import { useCustomCategories } from '@/hooks/useCustomCategories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, X, Tag, Check, Loader2 } from 'lucide-react';

export default function CategoryManager() {
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    customCategories, 
    loading, 
    error: fetchError,
    addCategory, 
    removeCategory 
  } = useCustomCategories();

  const defaultCategories = ['utilities', 'streaming', 'insurance', 'subscriptions', 'rent'];

  const handleAddCategory = async () => {
    const category = newCategory.trim().toLowerCase();
    
    if (!category) {
      setError('Please enter a category name');
      return;
    }

    if (category.length < 2) {
      setError('Category name must be at least 2 characters');
      return;
    }

    if (category.length > 20) {
      setError('Category name must be less than 20 characters');
      return;
    }

    if (defaultCategories.includes(category)) {
      setError('This category already exists as a default option');
      return;
    }

    if (customCategories.includes(category)) {
      setError('This custom category already exists');
      return;
    }

    // Check for invalid characters
    if (!/^[a-zA-Z0-9\s-_]+$/.test(category)) {
      setError('Category name can only contain letters, numbers, spaces, hyphens, and underscores');
      return;
    }

    try {
      setIsSubmitting(true);
      await addCategory(category);
      setNewCategory('');
      setError('');
      setSuccess(`Category "${category}" added successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to add category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveCategory = async (category: string) => {
    try {
      await removeCategory(category);
      setSuccess(`Category "${category}" removed successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to remove category');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCategory();
    }
  };

  return (
    <Card className="border-purple-200 bg-purple-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Tag className="h-5 w-5" />
          Custom Categories
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Add New Category */}
        <div className="space-y-3">
          <Label htmlFor="newCategory">Add New Category</Label>
          <div className="flex gap-2">
            <Input
              id="newCategory"
              value={newCategory}
              onChange={(e) => {
                setNewCategory(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              placeholder="e.g., gym membership, car payment"
              className="flex-1"
              maxLength={20}
            />
            <Button 
              onClick={handleAddCategory}
              disabled={!newCategory.trim() || isSubmitting}
              className="px-3"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Character count */}
          <p className="text-xs text-muted-foreground">
            {newCategory.length}/20 characters
          </p>
        </div>

        {/* Error/Success Messages */}
        {fetchError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800 text-sm">
              Error loading categories: {fetchError}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800 text-sm">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <Check className="h-4 w-4" />
            <AlertDescription className="text-green-800 text-sm">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Default Categories */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Default Categories</Label>
          <div className="flex flex-wrap gap-2">
            {defaultCategories.map(category => (
              <Badge 
                key={category} 
                variant="secondary" 
                className="bg-gray-100 text-gray-700 border-gray-300"
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Custom Categories */}
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            <span className="ml-2 text-sm text-muted-foreground">Loading categories...</span>
          </div>
        ) : customCategories.length > 0 ? (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Your Custom Categories</Label>
            <div className="flex flex-wrap gap-2">
              {customCategories.map(category => (
                <Badge 
                  key={category} 
                  variant="outline" 
                  className="bg-purple-100 text-purple-800 border-purple-300 pr-1"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCategory(category)}
                    className="ml-1 h-4 w-4 p-0 hover:bg-purple-200"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No custom categories yet. Add one above!</p>
          </div>
        )}

        {/* Usage Guidelines */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">Category Guidelines</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Use descriptive names (e.g., "gym membership" instead of "gym")</li>
            <li>• Keep names short and clear (2-20 characters)</li>
            <li>• Custom categories will appear in the dropdown when adding bills</li>
            <li>• You can remove custom categories that are no longer needed</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}