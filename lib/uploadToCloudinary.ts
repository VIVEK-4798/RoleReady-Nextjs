import cloudinary from './cloudinary';

interface CloudinaryUploadResult {
    secure_url: string;
    public_id: string;
    [key: string]: any;
}

export const uploadBufferToCloudinary = (
    buffer: Buffer,
    folder: string,
    options?: {
        resource_type?: 'image' | 'video' | 'raw' | 'auto',
        transformation?: object | object[]
    }
): Promise<CloudinaryUploadResult> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: options?.resource_type || 'auto',
                transformation: options?.transformation,
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(error);
                } else if (result) {
                    resolve(result);
                } else {
                    reject(new Error('Unknown upload error'));
                }
            }
        );

        uploadStream.end(buffer);
    });
};

export const deleteFromCloudinary = async (publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image') => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        return result;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw error;
    }
};
