import prisma from '../config/prisma.config.js';
import cloudinary from '../config/cloudinary.config.js';
import fs from 'fs/promises';

// ✅ CREATE: สร้างร้านค้าใหม่ (พร้อมอัปโหลดรูปและ cover)
export const createStore = async (req, res, next) => {
  try {
    const {
      name,
      description = '',
      address = '',
      category_id,
      social_links = '',
      order_number,
      expired_at, // ✅ รับจาก req.body
    } = req.body;

    // ✅ ตรวจสอบลำดับซ้ำ
    const existing = await prisma.store.findFirst({
      where: {
        category_id,
        order_number: Number(order_number),
      },
    });

    if (existing) {
      return res.status(400).json({
        message: `ลำดับที่ ${order_number} มีอยู่แล้วในหมวดหมู่นี้ กรุณาเลือกลำดับใหม่`,
      });
    }

    // ✅ อัปโหลด cover image
    let coverImageUrl = null;
    if (req.files?.cover?.length > 0) {
      const coverResult = await cloudinary.uploader.upload(req.files.cover[0].path, {
        folder: 'store-covers',
      });
      coverImageUrl = coverResult.secure_url;
      await fs.unlink(req.files.cover[0].path);
    }

    // ✅ สร้างร้านค้าใหม่ พร้อม expired_at และ is_active
    const store = await prisma.store.create({
      data: {
        name,
        description,
        address,
        social_links,
        category_id,
        order_number: Number(order_number),
        cover_image: coverImageUrl,
        expired_at: expired_at ? new Date(expired_at) : null, // ✅ แปลงเป็น Date
        is_active: true,
      },
    });

    // ✅ จัดการอัปโหลดรูปภาพ
    let orders = [];
    if (req.body.orders) {
      if (Array.isArray(req.body.orders)) {
        orders = req.body.orders.map((o) => Number(o));
      } else {
        const single = Number(req.body.orders);
        if (!isNaN(single)) orders = [single];
      }
    }

    const uploadedImages = await Promise.all(
      (req.files?.images || []).map(async (file, index) => {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'store-images',
        });
        await fs.unlink(file.path);

        const order = orders[index] || index + 1;
        return {
          image_url: result.secure_url,
          order_number: order,
          alt_text: `รูปที่ ${order}`,
        };
      })
    );

    if (uploadedImages.length > 0) {
      await prisma.store.update({
        where: { id: store.id },
        data: {
          images: {
            create: uploadedImages,
          },
        },
      });
    }

    const storeWithImages = await prisma.store.findUnique({
      where: { id: store.id },
      include: { images: true },
    });

    res.status(201).json({
      message: 'สร้างร้านค้าสำเร็จพร้อมอัปโหลดรูป',
      store: storeWithImages,
    });
  } catch (err) {
    console.error("🔥 CREATE STORE ERROR:", err);
    next(err);
  }
};

// ✅ READ: ร้านค้าทั้งหมด
export const getAllStores = async (req, res, next) => {
  try {
    const stores = await prisma.store.findMany({
      orderBy: { created_at: 'desc' },
      select: {
    id: true,
    name: true,
    address: true,
    description: true,
    social_links: true,
    category_id: true,
    is_active: true,
    order_number: true,
    created_at: true,
    updated_at: true,
    cover_image: true, // ✅ ✅ ✅ เพิ่มตรงนี้ครับ สำคัญสุด
    category: true,
    images: true,
    reviews: true,
    visitorCounter: true,
  },
    });
    res.json({ stores });
  } catch (err) {
    next(err);
  }
};

// ✅ READ: ร้านค้าเดี่ยว
export const getStoreById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const store = await prisma.store.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        address: true,
        description: true,
        social_links: true,
        category_id: true,
        order_number: true,
        cover_image: true, 
        created_at: true,
        updated_at: true,
        is_active: true,
        category: true,
        images: true,
        reviews: {
          include: {
            user: { select: { id: true, name: true } }
          }
        },
        visitorCounter: true,
      },
    });
    if (!store) return res.status(404).json({ message: 'ไม่พบร้านค้านี้' });
    res.json(store);
  } catch (err) {
    next(err);
  }
};


// ✅ UPDATE
export const updateStore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name = '',
      description = '',
      address = '',
      social_links = '',
      category_id = '',
      existing_image_orders = [],
    } = req.body;

    const categoryExists = await prisma.category.findUnique({ where: { id: category_id } });
    if (!categoryExists) return res.status(400).json({ message: 'ไม่พบ category ที่ระบุ' });

    const parsedOrders = Array.isArray(existing_image_orders)
      ? existing_image_orders.map((o) => JSON.parse(o))
      : [JSON.parse(existing_image_orders)];

    const uniqueOrderNumbers = new Set(parsedOrders.map((o) => `${o.order_number}`));
    if (uniqueOrderNumbers.size !== parsedOrders.length) {
      return res.status(400).json({ message: 'ลำดับรูปภาพซ้ำกัน กรุณาตรวจสอบอีกครั้ง' });
    }

    // ✅ อัปโหลด cover image ถ้ามีใหม่
    let coverImageUrl = null;
    if (req.files?.cover?.length > 0) {
      const result = await cloudinary.uploader.upload(req.files.cover[0].path, {
        folder: 'store-covers',
      });
      coverImageUrl = result.secure_url;
      await fs.unlink(req.files.cover[0].path);
    }

    await prisma.$transaction(async (tx) => {
      for (const { id: imageId } of parsedOrders) {
        await tx.image.update({
          where: { id: imageId },
          data: { order_number: -(Math.floor(Math.random() * 10000 + 1)) },
        });
      }

      for (const { id: imageId, order_number } of parsedOrders) {
        await tx.image.update({
          where: { id: imageId },
          data: { order_number: Number(order_number) },
        });
      }

      // ✅ อัปเดตร้าน + cover_image ถ้ามี
      await tx.store.update({
        where: { id },
        data: {
          name,
          description,
          address,
          social_links,
          category_id,
          ...(coverImageUrl && { cover_image: coverImageUrl }), // 👈 เพิ่มตรงนี้เพื่อไม่ overwrite ถ้าไม่มีไฟล์ใหม่
        },
      });
    });

    // ✅ อัปโหลดรูปใหม่เพิ่ม
    if (req.files?.images?.length > 0) {
      const maxOrder = await prisma.image.aggregate({
        where: { store_id: id },
        _max: { order_number: true },
      });

      let nextOrder = (maxOrder._max.order_number || 0) + 1;

      const newImages = await Promise.all(
        req.files.images.map(async (file, index) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'store-images',
          });
          await fs.unlink(file.path);
          return {
            image_url: result.secure_url,
            order_number: nextOrder++,
            alt_text: 'ภาพใหม่',
          };
        })
      );

      await prisma.store.update({
        where: { id },
        data: {
          images: { create: newImages },
        },
      });
    }

    const updatedStore = await prisma.store.findUnique({
      where: { id },
      include: { images: true },
    });

    res.json({ message: 'อัปเดตร้านค้าสำเร็จ', store: updatedStore });
  } catch (err) {
    next(err);
  }
};

// ✅ DELETE
export const deleteStore = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.store.delete({ where: { id } });
    res.json({ message: 'ลบร้านค้าสำเร็จ' });
  } catch (err) {
    next(err);
  }
};

// ✅ UPLOAD IMAGE (แยก)
export const uploadImages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const files = req.files;
    if (!files?.length)
      return res.status(400).json({ message: 'กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป' });

    const images = await Promise.all(
      files.map(async (file, index) => {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'store-images',
        });
        await fs.unlink(file.path);
        return {
          image_url: result.secure_url,
          order_number: index + 1,
          alt_text: `รูปภาพที่ ${index + 1}`,
        };
      })
    );

    const updated = await prisma.store.update({
      where: { id },
      data: {
        images: { create: images },
      },
      include: { images: true },
    });

    res.json({
      message: 'อัปโหลดรูปภาพสำเร็จ',
      images: updated.images,
      store: updated,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ SEARCH
// ✅ controllers/store.controller.js

export const searchStore = async (req, res, next) => {
  try {
    let { q } = req.query;
    if (!q) return res.status(400).json({ message: 'กรุณาระบุคำค้นหา เช่น ?q=อาหาร' });

    q = q.trim().toLowerCase();

    const stores = await prisma.store.findMany({
      include: {
        category: true,
        images: true,
        reviews: true,
      },
      orderBy: { created_at: 'desc' },
    });

    // ✅ ฟิลเตอร์โดยเช็คชื่อร้าน, คำอธิบาย และชื่อหมวดหมู่
    const filtered = stores.filter((store) => {
      const nameMatch = store.name?.toLowerCase().includes(q);
      const descMatch = store.description?.toLowerCase().includes(q);
      const categoryMatch = store.category?.name?.toLowerCase().includes(q);
      return nameMatch || descMatch || categoryMatch;
    });

    res.json({ stores: filtered });
  } catch (err) {
    next(err);
  }
};

// ✅ DELETE IMAGE
export const deleteStoreImage = async (req, res, next) => {
  try {
    const { imageId } = req.params;
    const image = await prisma.image.findUnique({ where: { id: imageId } });
    if (!image) return res.status(404).json({ message: 'ไม่พบรูปภาพที่ต้องการลบ' });

    const urlParts = image.image_url.split('/');
    const publicId = urlParts.slice(-2).join('/').replace(/\.[^/.]+$/, '');
    await cloudinary.uploader.destroy(publicId);

    await prisma.image.delete({ where: { id: imageId } });
    res.json({ message: 'ลบรูปภาพสำเร็จ' });
  } catch (err) {
    next(err);
  }
};

// ✅ UPDATE STORE ORDER
export const updateStoreOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category_id, order_number } = req.body;

    if (!category_id || order_number === undefined || order_number === null) {
      return res.status(400).json({ message: 'กรุณาระบุ category_id และ order_number' });
    }

    const store = await prisma.store.findUnique({ where: { id } });
    if (!store) return res.status(404).json({ message: 'ไม่พบร้านค้านี้' });

    const targetStore = await prisma.store.findFirst({
      where: {
        category_id,
        order_number: Number(order_number),
        id: { not: id },
      },
    });

    await prisma.$transaction(async (tx) => {
      if (targetStore) {
        // ✅ 1) ตั้งค่า temp (-1) ให้ targetStore เพื่อเลี่ยง unique constraint
        await tx.store.update({
          where: { id: targetStore.id },
          data: { order_number: -1 },
        });
      }

      // ✅ 2) อัปเดตร้านนี้ให้ใช้ order ใหม่
      await tx.store.update({
        where: { id },
        data: {
          order_number: Number(order_number),
        },
      });

      if (targetStore) {
        // ✅ 3) อัปเดต targetStore ให้ใช้ order เดิมของร้านนี้
        await tx.store.update({
          where: { id: targetStore.id },
          data: {
            order_number: store.order_number,
          },
        });
      }
    });

    res.json({ message: 'สลับลำดับร้านเรียบร้อยแล้ว' });
  } catch (err) {
    console.error("🔥 updateStoreOrder error:", err);
    if (err.code === 'P2002') {
      return res.status(400).json({
        message: 'มีร้านค้าในหมวดหมู่นี้ใช้ลำดับนี้อยู่แล้ว กรุณาเลือกลำดับใหม่',
      });
    }
    next(err);
  }
};
// ✅ Popular Stores
export const getPopularStores = async (req, res, next) => {
  try {
    const stores = await prisma.store.findMany({
      include: {
        category: true,
        images: true,
        reviews: true,
      }
    })

    const withAvgRating = stores
      .map((store) => {
        const total = store.reviews.length
        const avg = total > 0 ? store.reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0
        return { ...store, avg_rating: avg }
      })
      .filter((store) => store.avg_rating >= 5)
      .sort((a, b) => b.avg_rating - a.avg_rating)

    res.json({ stores: withAvgRating })
  } catch (err) {
    next(err)
  }
}
export const updateStoreCover = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "กรุณาอัปโหลดรูปภาพหน้าปกใหม่" });
    }

    // อัปโหลดภาพหน้าปกใหม่ไปยัง Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "store-covers",
    });

    // ลบไฟล์ชั่วคราว
    await fs.unlink(req.file.path);

    // อัปเดต cover_image ในฐานข้อมูล
    const updated = await prisma.store.update({
      where: { id },
      data: {
        cover_image: result.secure_url,
      },
    });

    res.json({ message: "อัปเดตรูปภาพหน้าปกเรียบร้อย", store: updated });
  } catch (err) {
    console.error("🔥 updateStoreCover error:", err);
    next(err);
  }
};

export const getExpiringSoonStores = async (req, res, next) => {
  try {
    const now = new Date();
    const next30Days = new Date();
    next30Days.setDate(now.getDate() + 30);

    const expiringStores = await prisma.store.findMany({
      where: {
        expired_at: {
          gte: now,
          lte: next30Days,
        },
        is_active: true,
      },
      select: {
        id: true,
        name: true,
        expired_at: true,
        category: { select: { name: true } },
      },
    });

    res.json({ stores: expiringStores });
  } catch (err) {
    next(err);
  }
};
// ✅ Reactivate Expired Store
export const reactivateStore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { new_expired_at } = req.body;

    if (!new_expired_at) {
      return res.status(400).json({ message: "กรุณาระบุวันหมดอายุใหม่" });
    }

    const store = await prisma.store.findUnique({ where: { id } });
    if (!store) return res.status(404).json({ message: "ไม่พบร้านค้านี้" });

    const updated = await prisma.store.update({
      where: { id },
      data: {
        is_active: true,
        expired_at: new Date(new_expired_at),
        renewal_count: { increment: 1 },
      },
    });

    res.json({ message: "เปิดใช้งานร้านอีกครั้งเรียบร้อย", store: updated });
  } catch (err) {
    next(err);
  }
};
export const getExpiredStores = async (req, res, next) => {
  try {
    const now = new Date();
    const expiredStores = await prisma.store.findMany({
      where: {
        expired_at: {
          lte: now,
        },
        is_active: false,
      },
      select: {
        id: true,
        name: true,
        expired_at: true,
        category: { select: { name: true } },
      },
    });

    res.json({ stores: expiredStores });
  } catch (err) {
    next(err);
  }
};

export const getStoreLoyaltyStats = async (req, res, next) => {
  try {
    const stores = await prisma.store.findMany({
      select: {
        id: true,
        name: true,
        created_at: true,
        renewal_count: true,
      },
    });

    const now = new Date();

    const data = stores.map((store) => {
      const diffYears = (now - store.created_at) / (1000 * 60 * 60 * 24 * 365.25);
      return {
        id: store.id,
        name: store.name,
        created_at: store.created_at,
        renewal_count: store.renewal_count,
        years_with_us: parseFloat(diffYears.toFixed(1)), // ✅ ระบุปี (ทศนิยม 1 ตำแหน่ง)
      };
    });

    res.json({ stores: data });
  } catch (err) {
    next(err);
  }
};