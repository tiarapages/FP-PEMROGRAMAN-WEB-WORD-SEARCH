import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '@/api/axios'; // Gunakan instance axios yang sudah ada config base URL
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const EditWordSearch = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  // State Form
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    words: '',
    grid_size: 15,
    time_limit: 300,
    lives: 5,
    is_publish: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. FETCH DATA
  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        // Fetch ke endpoint GET detail
        const response = await axios.get(`/api/game/game-type/word-search/${gameId}`);
        const data = response.data.data;
        const gameJson = data.game_json;

        // Populate state dengan data yang ada
        // Gunakan fallback ( || '') untuk mencegah error Uncontrolled Input / NaN
        setFormData({
            name: data.name || '',
            description: data.description || '',
            // Convert Array Words kembali ke String dipisah koma
            words: Array.isArray(gameJson.words) 
                ? gameJson.words.map((w: any) => typeof w === 'string' ? w : w.word).join(', ')
                : '',
            grid_size: gameJson.grid_size || 15,
            time_limit: gameJson.time_limit || 300,
            lives: gameJson.lives || 5,
            is_publish: data.is_published || false,
        });

      } catch (error) {
        console.error("Gagal mengambil data game:", error);
        toast.error("Failed to load game data");
        navigate('/my-projects');
      } finally {
        setIsLoading(false);
      }
    };

    if (gameId) fetchGameDetails();
  }, [gameId, navigate]);

  // 2. HANDLE INPUT CHANGE
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => {
      let finalValue: string | number = value;

      // Handle input number agar tidak NaN saat kosong
      if (type === 'number') {
        // Jika kosong, biarkan string kosong (agar bisa dihapus user), nanti divalidasi saat submit
        finalValue = value === '' ? '' : parseInt(value);
      }

      return {
        ...prev,
        [name]: finalValue
      };
    });
  };

  // 3. SUBMIT (MENGGUNAKAN FORM DATA AGAR LOLOS VALIDASI 422)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // 1. Validasi manual sederhana
      const wordsArray = formData.words
        .split(',')
        .map(w => w.trim())
        .filter(w => w.length > 0);

      if (wordsArray.length === 0) {
        toast.error("Please enter at least one word");
        setIsSaving(false);
        return;
      }

      // 2. Bungkus data ke dalam FormData (Bukan JSON)
      // Backend pakai middleware 'file_fields', jadi wajib FormData
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('description', formData.description);
      
      // Pastikan angka dikirim sebagai string angka
      payload.append('grid_size', String(formData.grid_size));
      payload.append('time_limit', String(formData.time_limit));
      payload.append('lives', String(formData.lives));
      
      // Backend service pakai 'is_publish' (sesuai service update)
      payload.append('is_publish', String(formData.is_publish));

      // Append array words satu per satu (Format: words[])
      wordsArray.forEach(word => {
        payload.append('words[]', word);
      });

      // 3. Kirim PATCH request
      await axios.patch(
        `/api/game/game-type/word-search/${gameId}`, 
        payload,
        {
           headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      toast.success("Game updated successfully!");
      navigate('/my-projects');

    } catch (error: any) {
      console.error("Gagal update game:", error);
      // Tampilkan pesan error spesifik dari backend jika ada
      const serverMessage = error.response?.data?.message || "Failed to update game";
      toast.error(serverMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
       {/* Header */}
       <div className="bg-white border-b sticky top-0 z-10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <Button
                variant="ghost"
                className="pl-0 hover:bg-transparent text-slate-500 hover:text-slate-800 mb-1"
                onClick={() => navigate('/my-projects')}
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Projects
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">Edit Word Search</h1>
          </div>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
            
            {/* Form Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
                {/* Nama Game */}
                <div>
                    <Label htmlFor="name">Game Name</Label>
                    <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1"
                    />
                </div>

                {/* Deskripsi */}
                <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1"
                    />
                </div>

                {/* Words List */}
                <div>
                    <Label htmlFor="words">Words to Find (Separated by comma)</Label>
                    <p className="text-xs text-slate-500 mb-2">Example: REACT, JAVASCRIPT, HTML, CSS</p>
                    <Textarea
                        id="words"
                        name="words"
                        value={formData.words}
                        onChange={handleChange}
                        rows={5}
                        required
                        className="font-mono text-sm mt-1"
                    />
                </div>

                {/* Settings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                        <Label htmlFor="grid_size">Grid Size (8-20)</Label>
                        <Input
                            type="number"
                            id="grid_size"
                            name="grid_size"
                            value={formData.grid_size}
                            onChange={handleChange}
                            min={8}
                            max={20}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="lives">Lives</Label>
                        <Input
                            type="number"
                            id="lives"
                            name="lives"
                            value={formData.lives}
                            onChange={handleChange}
                            min={1}
                            max={10}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="time_limit">Time Limit (Seconds)</Label>
                        <Input
                            type="number"
                            id="time_limit"
                            name="time_limit"
                            value={formData.time_limit}
                            onChange={handleChange}
                            min={30}
                            className="mt-1"
                        />
                    </div>
                </div>

                {/* Publish Status */}
                <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                        <Label htmlFor="publish">Publish Status</Label>
                        <p className="text-xs text-slate-500">Make game public immediately</p>
                    </div>
                    <Switch 
                        id="publish"
                        checked={formData.is_publish}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_publish: checked }))}
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/my-projects')}
                    disabled={isSaving}
                >
                    Cancel
                </Button>
                <Button 
                    type="submit" 
                    disabled={isSaving}
                    className="bg-purple-600 hover:bg-purple-700 min-w-[140px]"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>

        </form>
      </div>
    </div>
  );
};

export default EditWordSearch;