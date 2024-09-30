// controllers/FilesController.js

import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    
    // Verify if the token is valid
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    // Validate input data
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Check if parentId exists and is a folder (if parentId is not 0)
    if (parentId !== 0) {
      const parentFile = await dbClient.db.collection('files').findOne({ _id: parentId });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const fileData = {
      userId,
      name,
      type,
      isPublic,
      parentId,
    };

    if (type === 'folder') {
      // Insert folder into DB
      try {
        const result = await dbClient.db.collection('files').insertOne(fileData);
        return res.status(201).json({ id: result.insertedId, ...fileData });
      } catch (error) {
        console.error('Error creating folder:', error);
        return res.status(500).json({ error: 'Error creating folder' });
      }
    }

    // Create local file for type=file or type=image
    const fileUUID = uuidv4();
    const localPath = path.join(FOLDER_PATH, fileUUID);

    // Ensure the folder path exists
    try {
      if (!fs.existsSync(FOLDER_PATH)) {
        fs.mkdirSync(FOLDER_PATH, { recursive: true });
      }
    } catch (error) {
      console.error('Error creating directory:', error);
      return res.status(500).json({ error: 'Error creating directory' });
    }

    try {
      // Decode the base64 data and save it to the local path
      const fileContent = Buffer.from(data, 'base64');
      fs.writeFileSync(localPath, fileContent);

      // Add localPath to the file document and save in DB
      fileData.localPath = localPath;
      const result = await dbClient.db.collection('files').insertOne(fileData);

      return res.status(201).json({
        id: result.insertedId,
        ...fileData,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ error: 'Error uploading file' });
    }
  }
}

export default FilesController;
