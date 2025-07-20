import prisma from '../config/prisma.config.js'
import cloudinary from '../config/cloudinary.config.js'
import fs from 'fs/promises'

export const getBanners = async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' },
    });
    res.json({ banners });
  } catch (err) {
    next(err);
  }
};

export const createBanner = async (req, res, next) => {
  try {
    const { alt_text, order = 0 } = req.body;

    if (!req.file) return res.status(400).json({ message: "กรุณาอัปโหลดภาพ" });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "homepage-banners",
    });

    await fs.unlink(req.file.path);

    const newBanner = await prisma.banner.create({
      data: {
        image_url: result.secure_url,
        alt_text,
        order: Number(order),
      },
    });

    res.status(201).json({ message: "สร้างแบนเนอร์สำเร็จ", banner: newBanner });
  } catch (err) {
    next(err);
  }
};

export const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.banner.delete({ where: { id } });
    res.json({ message: "ลบแบนเนอร์สำเร็จ" });
  } catch (err) {
    next(err);
  }
};