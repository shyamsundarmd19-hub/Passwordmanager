const Password = require('../models/Password');
const Activity = require('../models/Activity');
const { encrypt, decrypt } = require('../utils/encryption');
const { generatePassword, evaluatePasswordStrength } = require('../utils/passwordGenerator');

exports.getPasswords = async (req, res, next) => {
  try {
    const { category, folder_id, favorite, search } = req.query;
    const rawPasswords = await Password.findAllByUser(req.user.id, {
      category,
      folder_id,
      favorite,
      search
    });

    // Process credentials for safe frontend view
    const passwords = rawPasswords.map(p => {
      let plainText = '';
      let strengthInfo = { score: 50, label: 'Medium' };

      try {
        plainText = decrypt(p.encrypted_password, p.iv, p.auth_tag);
        strengthInfo = evaluatePasswordStrength(plainText);
      } catch (err) {
        strengthInfo = { score: 30, label: 'Weak' };
      }

      return {
        id: p.id,
        service_name: p.service_name,
        username: p.username,
        website_url: p.website_url,
        category: p.category,
        folder_id: p.folder_id,
        folder_name: p.folder_name,
        notes: p.notes,
        favorite: Boolean(p.favorite),
        created_at: p.created_at,
        updated_at: p.updated_at,
        masked_password: '••••••••••••',
        strength_score: strengthInfo.score,
        strength_label: strengthInfo.label
      };
    });

    res.json({
      success: true,
      count: passwords.length,
      passwords
    });
  } catch (err) {
    next(err);
  }
};

exports.getPasswordById = async (req, res, next) => {
  try {
    const pwd = await Password.findById(req.params.id, req.user.id);
    if (!pwd) {
      return res.status(404).json({ success: false, message: 'Credential not found.' });
    }

    let plainText = '';
    let strengthInfo = { score: 50, label: 'Medium' };

    try {
      plainText = decrypt(pwd.encrypted_password, pwd.iv, pwd.auth_tag);
      strengthInfo = evaluatePasswordStrength(plainText);
    } catch (err) {
      strengthInfo = { score: 30, label: 'Weak' };
    }

    res.json({
      success: true,
      password: {
        id: pwd.id,
        service_name: pwd.service_name,
        username: pwd.username,
        website_url: pwd.website_url,
        category: pwd.category,
        folder_id: pwd.folder_id,
        folder_name: pwd.folder_name,
        notes: pwd.notes,
        favorite: Boolean(pwd.favorite),
        created_at: pwd.created_at,
        updated_at: pwd.updated_at,
        strength_score: strengthInfo.score,
        strength_label: strengthInfo.label,
        masked_password: '••••••••••••'
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.revealPassword = async (req, res, next) => {
  try {
    const pwd = await Password.findById(req.params.id, req.user.id);
    if (!pwd) {
      return res.status(404).json({ success: false, message: 'Credential not found.' });
    }

    const decryptedPassword = decrypt(pwd.encrypted_password, pwd.iv, pwd.auth_tag);
    await Activity.log(req.user.id, 'Revealed Credential', `Revealed password for ${pwd.service_name} (${pwd.username})`);

    res.json({
      success: true,
      id: pwd.id,
      service_name: pwd.service_name,
      decrypted_password: decryptedPassword
    });
  } catch (err) {
    next(err);
  }
};

exports.createPassword = async (req, res, next) => {
  try {
    const {
      service_name,
      username,
      password,
      website_url,
      category,
      folder_id,
      notes,
      favorite
    } = req.body;

    if (!service_name || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Service Name, Username/Email, and Password are required fields.'
      });
    }

    // Encrypt password using AES-256-GCM
    const { ciphertext, iv, authTag } = encrypt(password);

    const newId = await Password.create({
      user_id: req.user.id,
      folder_id: folder_id ? parseInt(folder_id, 10) : null,
      service_name: service_name.trim(),
      username: username.trim(),
      encrypted_password: ciphertext,
      iv,
      auth_tag: authTag,
      website_url: website_url ? website_url.trim() : null,
      category: category || 'Work',
      notes: notes ? notes.trim() : null,
      favorite: Boolean(favorite)
    });

    await Activity.log(req.user.id, 'Added Credential', `Stored new credential for ${service_name} (${username})`);

    res.status(201).json({
      success: true,
      message: 'Credential securely saved to vault.',
      id: newId
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const id = req.params.id;
    const existing = await Password.findById(id, req.user.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Credential not found.' });
    }

    const {
      service_name,
      username,
      password,
      website_url,
      category,
      folder_id,
      notes,
      favorite
    } = req.body;

    let encData = {};
    if (password && password.trim() !== '') {
      const { ciphertext, iv, authTag } = encrypt(password.trim());
      encData = {
        encrypted_password: ciphertext,
        iv,
        auth_tag: authTag
      };
    }

    await Password.update(id, req.user.id, {
      folder_id: folder_id ? parseInt(folder_id, 10) : null,
      service_name: service_name ? service_name.trim() : existing.service_name,
      username: username ? username.trim() : existing.username,
      website_url: website_url !== undefined ? website_url : existing.website_url,
      category: category || existing.category,
      notes: notes !== undefined ? notes : existing.notes,
      favorite: favorite !== undefined ? Boolean(favorite) : Boolean(existing.favorite),
      ...encData
    });

    await Activity.log(req.user.id, 'Updated Credential', `Updated credential settings for ${service_name || existing.service_name}`);

    res.json({
      success: true,
      message: 'Credential successfully updated.'
    });
  } catch (err) {
    next(err);
  }
};

exports.toggleFavorite = async (req, res, next) => {
  try {
    const isFav = await Password.toggleFavorite(req.params.id, req.user.id);
    res.json({
      success: true,
      favorite: Boolean(isFav)
    });
  } catch (err) {
    next(err);
  }
};

exports.deletePassword = async (req, res, next) => {
  try {
    const existing = await Password.findById(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Credential not found.' });
    }

    await Password.delete(req.params.id, req.user.id);
    await Activity.log(req.user.id, 'Deleted Credential', `Deleted credential record for ${existing.service_name}`);

    res.json({
      success: true,
      message: 'Credential deleted from vault.'
    });
  } catch (err) {
    next(err);
  }
};

exports.generatePasswordHandler = (req, res) => {
  const { length, uppercase, lowercase, numbers, symbols } = req.query;

  const generated = generatePassword({
    length: length ? parseInt(length, 10) : 16,
    uppercase: uppercase !== 'false',
    lowercase: lowercase !== 'false',
    numbers: numbers !== 'false',
    symbols: symbols !== 'false'
  });

  const strength = evaluatePasswordStrength(generated);

  res.json({
    success: true,
    password: generated,
    strength_score: strength.score,
    strength_label: strength.label
  });
};

exports.getSecurityMetrics = async (req, res, next) => {
  try {
    const rawPasswords = await Password.findAllByUser(req.user.id);

    let totalCount = rawPasswords.length;
    let strongCount = 0;
    let mediumCount = 0;
    let weakCount = 0;
    const passwordHashMap = {};
    let reusedCount = 0;

    rawPasswords.forEach(p => {
      let plainText = '';
      try {
        plainText = decrypt(p.encrypted_password, p.iv, p.auth_tag);
      } catch (e) {
        plainText = 'weak';
      }

      if (plainText) {
        passwordHashMap[plainText] = (passwordHashMap[plainText] || 0) + 1;
      }

      const str = evaluatePasswordStrength(plainText);
      if (str.score >= 70) {
        strongCount++;
      } else if (str.score >= 40) {
        mediumCount++;
      } else {
        weakCount++;
      }
    });

    Object.values(passwordHashMap).forEach(count => {
      if (count > 1) {
        reusedCount += (count - 1);
      }
    });

    let overallScore = 100;
    if (totalCount > 0) {
      const deductionPerWeak = (weakCount / totalCount) * 40;
      const deductionPerMedium = (mediumCount / totalCount) * 15;
      const deductionPerReused = Math.min(30, reusedCount * 10);
      overallScore = Math.max(20, Math.round(100 - deductionPerWeak - deductionPerMedium - deductionPerReused));
    }

    res.json({
      success: true,
      metrics: {
        total_credentials: totalCount,
        strong_passwords: strongCount,
        medium_passwords: mediumCount,
        weak_passwords: weakCount,
        reused_passwords: reusedCount,
        favorites_count: rawPasswords.filter(p => p.favorite).length,
        security_score: overallScore
      }
    });
  } catch (err) {
    next(err);
  }
};
