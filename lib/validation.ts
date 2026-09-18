import {z} from 'zod';
export const productSchema=z.object({title:z.string().min(2),slug:z.string().min(2).regex(/^[a-z0-9-]+$/),short_description:z.string().min(2),description:z.string().min(2),price:z.coerce.number().positive(),thumbnail_url:z.string().optional(),preview_url:z.string().optional(),file_path:z.string().min(2),status:z.enum(['active','draft'])});
