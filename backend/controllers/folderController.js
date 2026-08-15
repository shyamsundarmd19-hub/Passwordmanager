const Folder = require('../models/Folder');
const Activity = require('../models/Activity');

exports.getFolders = async (req, res, next) => {
  try {
    const folders = await Folder.findByUserId(req.user.id);
    res.json({
      success: true,
      count: folders.length,
      folders
    });
  } catch (err) {
    next(err);
  }
};

exports.createFolder = async (req, res, next) => {
  try {
    const { folder_name, description } = req.body;

    if (!folder_name || !folder_name.trim()) {
      return res.status(400).json({ success: false, message: 'Folder name is required.' });
    }

    const folderId = await Folder.create({
      user_id: req.user.id,
      folder_name: folder_name.trim(),
      description: description ? description.trim() : null
    });

    await Activity.log(req.user.id, 'Created Folder', `Created new vault folder: ${folder_name}`);

    res.status(201).json({
      success: true,
      message: 'Folder created successfully.',
      id: folderId
    });
  } catch (err) {
    next(err);
  }
};

exports.updateFolder = async (req, res, next) => {
  try {
    const { folder_name, description } = req.body;
    const folder = await Folder.findById(req.params.id, req.user.id);
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found.' });
    }

    const updated = await Folder.update(req.params.id, req.user.id, {
      folder_name: folder_name ? folder_name.trim() : folder.folder_name,
      description: description !== undefined ? description : folder.description
    });

    await Activity.log(req.user.id, 'Updated Folder', `Renamed vault folder to: ${folder_name || folder.folder_name}`);

    res.json({
      success: true,
      message: 'Folder updated successfully.',
      folder: updated
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findById(req.params.id, req.user.id);
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found.' });
    }

    await Folder.delete(req.params.id, req.user.id);
    await Activity.log(req.user.id, 'Deleted Folder', `Removed vault folder: ${folder.folder_name}`);

    res.json({
      success: true,
      message: 'Folder deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};
