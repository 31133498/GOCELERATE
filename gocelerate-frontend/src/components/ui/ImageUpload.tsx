import { useRef, useState } from 'react';
import { uploadToCloudinary } from '../../utils/cloudinaryUpload';

interface Props {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  placeholder?: string;
  aspectRatio?: 'banner' | 'square';
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Image',
  placeholder = 'Click or drag an image here to upload',
  aspectRatio = 'banner',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File must be under 10 MB.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      onChange(url);
    } catch (e) {
      setError((e as Error).message ?? 'Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(ev: React.DragEvent) {
    ev.preventDefault();
    setDragging(false);
    const file = ev.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  const heightClass = aspectRatio === 'square' ? 'aspect-square' : 'h-44';

  return (
    <div>
      {label && <label className="block text-sm font-semibold text-ink mb-1.5">{label}</label>}

      {value ? (
        <div className={`relative rounded-xl overflow-hidden border border-border ${heightClass} group`}>
          <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-white text-ink text-xs font-semibold px-4 py-2 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-1.5"
            >
              <i className="ri-upload-2-line" /> Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-red-600 transition-colors flex items-center gap-1.5"
            >
              <i className="ri-delete-bin-line" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`${heightClass} rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer select-none
            ${dragging ? 'border-sidebar bg-sidebar/5' : 'border-border hover:border-sidebar/50 hover:bg-ground/50'}
            ${uploading ? 'pointer-events-none opacity-70' : ''}`}
        >
          {uploading ? (
            <>
              <div className="w-10 h-10 rounded-full border-2 border-sidebar border-t-transparent animate-spin" />
              <p className="text-sm text-muted">Uploading…</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-ground flex items-center justify-center">
                <i className="ri-image-add-line text-2xl text-muted" />
              </div>
              <div className="text-center px-4">
                <p className="text-sm font-medium text-ink">{placeholder}</p>
                <p className="text-xs text-muted mt-0.5">PNG, JPG, WEBP up to 10 MB</p>
              </div>
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs text-danger mt-1.5 flex items-center gap-1"><i className="ri-error-warning-line" />{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
    </div>
  );
}
