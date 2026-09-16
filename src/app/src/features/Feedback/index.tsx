import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { FaCommentDots, FaTimes } from 'react-icons/fa';
import { Button } from 'app/components/Button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from 'app/components/shadcn/Dialog';
import { Textarea } from 'app/components/shadcn/TextArea';
import { toast } from 'app/lib/toaster';
import api from 'app/api';
import { t } from 'app/i18n';

type Priority = 'high' | 'medium' | 'low';

export const FeedbackWidget = () => {
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [body, setBody] = useState('');
    const [priority, setPriority] = useState<Priority>('medium');
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const urls = images.map((file) => URL.createObjectURL(file));
        setPreviews(urls);
        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [images]);

    const reset = () => {
        setBody('');
        setPriority('medium');
        setImages([]);
    };

    const addImages = (files: FileList | File[] | null) => {
        if (!files || files.length === 0) {
            return;
        }
        setImages((prev) => [...prev, ...Array.from(files)]);
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = e.clipboardData?.items;
        if (!items) {
            return;
        }
        const pasted: File[] = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    pasted.push(file);
                }
            }
        }
        addImages(pasted);
    };

    const handleSubmit = async () => {
        if (!body.trim() || submitting) {
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('body', body);
            formData.append('priority', priority);
            formData.append('sourceScreen', location.pathname);
            images.forEach((image) => formData.append('images', image));

            await api.feedback.create(formData);

            toast.success(t('Feedback sent'), { position: 'bottom-right' });
            reset();
            setOpen(false);
        } catch (err) {
            toast.error(t('Failed to send feedback'), { position: 'bottom-right' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Button
                variant="primary"
                size="icon"
                className="fixed bottom-4 right-4 z-[9997] rounded-full shadow-lg"
                onClick={() => setOpen(true)}
                tooltip={{ content: t('Send feedback') }}
                aria-label={t('Send feedback')}
            >
                <FaCommentDots />
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-white w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{t('Send feedback')}</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-3">
                        <Textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            onPaste={handlePaste}
                            placeholder={t('Describe the issue or request…')}
                            rows={5}
                        />
                        {previews.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {previews.map((src, index) => (
                                    <div key={src} className="relative w-16 h-16">
                                        <img
                                            src={src}
                                            alt={t('Attached image')}
                                            className="w-16 h-16 object-cover rounded border"
                                        />
                                        <button
                                            type="button"
                                            aria-label={t('Remove image')}
                                            className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                            onClick={() => removeImage(index)}
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center justify-between gap-4">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                    addImages(e.target.files);
                                    e.target.value = '';
                                }}
                            />
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {t('Attach image')}
                            </Button>
                            <select
                                className="border rounded px-2 py-1 text-sm dark:bg-dark dark:text-white"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as Priority)}
                                aria-label={t('Priority')}
                            >
                                <option value="high">{t('High')}</option>
                                <option value="medium">{t('Medium')}</option>
                                <option value="low">{t('Low')}</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="primary"
                            disabled={!body.trim() || submitting}
                            onClick={handleSubmit}
                        >
                            {t('Send')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default FeedbackWidget;
