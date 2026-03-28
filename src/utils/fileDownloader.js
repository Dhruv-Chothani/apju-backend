import axios from 'axios';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const downloadImage = async (imageUrl) => {
  const response = await axios({
    url: imageUrl,
    method: 'GET',
    responseType: 'stream'
  });

  const ext = path.extname(imageUrl).split('?')[0] || '.jpg';
  const fileName = crypto.randomUUID() + ext;
  const filePath = path.join(uploadsDir, fileName);

  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(`/uploads/${fileName}`));
    writer.on('error', reject);
  });
};

export const deleteOldImage = (mediaUrl) => {
  if (!mediaUrl) return;

  const fileName = path.basename(mediaUrl);
  const filePath = path.join(uploadsDir, fileName);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
