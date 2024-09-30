// controllers/FilesController.js

import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import fs from 'fs';
import path from 'path';

class FilesController {
  // Method to handle file upload
  static async postUpload(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get user ID from Redis using the token
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { name, type, parentId = 0, isPublic = false, data } = req.body;

      // Validate inputs
      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }

      if (!['folder', 'file', 'image'].includes(type)) {
        return res.status(400).json({ error: 'Missing type' });
      }

      if (type !== 'folder' && !data) {
        return res.status(400).json({ error: 'Missing data' });
      }

      // Handle parentId
      let parentObjectId = null;
      if (parentId !== 0) {
        parentObjectId = new ObjectId(parentId);
        const parentFile = await dbClient.db.collection('files').findOne({ _id: parentObjectId });
        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }
        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      const fileDocument = {
        userId: new ObjectId(userId),
        name,
        type,
        isPublic,
        parentId: parentObjectId ? parentObjectId : 0,
      };

      // If the type is folder, create folder entry and return
      if (type === 'folder') {
        const result = await dbClient.db.collection('files').insertOne(fileDocument);
        return res.status(201).json({
          id: result.insertedId,
          userId,
          name,
          type,
          isPublic,
          parentId,
        });
      }

      // Define the folder path and ensure it exists
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // Generate a UUID for the file and create its local path
      const fileUuid = uuidv4();
      const localPath = path.join(folderPath, fileUuid);

      // Decode base64 and save file locally
      const fileBuffer = Buffer.from(data, 'base64');
      fs.writeFileSync(localPath, fileBuffer);

      // Add localPath to the file document and save it in the database
      fileDocument.localPath = localPath;
      const result = await dbClient.db.collection('files').insertOne(fileDocument);

      return res.status(201).json({
        id: result.insertedId,
        userId,
        name,
        type,
        isPublic,
        parentId,
        localPath,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default FilesController;
