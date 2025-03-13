const AWS = require('aws-sdk');

// Configure Digital Ocean Spaces
const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACE_ENDPOINT);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACE_ACCESS_KEY,
  secretAccessKey: process.env.DO_SPACE_SECRET_KEY,
});

/**
 * Upload an image to Digital Ocean Spaces
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Name of the file
 * @param {string} folder - Folder to upload to
 * @returns {Promise<Object>} - Upload response
 */
const uploadImage = async (fileBuffer, fileName, folder = 'team-management') => {
  try {
    const key = folder ? `${folder}/${fileName}` : fileName;
    
    const params = {
      Bucket: process.env.DO_SPACE_BUCKET,
      Key: key,
      Body: fileBuffer,
      ACL: 'public-read',
      ContentType: 'image/jpeg', // Adjust based on your needs or detect from file
    };

    const result = await s3.upload(params).promise();
    
    return {
      url: result.Location,
      key: result.Key,
    };
  } catch (error) {
    console.error('Error uploading to DO Spaces:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Delete an image from Digital Ocean Spaces
 * @param {string} key - Key of the file to delete
 * @returns {Promise<Object>} - Delete response
 */
const deleteImage = async (key) => {
  try {
    const params = {
      Bucket: process.env.DO_SPACE_BUCKET,
      Key: key,
    };

    const result = await s3.deleteObject(params).promise();
    return result;
  } catch (error) {
    console.error('Error deleting from DO Spaces:', error);
    throw new Error('Failed to delete image');
  }
};

module.exports = {
  uploadImage,
  deleteImage,
}; 