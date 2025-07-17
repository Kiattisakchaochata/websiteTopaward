import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// ✅ ตั้งค่าที่เก็บไฟล์ (temp-pic/) พร้อมตั้งชื่อใหม่แบบ UUID
const storage = multer.diskStorage({
  destination: 'temp-pic/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, uuidv4() + ext)
  },
})

// ✅ สร้าง instance หลักของ multer
const baseUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // จำกัดขนาดไฟล์ 5MB
  },
})

// ✅ Export หลายแบบให้รองรับทุกกรณี
export const upload = baseUpload; // กรณี .single() หรือ .array()
export const storeUpload = baseUpload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]);
export const storeUploadSingleCover = baseUpload.single("cover"); // ✅ เพิ่มอันนี้