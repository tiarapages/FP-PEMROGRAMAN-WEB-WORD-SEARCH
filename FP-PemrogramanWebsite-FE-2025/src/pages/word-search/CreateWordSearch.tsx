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
import { ArrowLeft, Plus, X, Upload, Smile, Brain, Zap } from 'lucide-react';
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

// --- SCHEMA & TYPES ---

const createWordSearchSchema = z.object({
  name: z.string().min(1, 'Game name is required').max(128),
  description: z.string().max(256).optional(),
  // Thumbnail dihandle manual via state, jadi kita buat optional di schema form
  thumbnail_image: z.any().optional(),
  // Words dihandle manual via state, tapi kita validasi array-nya
  words: z.array(z.string()).min(1, 'At least 1 word required'),
  // Gunakan coerce agar input HTML (string) otomatis jadi number
  grid_size: z.coerce.number().min(8).max(20),
  time_limit: z.coerce.number().min(30).max(600),
  lives: z.coerce.number().min(1).max(10),
  directions: z.array(z.string()).min(1),
  is_publish_immediately: z.boolean(),
});

// Infer tipe data langsung dari schema Zod
type CreateWordSearchSchemaType = z.infer<typeof createWordSearchSchema>;

type DifficultyLevel = 'easy' | 'medium' | 'hard';

export default function CreateWordSearch() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // State Manual untuk UI
  const [wordInput, setWordInput] = useState('');
  const [words, setWords] = useState<string[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');

  // React Hook Form
  // PERBAIKAN: Hapus Generic <CreateWordSearchForm> agar tipe dideteksi otomatis dari resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(createWordSearchSchema),
    defaultValues: {
      name: '',
      description: '',
      grid_size: 15,
      time_limit: 480,
      lives: 5,
      directions: ['horizontal', 'vertical', 'diagonal'],
      is_publish_immediately: false,
      words: [],
    },
  });

  // Watch nilai switch untuk UI
  const isPublishImmediately = watch('is_publish_immediately');

  const getDifficultyLimits = (level: DifficultyLevel) => {
    switch (level) {
      case 'easy':
        return { maxWords: 10, gridSize: 10, timeLimit: 600, lives: 10, directions: ['horizontal', 'vertical'] };
      case 'medium':
        return { maxWords: 15, gridSize: 15, timeLimit: 480, lives: 5, directions: ['horizontal', 'vertical', 'diagonal'] };
      case 'hard':
        return { maxWords: 20, gridSize: 18, timeLimit: 300, lives: 3, directions: ['horizontal', 'vertical', 'diagonal'] };
    }
  };

  const applyDifficultyPreset = (level: DifficultyLevel) => {
    setDifficulty(level);
    const limits = getDifficultyLimits(level);
    
    setValue('grid_size', limits.gridSize);
    setValue('time_limit', limits.timeLimit);
    setValue('lives', limits.lives);
    setValue('directions', limits.directions);
  };

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
    
    const maxWords = getDifficultyLimits(difficulty).maxWords;
    if (words.length >= maxWords) {
      toast.error(`Maximum ${maxWords} words for ${difficulty.toUpperCase()} difficulty`);
      return;
    }
    
    const newWords = [...words, trimmedWord];
    setWords(newWords);
    // Update value form agar validasi schema lulus (karena schema butuh min 1 word)
    setValue('words', newWords, { shouldValidate: true });
    setWordInput('');
  };

  const handleRemoveWord = (index: number) => {
    const newWords = words.filter((_, i) => i !== index);
    setWords(newWords);
    setValue('words', newWords, { shouldValidate: true });
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

  // Submit Handler
  // Kita gunakan tipe data yang di-infer dari Zod
  const onSubmit = async (data: CreateWordSearchSchemaType) => {
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
      
      words.forEach(word => {
        formData.append('words[]', word);
      });
      
      data.directions.forEach(dir => {
        formData.append('directions[]', dir);
      });

      await axios.post('/api/game/game-type/word-search', formData, {
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
            type="button"
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
                <p className="text-sm text-red-500 mt-1">{errors.name?.message as string}</p>
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
                <p className="text-sm text-red-500 mt-1">{errors.description?.message as string}</p>
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
            <p className="text-xs text-slate-500">
              {words.length}/{getDifficultyLimits(difficulty).maxWords} words added ({difficulty.toUpperCase()} limit)
            </p>
            {errors.words && (
              <p className="text-sm text-red-500">{errors.words?.message as string}</p>
            )}
          </div>

          {/* Difficulty Selector */}
          <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Difficulty Level *</h2>
            <p className="text-sm text-slate-600">Choose difficulty to set game limits (words, grid size, time, lives)</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => applyDifficultyPreset('easy')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  difficulty === 'easy'
                    ? 'border-green-500 bg-green-50'
                    : 'border-slate-200 hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Smile className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-green-700 mb-1">Easy</h3>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="font-semibold text-green-600">Max 10 words</p>
                    <p>Grid: 10x10</p>
                    <p>Time: 10 min</p>
                    <p>Lives: 10</p>
                    <p>Directions: H + V</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => applyDifficultyPreset('medium')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  difficulty === 'medium'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-slate-200 hover:border-yellow-300'
                }`}
              >
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Brain className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="font-bold text-yellow-700 mb-1">Medium</h3>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="font-semibold text-yellow-600">Max 15 words</p>
                    <p>Grid: 15x15</p>
                    <p>Time: 8 min</p>
                    <p>Lives: 5</p>
                    <p>Directions: H + V + D</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => applyDifficultyPreset('hard')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  difficulty === 'hard'
                    ? 'border-red-500 bg-red-50'
                    : 'border-slate-200 hover:border-red-300'
                }`}
              >
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Zap className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="font-bold text-red-700 mb-1">Hard</h3>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="font-semibold text-red-600">Max 20 words</p>
                    <p>Grid: 18x18</p>
                    <p>Time: 5 min</p>
                    <p>Lives: 3</p>
                    <p>Directions: H + V + D</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Publish Setting */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="publish">Publish Immediately</Label>
                <p className="text-xs text-slate-500">Make game public right away</p>
              </div>
              <Switch
                id="publish"
                checked={isPublishImmediately}
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