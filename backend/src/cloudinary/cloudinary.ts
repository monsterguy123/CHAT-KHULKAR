import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: "db3hh5stk",
    api_key: "738345996131422",
    api_secret: "5WpYoszYqVid7I-Yq2bOtPPahEE"
});

export const uploadImages = async (filePath: string): Promise<string | void> => {
    try {
        const img = await cloudinary.uploader.upload(filePath);
        return img.secure_url;
    } catch (error: any) {
        console.error(error.message);
    }
};
