import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, X, Upload, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Schema sesuai BE
const createWordSearchSchema = z.object({
  name: z.string().min(1, 'Game name is required').max(128),
  description: z.string().max(256).optional(),
  thumbnail_image: z.any(),
  words: z.array(z.string().min(2).max(20)).min(1, 'At least 1 word required').max(20),
  grid_size: z.coerce.number().min(8).max(20),
  time_limit: z.coerce.number().min(30).max(600),
  lives: z.coerce.number().min(1).max(10),
  directions: z.array(z.enum(['horizontal', 'vertical', 'diagonal'])).min(1),
  is_publish_immediately: z.boolean(),
});

type CreateWordSearchForm = z.infer<typeof createWordSearchSchema>;

export default function CreateWordSearch() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [wordInput, setWordInput] = useState('');
  const [words, setWords] = useState<string[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateWordSearchForm>({
    resolver: zodResolver(createWordSearchSchema),
    defaultValues: {
      grid_size: 15,
      time_limit: 480,
      lives: 5,
      directions: ['horizontal', 'vertical', 'diagonal'],
      is_publish_immediately: false,
    },
  });

  const directions = watch('directions') || [];

  const handleAddWord = () => {
    const trimmedWord = wordInput.trim().toUpperCase();
    if (trimmedWord.length < 2 || trimmedWord.length > 20) {
      toast.error('Word must be 2-20 characters');
      return;
    }
    if (words.includes(trimmedWord)) {
      toast.error('Word already added');
      return;
    }
    if (words.length >= 20) {
      toast.error('Maximum 20 words');
      return;
    }
    const newWords = [...words, trimmedWord];
    setWords(newWords);
    setValue('words', newWords);
    setWordInput('');
  };

  const handleRemoveWord = (index: number) => {
    const newWords = words.filter((_, i) => i !== index);
    setWords(newWords);
    setValue('words', newWords);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDirectionToggle = (direction: 'horizontal' | 'vertical' | 'diagonal') => {
    const current = directions || [];
    let newDirections;
    
    if (current.includes(direction)) {
      newDirections = current.filter(d => d !== direction);
    } else {
      newDirections = [...current, direction];
    }
    
    if (newDirections.length === 0) {
      toast.error('At least one direction must be selected');
      return;
    }
    
    setValue('directions', newDirections);
  };

  const onSubmit = async (data: CreateWordSearchForm) => {
    if (words.length === 0) {
      toast.error('Please add at least one word');
      return;
    }
    
    if (!thumbnailFile) {
      toast.error('Please upload a thumbnail image');
      return;
    }

    // Validate grid size vs longest word
    const longestWord = Math.max(...words.map(w => w.length));
    if (data.grid_size < longestWord) {
      const longestWordText = words.find(w => w.length === longestWord);
      setErrorMessage(`Grid size must be at least ${longestWord} to fit the longest word: "${longestWordText}" (${longestWord} characters)`);
      setShowErrorDialog(true);
      return;
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      formData.append('thumbnail_image', thumbnailFile);
      formData.append('grid_size', data.grid_size.toString());
      formData.append('time_limit', data.time_limit.toString());
      formData.append('lives', data.lives.toString());
      formData.append('is_publish_immediately', data.is_publish_immediately.toString());
      
      // Add words as array
      words.forEach(word => {
        formData.append('words[]', word);
      });
      
      // Add directions as array
      data.directions.forEach(dir => {
        formData.append('directions[]', dir);
      });

      const response = await axios.post('/api/game/game-type/word-search', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Word Search game created successfully!');
      navigate('/my-projects');
    } catch (error: any) {
      console.error('Failed to create word search:', error);
      toast.error(error.response?.data?.message || 'Failed to create game');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="pl-0 hover:bg-transparent text-orange-500 hover:text-orange-600 mb-2"
            onClick={() => navigate('/create-projects')}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Create Word Search Game</h1>
          <p className="text-sm text-slate-500">Fill in the details to create your word search puzzle</p>
        </div>
      </div>

      {/* Form */}
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-6">
          
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>
            
            <div>
              <Label htmlFor="name">Game Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="My Awesome Word Search"
                className="mt-1"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Brief description of your game..."
                className="mt-1"
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="thumbnail">Thumbnail Image *</Label>
              <div className="mt-2">
                <input
                  type="file"
                  id="thumbnail"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
                <label
                  htmlFor="thumbnail"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-purple-400 transition-colors"
                >
                  {thumbnailPreview ? (
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-10 h-10 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500">Click to upload thumbnail</p>
                      <p className="text-xs text-slate-400">Max 5MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Words */}
          <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Words to Find</h2>
            
            <div className="flex gap-2">
              <Input
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value.toUpperCase())}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddWord();
                  }
                }}
                placeholder="Enter a word (2-20 characters)"
                maxLength={20}
              />
              <Button type="button" onClick={handleAddWord} disabled={words.length >= 20}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-slate-50 rounded-lg">
              {words.length === 0 ? (
                <p className="text-sm text-slate-400">No words added yet</p>
              ) : (
                words.map((word, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg font-medium"
                  >
                    {word}
                    <button
                      type="button"
                      onClick={() => handleRemoveWord(index)}
                      className="hover:bg-purple-200 rounded p-0.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
            <p className="text-xs text-slate-500">{words.length}/20 words added</p>
            {errors.words && (
              <p className="text-sm text-red-500">{errors.words.message}</p>
            )}
          </div>

          {/* Game Settings */}
          <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Game Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="grid_size">
                  Grid Size (8-20)
                  {words.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-purple-600">
                      Min: {Math.max(...words.map(w => w.length))} (longest word)
                    </span>
                  )}
                </Label>
                <Input
                  id="grid_size"
                  type="number"
                  {...register('grid_size')}
                  min={Math.max(8, ...words.map(w => w.length))}
                  max={20}
                  className="mt-1"
                />
                {errors.grid_size && (
                  <p className="text-sm text-red-500 mt-1">{errors.grid_size.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="time_limit">Time Limit (seconds)</Label>
                <Input
                  id="time_limit"
                  type="number"
                  {...register('time_limit')}
                  min={30}
                  max={600}
                  className="mt-1"
                />
                {errors.time_limit && (
                  <p className="text-sm text-red-500 mt-1">{errors.time_limit.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lives">Lives (1-10)</Label>
                <Input
                  id="lives"
                  type="number"
                  {...register('lives')}
                  min={1}
                  max={10}
                  className="mt-1"
                />
                {errors.lives && (
                  <p className="text-sm text-red-500 mt-1">{errors.lives.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Word Directions</Label>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center">
                  <Checkbox
                    id="horizontal"
                    checked={directions.includes('horizontal')}
                    onCheckedChange={() => handleDirectionToggle('horizontal')}
                  />
                  <Label htmlFor="horizontal" className="ml-2 cursor-pointer">
                    Horizontal
                  </Label>
                </div>
                <div className="flex items-center">
                  <Checkbox
                    id="vertical"
                    checked={directions.includes('vertical')}
                    onCheckedChange={() => handleDirectionToggle('vertical')}
                  />
                  <Label htmlFor="vertical" className="ml-2 cursor-pointer">
                    Vertical
                  </Label>
                </div>
                <div className="flex items-center">
                  <Checkbox
                    id="diagonal"
                    checked={directions.includes('diagonal')}
                    onCheckedChange={() => handleDirectionToggle('diagonal')}
                  />
                  <Label htmlFor="diagonal" className="ml-2 cursor-pointer">
                    Diagonal
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="publish">Publish Immediately</Label>
                <p className="text-xs text-slate-500">Make game public right away</p>
              </div>
              <Switch
                id="publish"
                onCheckedChange={(checked) => setValue('is_publish_immediately', checked)}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/create-projects')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || words.length === 0}
              className="flex-1 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isLoading ? 'Creating...' : 'Create Game'}
            </Button>
          </div>
        </form>

        {/* Error Dialog */}
        <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600">Grid Size Too Small!</AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                {errorMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
                Got it!
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
