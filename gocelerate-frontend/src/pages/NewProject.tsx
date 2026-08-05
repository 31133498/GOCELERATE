import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import ImageUpload from '../components/ui/ImageUpload';
import { createProject } from '../api/projects';

const CATEGORIES = ['Infrastructure','Technology','Health','Education','Agriculture','Environment','Finance','Other'];

export default function NewProject() {
  const navigate = useNavigate();

  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory]     = useState(CATEGORIES[0]);
  const [budget, setBudget]         = useState('');
  const [imageUrl, setImageUrl]     = useState<string | null>(null);
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [loading, setLoading]       = useState(false);
  const [apiError, setApiError]     = useState('');

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim())       e.title       = 'Title is required';
    if (!description.trim()) e.description = 'Description is required';
    if (!budget || isNaN(Number(budget)) || Number(budget) <= 0)
      e.budget = 'Enter a valid budget';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      const { data } = await createProject({
        title,
        description,
        category,
        targetBudget: Number(budget),
        imageUrl,
      });
      navigate(`/projects/${data.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setApiError(msg ?? 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <h2 className="text-xl font-bold text-ink mb-6">New Project</h2>

        {apiError && (
          <div className="mb-5 p-3 bg-[#fef2f2] border border-[#fecaca] rounded-lg text-sm text-danger">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <ImageUpload
            label="Project Cover Image"
            placeholder="Add a cover image for your project"
            value={imageUrl}
            onChange={setImageUrl}
          />

          <Input
            label="Project Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            placeholder="e.g. Solar Panel Installation"
          />

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the project goals and scope…"
              className={`w-full rounded-lg border px-4 py-3 text-sm text-ink placeholder:text-dim focus:outline-none focus:border-sidebar resize-none
                ${errors.description ? 'border-danger' : 'border-border'}`}
            />
            {errors.description && <p className="text-xs text-danger mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-border px-4 py-3 text-sm text-ink bg-surface focus:outline-none focus:border-sidebar"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <Input
            label="Target Budget (₦)"
            type="number"
            min="0"
            step="0.01"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            error={errors.budget}
            prefixIcon="ri-money-dollar-circle-line"
            placeholder="0.00"
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/projects')}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={loading}>
              Create Project
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
